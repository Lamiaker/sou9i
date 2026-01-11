import { NextResponse } from 'next/server';
import { getCachedTrendingCategories } from '@/lib/cache';

export async function GET() {
    try {
        const trendingCategories = await getCachedTrendingCategories();

        return NextResponse.json({
            success: true,
            categories: trendingCategories,
        });
    } catch (error) {
        console.error('Erreur récupération tendances:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la récupération des tendances' },
            { status: 500 }
        );
    }
}


