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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <FolderTree className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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


