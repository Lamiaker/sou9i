import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/categoryService';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const skip = parseInt(searchParams.get('skip') || '0', 10);
        const take = parseInt(searchParams.get('take') || '4', 10);

        const result = await CategoryService.getCategoriesWithAds({ skip, take });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Erreur récupération catégories avec annonces:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des catégories' },
            { status: 500 }
        );
    }
}
