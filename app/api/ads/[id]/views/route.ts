import { NextRequest, NextResponse } from 'next/server';
import { AdService } from '@/services';

// POST /api/ads/[id]/views - Incrémenter les vues d'une annonce
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;

        await AdService.incrementViews(id);

        return NextResponse.json({
            success: true,
            message: 'Vue incrémentée',
        });
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
