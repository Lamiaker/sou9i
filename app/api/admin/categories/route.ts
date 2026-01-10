import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getRequestContext } from '@/lib/admin-guard';
import { getAdminSession, logAdminAudit } from '@/lib/admin-auth';
import { AdminService } from '@/services';
import { revalidateCategoryPages } from '@/lib/cache-utils';
import { AdminPermission } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const hasPermission = session.admin.isSuperAdmin ||
            session.admin.permissions.includes(AdminPermission.CATEGORIES_MANAGE);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, icon, image, description, parentId, isTrending, trendingOrder } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Nom et slug requis' }, { status: 400 });
        }

        const category = await AdminService.createCategory({
            name,
            slug,
            icon: icon || undefined,
            image: image || undefined,
            description: description || undefined,
            parentId: parentId || undefined,
            isTrending: isTrending || false,
            trendingOrder: isTrending ? trendingOrder : null,
        });

        const { ipAddress, userAgent } = getRequestContext(request);
        await logAdminAudit({
            adminId: session.admin.id,
            action: 'CATEGORY_CREATED',
            targetType: 'Category',
            targetId: category.id,
            details: { name, slug },
            ipAddress,
            userAgent,
        });

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

export async function PATCH(request: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const hasPermission = session.admin.isSuperAdmin ||
            session.admin.permissions.includes(AdminPermission.CATEGORIES_MANAGE);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
        }

        const body = await request.json();
        const { categoryId, name, slug, icon, image, description, parentId, order, isTrending, trendingOrder } = body;

        if (!categoryId) {
            return NextResponse.json({ error: 'ID catégorie requis' }, { status: 400 });
        }

        const category = await AdminService.updateCategory(categoryId, {
            name,
            slug,
            icon,
            image,
            description,
            parentId,
            order,
            isTrending,
            trendingOrder: isTrending ? trendingOrder : null,
        });

        const { ipAddress, userAgent } = getRequestContext(request);
        await logAdminAudit({
            adminId: session.admin.id,
            action: 'CATEGORY_UPDATED',
            targetType: 'Category',
            targetId: categoryId,
            details: { name, slug },
            ipAddress,
            userAgent,
        });

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

export async function DELETE(request: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const hasPermission = session.admin.isSuperAdmin ||
            session.admin.permissions.includes(AdminPermission.CATEGORIES_MANAGE);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
        }

        const body = await request.json();
        const { categoryId, forceDelete } = body;

        if (!categoryId) {
            return NextResponse.json({ error: 'ID catégorie requis' }, { status: 400 });
        }

        const { ipAddress, userAgent } = getRequestContext(request);

        if (forceDelete) {
            const result = await AdminService.deleteCategoryWithAds(categoryId);
            await logAdminAudit({
                adminId: session.admin.id,
                action: 'CATEGORY_DELETED_WITH_ADS',
                targetType: 'Category',
                targetId: categoryId,
                details: { deletedAdsCount: result.deletedAdsCount },
                ipAddress,
                userAgent,
            });
            revalidateCategoryPages();
            return NextResponse.json({
                success: true,
                message: result.message,
                deletedAdsCount: result.deletedAdsCount
            });
        }

        const result = await AdminService.deleteCategory(categoryId);

        if (result && 'hasAds' in result && result.hasAds) {
            return NextResponse.json({
                hasAds: true,
                adsCount: result.adsCount,
                categoryName: result.categoryName,
                message: result.message,
                requiresConfirmation: true
            }, { status: 200 });
        }

        await logAdminAudit({
            adminId: session.admin.id,
            action: 'CATEGORY_DELETED',
            targetType: 'Category',
            targetId: categoryId,
            ipAddress,
            userAgent,
        });

        revalidateCategoryPages();
        return NextResponse.json({ success: true, message: 'Catégorie supprimée' });
    } catch (error: any) {
        console.error('Delete category error:', error);
        const isBusinessError = error.message?.includes('annonce') ||
            error.message?.includes('sous-catégorie') ||
            error.message?.includes('introuvable');
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: isBusinessError ? 400 : 500 }
        );
    }
}


