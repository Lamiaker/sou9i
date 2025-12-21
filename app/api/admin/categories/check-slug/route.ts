import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Check if a category slug already exists
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const excludeId = searchParams.get('excludeId'); // Pour exclure la catégorie en cours d'édition

        if (!slug) {
            return NextResponse.json({ error: 'Slug requis' }, { status: 400 });
        }

        const existingCategory = await prisma.category.findFirst({
            where: {
                slug,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });

        return NextResponse.json({
            exists: !!existingCategory,
            slug,
        });
    } catch (error) {
        console.error('Check slug error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
