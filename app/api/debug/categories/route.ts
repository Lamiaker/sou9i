import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Test simple : récupérer toutes les catégories avec leur slug
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 20,
        });

        return NextResponse.json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}
