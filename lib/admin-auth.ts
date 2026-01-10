
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { Admin, AdminPermission } from '@prisma/client';

// ============================================
// CONFIGURATION
// ============================================

const ADMIN_SESSION_COOKIE = 'admin-session';
const SESSION_DURATION_HOURS = 8;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const BCRYPT_ROUNDS = 12;

// ============================================
// TYPES
// ============================================

export interface AdminSessionData {
    admin: {
        id: string;
        email: string;
        name: string;
        permissions: AdminPermission[];
        isSuperAdmin: boolean;
    };
    sessionId: string;
    expiresAt: Date;
}

export interface LoginResult {
    success: boolean;
    error?: string;
    admin?: AdminSessionData['admin'];
}

// ============================================
// UTILITAIRES CRYPTOGRAPHIQUES
// ============================================

function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}


async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ============================================
// GESTION DES SESSIONS
// ============================================


async function createAdminSession(
    adminId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<string> {
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

    await prisma.adminSession.deleteMany({
        where: {
            OR: [
                { adminId, expiresAt: { lt: new Date() } },
                { adminId }
            ]
        }
    });

    await prisma.adminSession.create({
        data: {
            adminId,
            tokenHash,
            expiresAt,
            ipAddress,
            userAgent,
        }
    });
    await prisma.admin.update({
        where: { id: adminId },
        data: {
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress,
            failedAttempts: 0,
            lockedUntil: null,
        }
    });

    return token;
}


export async function getAdminSession(): Promise<AdminSessionData | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

        if (!token) {
            return null;
        }

        const tokenHash = hashToken(token);

        const session = await prisma.adminSession.findUnique({
            where: { tokenHash },
            include: {
                admin: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        permissions: true,
                        isSuperAdmin: true,
                        isActive: true,
                    }
                }
            }
        });

        // Vérifications de validité
        if (!session) {
            return null;
        }

        if (session.expiresAt < new Date()) {
            // Session expirée, la supprimer
            await prisma.adminSession.delete({ where: { id: session.id } });
            return null;
        }

        if (!session.admin.isActive) {
            // Admin désactivé, supprimer toutes ses sessions
            await prisma.adminSession.deleteMany({ where: { adminId: session.adminId } });
            return null;
        }

        return {
            admin: {
                id: session.admin.id,
                email: session.admin.email,
                name: session.admin.name,
                permissions: session.admin.permissions,
                isSuperAdmin: session.admin.isSuperAdmin,
            },
            sessionId: session.id,
            expiresAt: session.expiresAt,
        };
    } catch (error) {
        console.error('Error getting admin session:', error);
        return null;
    }
}

/**
 * Vérifie si l'admin a une permission spécifique
 */
export function hasPermission(
    admin: AdminSessionData['admin'],
    permission: AdminPermission
): boolean {
    // Super admin a toutes les permissions
    if (admin.isSuperAdmin) {
        return true;
    }
    return admin.permissions.includes(permission);
}

/**
 * Vérifie si l'admin a au moins une des permissions spécifiées
 */
export function hasAnyPermission(
    admin: AdminSessionData['admin'],
    permissions: AdminPermission[]
): boolean {
    if (admin.isSuperAdmin) {
        return true;
    }
    return permissions.some(p => admin.permissions.includes(p));
}

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Authentifie un administrateur
 */
export async function loginAdmin(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
): Promise<LoginResult> {
    try {
        // Récupérer l'admin
        const admin = await prisma.admin.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                permissions: true,
                isSuperAdmin: true,
                isActive: true,
                failedAttempts: true,
                lockedUntil: true,
            }
        });

        // Admin inexistant (message générique pour sécurité)
        if (!admin) {
            return { success: false, error: 'Identifiants invalides' };
        }

        // Vérifier si le compte est verrouillé
        if (admin.lockedUntil && admin.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
            return {
                success: false,
                error: `Compte temporairement verrouillé. Réessayez dans ${minutesLeft} minutes.`
            };
        }

        // Vérifier si le compte est actif
        if (!admin.isActive) {
            return { success: false, error: 'Ce compte administrateur est désactivé' };
        }

        // Vérifier le mot de passe
        const isValidPassword = await verifyPassword(password, admin.password);

        if (!isValidPassword) {
            // Incrémenter les tentatives échouées
            const newFailedAttempts = admin.failedAttempts + 1;
            const updateData: any = { failedAttempts: newFailedAttempts };

            // Verrouiller après MAX_FAILED_ATTEMPTS
            if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);

                // Log de sécurité
                await logAdminAudit({
                    adminId: admin.id,
                    action: 'ACCOUNT_LOCKED',
                    details: { reason: 'Too many failed login attempts', ipAddress },
                    ipAddress,
                    userAgent,
                });
            }

            await prisma.admin.update({
                where: { id: admin.id },
                data: updateData,
            });

            return { success: false, error: 'Identifiants invalides' };
        }

        // Créer la session
        const token = await createAdminSession(admin.id, ipAddress, userAgent);

        // Définir le cookie
        const cookieStore = await cookies();
        cookieStore.set(ADMIN_SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: SESSION_DURATION_HOURS * 60 * 60,
        });

        // Log de connexion
        await logAdminAudit({
            adminId: admin.id,
            action: 'ADMIN_LOGIN',
            ipAddress,
            userAgent,
        });

        return {
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                permissions: admin.permissions,
                isSuperAdmin: admin.isSuperAdmin,
            }
        };
    } catch (error) {
        console.error('Admin login error:', error);
        return { success: false, error: 'Une erreur est survenue' };
    }
}

/**
 * Déconnecte l'administrateur courant
 */
export async function logoutAdmin(): Promise<void> {
    try {
        const session = await getAdminSession();

        if (session) {
            // Supprimer la session de la base
            await prisma.adminSession.delete({
                where: { id: session.sessionId }
            }).catch(() => { });

            // Log de déconnexion
            await logAdminAudit({
                adminId: session.admin.id,
                action: 'ADMIN_LOGOUT',
            });
        }

        // Supprimer le cookie
        const cookieStore = await cookies();
        cookieStore.delete(ADMIN_SESSION_COOKIE);
    } catch (error) {
        console.error('Admin logout error:', error);
        // S'assurer que le cookie est supprimé même en cas d'erreur
        const cookieStore = await cookies();
        cookieStore.delete(ADMIN_SESSION_COOKIE);
    }
}

/**
 * Invalide toutes les sessions d'un admin
 */
export async function invalidateAllAdminSessions(adminId: string): Promise<void> {
    await prisma.adminSession.deleteMany({
        where: { adminId }
    });
}

// ============================================
// AUDIT LOGGING
// ============================================

interface AuditLogData {
    adminId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Enregistre une action admin dans le journal d'audit
 */
export async function logAdminAudit(data: AuditLogData): Promise<void> {
    try {
        await prisma.adminAuditLog.create({
            data: {
                adminId: data.adminId,
                action: data.action,
                targetType: data.targetType,
                targetId: data.targetId,
                details: data.details,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            }
        });
    } catch (error) {
        console.error('Failed to log admin audit:', error);
        // Ne pas faire échouer l'action principale si le log échoue
    }
}

// ============================================
// UTILITAIRES POUR MIDDLEWARE
// ============================================

/**
 * Vérifie un token de session (pour usage dans middleware Edge)
 * Note: Cette fonction utilise Web Crypto API compatible Edge
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
    try {
        // Hash avec Web Crypto pour compatibilité Edge
        const encoder = new TextEncoder();
        const data = encoder.encode(token);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Vérification en base
        const session = await prisma.adminSession.findUnique({
            where: { tokenHash },
            select: {
                expiresAt: true,
                admin: {
                    select: { isActive: true }
                }
            }
        });

        if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

// ============================================
// GESTION DES ADMINS
// ============================================

/**
 * Crée un nouvel administrateur (réservé aux super-admins)
 */
export async function createAdmin(data: {
    email: string;
    password: string;
    name: string;
    permissions: AdminPermission[];
    createdById?: string;
}): Promise<Admin> {
    const hashedPassword = await hashPassword(data.password);

    return prisma.admin.create({
        data: {
            email: data.email.toLowerCase().trim(),
            password: hashedPassword,
            name: data.name,
            permissions: data.permissions,
            createdById: data.createdById,
        }
    });
}

/**
 * Crée le premier super-admin (à utiliser une seule fois)
 */
export async function createFirstSuperAdmin(data: {
    email: string;
    password: string;
    name: string;
}): Promise<Admin | null> {
    // Vérifier qu'aucun admin n'existe
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
        throw new Error('Un administrateur existe déjà. Utilisez le système de gestion des admins.');
    }

    const hashedPassword = await hashPassword(data.password);

    return prisma.admin.create({
        data: {
            email: data.email.toLowerCase().trim(),
            password: hashedPassword,
            name: data.name,
            isSuperAdmin: true,
            permissions: Object.values(AdminPermission) as AdminPermission[],
        }
    });
}
