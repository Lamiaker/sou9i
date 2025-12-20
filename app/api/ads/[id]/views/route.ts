import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdService } from '@/services';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;

        // 1. Récupérer l'annonce pour connaître le propriétaire
        const ad = await prisma.ad.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!ad) {
            return NextResponse.json({ success: false, error: 'Annonce non trouvée' }, { status: 404 });
        }

        // 2. Vérifier la session
        const session = await getServerSession(authOptions);

        // Si c'est le vendeur qui regarde sa propre annonce, on n'incrémente pas
        if (session?.user?.id === ad.userId) {
            return NextResponse.json({
                success: true,
                message: 'Vue ignorée (propriétaire)'
            });
        }

        // 3. Logique de Cookie pour éviter le spam de vues (Cooldown 24h)
        const cookieStore = request.cookies;
        const viewedCookie = cookieStore.get(`viewed_${id}`);

        if (viewedCookie) {
            return NextResponse.json({
                success: true,
                message: 'Vue ignorée (déjà comptée récemment)'
            });
        }

        // 4. Incrémenter si tout est OK
        await AdService.incrementViews(id);

        // 5. Poser un cookie pour cet ad spécifique (expire dans 24h)
        const response = NextResponse.json({
            success: true,
            message: 'Vue incrémentée',
        });

        response.cookies.set(`viewed_${id}`, 'true', {
            maxAge: 60 * 60 * 24, // 24 heures en secondes
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return response;

    } catch (error) {
        console.error('Error incrementing views:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de l\'incrémentation des vues'
            },
            { status: 500 }
        );
    }
}
