import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        console.log('Testing slug:', slug);

        // Test 1: Simple findUnique without relations
        const category = await prisma.category.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json({
                success: false,
                error: 'Category not found',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}
