import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserService } from '@/services';
import { unlink } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';

// ✅ SÉCURITÉ: Schéma de validation robuste avec Zod
const profileUpdateSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100).optional(),
    email: z.string().email('Email invalide').optional(),
    phone: z.string().regex(/^(05|06|07)(?:[ ]?[0-9]){8}$/, 'Numéro de téléphone invalide').optional().or(z.literal('')),
    city: z.string().min(2, 'La ville doit contenir au moins 2 caractères').max(100).optional(),
    avatar: z.string().optional(),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Vous devez être connecté' },
                { status: 401 }
            );
        }

        const user = await UserService.getUserById(session.user.id);

        if (!user) {
            return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        logServerError(error, { route: '/api/user/profile', action: 'get_profile' });
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Vous devez être connecté pour modifier votre profil' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // ✅ SÉCURITÉ: Validation avec Zod
        const validation = profileUpdateSchema.safeParse(body);
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || 'Données invalides';
            return NextResponse.json(
                { success: false, error: firstError },
                { status: 400 }
            );
        }

        const validatedData = validation.data;

        // Préparer les données de mise à jour
        const dataToUpdate: any = {};

        if (validatedData.name !== undefined) dataToUpdate.name = validatedData.name;

        if (validatedData.email !== undefined) {
            // Vérifier unicité de l'email
            const existingUser = await prisma.user.findUnique({
                where: { email: validatedData.email },
            });

            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json(
                    { success: false, error: 'Cet email est déjà utilisé' },
                    { status: 409 }
                );
            }
            dataToUpdate.email = validatedData.email;
        }

        if (validatedData.phone !== undefined) dataToUpdate.phone = validatedData.phone;
        if (validatedData.city !== undefined) dataToUpdate.city = validatedData.city;

        // Gestion de l'avatar et suppression de l'ancien si nécessaire
        if (validatedData.avatar !== undefined) {
            const currentUser = await UserService.getUserById(session.user.id);

            if (currentUser && currentUser.avatar && currentUser.avatar !== validatedData.avatar) {
                // Ne supprimer que les images uploadées (pas l'image par défaut /user.png)
                // Supporte les deux dossiers : /uploads/avatars/ et /uploads/ads/
                if (currentUser.avatar.startsWith('/uploads/')) {
                    try {
                        const relativePath = currentUser.avatar.substring(1);
                        const filePath = path.join(process.cwd(), 'public', relativePath);

                        await unlink(filePath);
                    } catch (err: any) {
                        // On ignore l'erreur si le fichier n'existe pas (ENOENT)
                        if (err.code !== 'ENOENT') {
                            logServerError(err, { route: '/api/user/profile', action: 'delete_old_avatar' });
                        }
                    }
                }
            }
            dataToUpdate.avatar = validatedData.avatar;
        }

        // Mise à jour via le Service
        const updatedUser = await UserService.updateUser(session.user.id, dataToUpdate);

        return NextResponse.json({
            success: true,
            data: updatedUser
        });

    } catch (error) {
        logServerError(error, { route: '/api/user/profile', action: 'update_profile' });
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}

