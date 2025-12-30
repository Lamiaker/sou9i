import { prisma } from '@/lib/prisma';
import { generateSecureToken, hashToken, getExpirationDate, isExpired } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { UserService } from '@/services';

// Durée de validité du token en heures
const TOKEN_EXPIRY_HOURS = 1;

// Délai minimum entre deux demandes de reset (en minutes)
const MIN_REQUEST_INTERVAL_MINUTES = 2;

export class PasswordResetService {
    /**
     * Demande de réinitialisation de mot de passe
     * Génère un token, le stocke (hashé) et envoie l'email
     * @returns Toujours un succès pour éviter l'énumération des comptes
     */
    static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
        const normalizedEmail = email.toLowerCase().trim();

        try {
            // 1. Vérifier si l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { email: normalizedEmail },
                select: { id: true, email: true, isBanned: true },
            });

            // Si l'utilisateur n'existe pas ou est banni, on retourne quand même un succès
            // pour éviter l'énumération des comptes
            if (!user) {
                console.log(`[PasswordReset] Email non trouvé: ${normalizedEmail}`);
                return {
                    success: true,
                    message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
                };
            }

            if (user.isBanned) {
                console.log(`[PasswordReset] Utilisateur banni tente un reset: ${normalizedEmail}`);
                return {
                    success: true,
                    message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
                };
            }

            // 2. Vérifier le rate limiting (une demande toutes les X minutes max)
            const recentToken = await prisma.passwordResetToken.findFirst({
                where: {
                    email: normalizedEmail,
                    createdAt: {
                        gte: new Date(Date.now() - MIN_REQUEST_INTERVAL_MINUTES * 60 * 1000),
                    },
                },
            });

            if (recentToken) {
                console.log(`[PasswordReset] Rate limit atteint pour: ${normalizedEmail}`);
                return {
                    success: false,
                    message: `Veuillez patienter ${MIN_REQUEST_INTERVAL_MINUTES} minutes avant de faire une nouvelle demande.`,
                };
            }

            // 3. Supprimer les anciens tokens de cet utilisateur
            await prisma.passwordResetToken.deleteMany({
                where: { email: normalizedEmail },
            });

            // 4. Générer un nouveau token
            const token = generateSecureToken();
            const hashedToken = hashToken(token);
            const expiresAt = getExpirationDate(TOKEN_EXPIRY_HOURS);

            // 5. Stocker le token hashé
            await prisma.passwordResetToken.create({
                data: {
                    email: normalizedEmail,
                    token: hashedToken,
                    expiresAt,
                },
            });

            // 6. Envoyer l'email avec le token NON hashé
            const emailResult = await sendPasswordResetEmail(normalizedEmail, token);

            if (!emailResult.success) {
                console.error(`[PasswordReset] Erreur envoi email à ${normalizedEmail}:`, emailResult.error);
                // Ne pas révéler l'erreur d'envoi
                return {
                    success: true,
                    message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
                };
            }

            console.log(`[PasswordReset] Email envoyé avec succès à: ${normalizedEmail}`);
            return {
                success: true,
                message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
            };

        } catch (error) {
            console.error('[PasswordReset] Erreur:', error);
            return {
                success: false,
                message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
            };
        }
    }

    /**
     * Vérifie si un token est valide (existe et non expiré)
     */
    static async verifyToken(token: string): Promise<{ valid: boolean; email?: string }> {
        try {
            const hashedToken = hashToken(token);

            const resetToken = await prisma.passwordResetToken.findUnique({
                where: { token: hashedToken },
            });

            if (!resetToken) {
                return { valid: false };
            }

            if (isExpired(resetToken.expiresAt)) {
                // Supprimer le token expiré
                await prisma.passwordResetToken.delete({
                    where: { id: resetToken.id },
                });
                return { valid: false };
            }

            return { valid: true, email: resetToken.email };

        } catch (error) {
            console.error('[PasswordReset] Erreur vérification token:', error);
            return { valid: false };
        }
    }

    /**
     * Réinitialise le mot de passe avec un token valide
     */
    static async resetPassword(
        token: string,
        newPassword: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            // 1. Vérifier le token
            const verification = await this.verifyToken(token);

            if (!verification.valid || !verification.email) {
                return {
                    success: false,
                    message: 'Ce lien est invalide ou a expiré. Veuillez faire une nouvelle demande.',
                };
            }

            // 2. Hasher le nouveau mot de passe
            const hashedPassword = await UserService.hashPassword(newPassword);

            // 3. Mettre à jour le mot de passe
            await prisma.user.update({
                where: { email: verification.email },
                data: { password: hashedPassword },
            });

            // 4. Supprimer le token (usage unique)
            const hashedToken = hashToken(token);
            await prisma.passwordResetToken.delete({
                where: { token: hashedToken },
            });

            console.log(`[PasswordReset] Mot de passe réinitialisé pour: ${verification.email}`);

            return {
                success: true,
                message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
            };

        } catch (error) {
            console.error('[PasswordReset] Erreur reset password:', error);
            return {
                success: false,
                message: 'Une erreur est survenue. Veuillez réessayer.',
            };
        }
    }

    /**
     * Nettoie les tokens expirés (à appeler via cron job ou manuellement)
     */
    static async cleanupExpiredTokens(): Promise<number> {
        const result = await prisma.passwordResetToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        console.log(`[PasswordReset] ${result.count} tokens expirés supprimés`);
        return result.count;
    }
}
