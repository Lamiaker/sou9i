import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';
import { revalidatePath } from 'next/cache';

// Helper function to revalidate all category-related pages
function revalidateCategoryPages(slug?: string) {
    revalidatePath('/');                    // Homepage
    revalidatePath('/categories');          // Categories list page
    revalidatePath('/categories/[slug]', 'page'); // All category pages
    if (slug) {
        revalidatePath(`/categories/${slug}`); // Specific category page
    }
}

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

        // Revalidate pages to show new category
        revalidateCategoryPages(slug);

        return NextResponse.json({ success: true, category });
    } catch (error: any) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: error.message?.includes('existe') ? 400 : 500 }
        );
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
        const { categoryId, name, slug, icon, description, parentId, order } = body;

        if (!categoryId) {
            return NextResponse.json({ error: 'ID catégorie requis' }, { status: 400 });
        }

        const category = await AdminService.updateCategory(categoryId, {
            name,
            slug,
            icon,
            description,
            parentId,
            order,
        });

        // Revalidate pages to show updated category
        revalidateCategoryPages(slug);

        return NextResponse.json({ success: true, category });
    } catch (error: any) {
        console.error('Update category error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: error.message?.includes('existe') ? 400 : 500 }
        );
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
        const { categoryId, forceDelete } = body;

        if (!categoryId) {
            return NextResponse.json({ error: 'ID catégorie requis' }, { status: 400 });
        }

        // Si forceDelete est true, supprimer avec les annonces
        if (forceDelete) {
            const result = await AdminService.deleteCategoryWithAds(categoryId);

            // Revalidate all pages after deletion
            revalidateCategoryPages();

            return NextResponse.json({
                success: true,
                message: result.message,
                deletedAdsCount: result.deletedAdsCount
            });
        }

        // Sinon, essayer de supprimer normalement
        const result = await AdminService.deleteCategory(categoryId);

        // Si la catégorie a des annonces, renvoyer l'info pour demander confirmation
        if (result && 'hasAds' in result && result.hasAds) {
            return NextResponse.json({
                hasAds: true,
                adsCount: result.adsCount,
                categoryName: result.categoryName,
                message: result.message,
                requiresConfirmation: true
            }, { status: 200 }); // 200 car c'est une réponse valide qui demande confirmation
        }

        // Revalidate pages after successful deletion
        revalidateCategoryPages();

        return NextResponse.json({ success: true, message: 'Catégorie supprimée' });
    } catch (error: any) {
        console.error('Delete category error:', error);
        // Déterminer si c'est une erreur métier (400) ou serveur (500)
        const isBusinessError = error.message?.includes('annonce') ||
            error.message?.includes('sous-catégorie') ||
            error.message?.includes('introuvable');
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: isBusinessError ? 400 : 500 }
        );
    }
}

