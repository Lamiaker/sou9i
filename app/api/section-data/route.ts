import { NextRequest, NextResponse } from 'next/server';
import { getSectionData } from '@/lib/fetchers';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { error: 'Le paramètre slug est requis' },
                { status: 400 }
            );
        }

        const products = await getSectionData(slug);

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Erreur récupération données section:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des données' },
            { status: 500 }
        );
    }
}


