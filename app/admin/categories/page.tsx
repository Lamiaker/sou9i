import { AdminService } from '@/services';
import CategoriesManager from '@/components/admin/CategoriesManager';
import { FolderTree } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const categories = await AdminService.getCategories();

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
                        Gérez la structure arborescente des catégories
                    </p>
                </div>
            </div>

            {/* Categories Manager */}
            <CategoriesManager initialCategories={categories} />
        </div>
    );
}
