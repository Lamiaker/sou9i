import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';

// Create category
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, icon, description, parentId } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Nom et slug requis' }, { status: 400 });
        }

        const category = await AdminService.createCategory({
            name,
            slug,
            icon: icon || undefined,
            description: description || undefined,
            parentId: parentId || undefined,
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Update category
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const body = await request.json();
        const { categoryId, name, slug, icon, description, order } = body;

        if (!categoryId) {
            return NextResponse.json({ error: 'ID catégorie requis' }, { status: 400 });
        }

        const category = await AdminService.updateCategory(categoryId, {
            name,
            slug,
            icon,
            description,
            order,
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Delete category
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const body = await request.json();
        const { categoryId } = body;

        if (!categoryId) {
            return NextResponse.json({ error: 'ID catégorie requis' }, { status: 400 });
        }

        await AdminService.deleteCategory(categoryId);

        return NextResponse.json({ success: true, message: 'Catégorie supprimée' });
    } catch (error: any) {
        console.error('Delete category error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: error.message?.includes('annonce') ? 400 : 500 }
        );
    }
}
