import { AdminService } from '@/services';
import CategoriesManager from '@/components/admin/CategoriesManager';
import { FolderTree } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
    }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    const search = params.search || '';

    const { categories, pagination } = await AdminService.getCategories({
        page,
        limit,
        search,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                            <FolderTree className="w-5 h-5 text-white" />
                        </div>
                        Gestion des Catégories
                    </h1>
                    <p className="text-white/60 mt-1">
                        {pagination.total} catégorie{pagination.total > 1 ? 's' : ''} au total
                    </p>
                </div>
            </div>

            {/* Categories Manager */}
            <CategoriesManager
                initialCategories={categories as any}
                pagination={pagination}
                currentSearch={search}
            />
        </div>
    );
}
