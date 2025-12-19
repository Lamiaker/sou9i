import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserService } from '@/services';
import { unlink } from 'fs/promises';
import path from 'path';

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
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
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

        // Préparer les données de mise à jour
        const dataToUpdate: any = {};

        if (body.name !== undefined) dataToUpdate.name = body.name;

        if (body.email !== undefined) {
            // Validation format
            if (!String(body.email).includes('@')) {
                return NextResponse.json(
                    { success: false, error: 'Email invalide' },
                    { status: 400 }
                );
            }

            // Vérifier unicité (pas géré par UserService.updateUser par défaut)
            // On le fait manuellement ici ou on pourrait ajouter une méthode au service
            const existingUser = await prisma.user.findUnique({
                where: { email: body.email },
            });

            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json(
                    { success: false, error: 'Cet email est déjà utilisé' },
                    { status: 409 }
                );
            }
            dataToUpdate.email = body.email;
        }

        if (body.phone !== undefined) dataToUpdate.phone = body.phone;
        if (body.city !== undefined) dataToUpdate.city = body.city;

        // Gestion de l'avatar et suppression de l'ancien si nécessaire
        if (body.avatar !== undefined) {
            const currentUser = await UserService.getUserById(session.user.id);

            if (currentUser && currentUser.avatar && currentUser.avatar !== body.avatar) {
                // Si l'ancien avatar est stocké localement
                if (currentUser.avatar.startsWith('/uploads/')) {
                    try {
                        // Retirer le slash initial pour path.join
                        const relativePath = currentUser.avatar.startsWith('/')
                            ? currentUser.avatar.substring(1)
                            : currentUser.avatar;

                        const filePath = path.join(process.cwd(), 'public', relativePath);

                        await unlink(filePath);
                        console.log(`Ancien avatar supprimé: ${filePath}`);
                    } catch (err: any) {
                        // On ignore l'erreur si le fichier n'existe pas (ENOENT)
                        if (err.code !== 'ENOENT') {
                            console.error("Erreur suppression ancienne image:", err);
                        }
                    }
                }
            }
            dataToUpdate.avatar = body.avatar;
        }

        // Mise à jour via le Service
        const updatedUser = await UserService.updateUser(session.user.id, dataToUpdate);

        return NextResponse.json({
            success: true,
            data: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
            { status: 500 }
        );
    }
}
