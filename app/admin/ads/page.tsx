import { AdminService } from '@/services';
import AdsTable from '@/components/admin/AdsTable';
import { ShoppingBag, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        status?: string;
    }>;
}

export default async function AdminAdsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const search = params.search || '';
    const status = params.status || '';

    const { ads, pagination } = await AdminService.getAds({
        page,
        limit: 20,
        search,
        status,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        Modération des Annonces
                    </h1>
                    <p className="text-white/60 mt-1">
                        {pagination.total} annonce{pagination.total > 1 ? 's' : ''} au total
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-6">
                <form className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Rechercher par titre..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        name="status"
                        defaultValue={status}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-800">Tous les statuts</option>
                        <option value="active" className="bg-slate-800">Active</option>
                        <option value="sold" className="bg-slate-800">Vendue</option>
                        <option value="archived" className="bg-slate-800">Archivée</option>
                    </select>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </form>
            </div>

            {/* Ads Table */}
            <AdsTable ads={ads as any} pagination={pagination} />
        </div>
    );
}
