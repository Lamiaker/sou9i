import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const excludeId = searchParams.get('excludeId');

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


