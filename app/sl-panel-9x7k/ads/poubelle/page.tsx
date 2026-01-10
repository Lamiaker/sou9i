"use client";

import { use } from 'react';
import AdsTable from '@/components/admin/AdsTable';
import { Trash2, Search, Filter } from 'lucide-react';
import { useAds } from '@/hooks/useAds';
import AdsNav from '@/components/admin/AdsNav';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
    }>;
}

export default function DeletedAdsPage({ searchParams }: PageProps) {
    const params = use(searchParams);
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    const search = params.search || '';

    const { ads, pagination, loading } = useAds({
        page,
        limit,
        filters: {
            search,
            status: 'deleted' // Uniquement les annonces supprimées par le vendeur
        },
        isAdmin: true
    });

    if (!pagination && loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const safePagination = pagination || { total: 0, page: 1, totalPages: 1, limit: 20 };

    return (
        <div className="space-y-6">
            <AdsNav />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-white" />
                        </div>
                        Corbeille (Supprimées par Vendeurs)
                    </h1>
                    <p className="text-white/60 mt-1">
                        {safePagination.total} annonce{safePagination.total > 1 ? 's' : ''} supprimée{safePagination.total > 1 ? 's' : ''} au total
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-6">
                <form className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Rechercher par titre..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </form>
            </div>

            {/* Ads Table */}
            <AdsTable ads={ads as any} pagination={safePagination} basePath="/sl-panel-9x7k/ads/poubelle" />
        </div>
    );
}


