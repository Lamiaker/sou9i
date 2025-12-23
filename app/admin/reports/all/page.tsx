"use client";

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import ReportsTable from '@/components/admin/ReportsTable';
import ReportsNav from '@/components/admin/ReportsNav';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AllReportsPage() {
    const searchParams = useSearchParams();

    const page = parseInt(searchParams?.get('page') || '1');
    // Pas de filtre status = tous les signalements

    const apiUrl = `/api/admin/reports/list?page=${page}&limit=20`;

    const { data, error, isLoading, isValidating, mutate } = useSWR(apiUrl, fetcher, {
        refreshInterval: 15000,
        revalidateOnFocus: true,
    });

    const reports = data?.reports || [];
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-400 mb-2">Erreur de chargement</p>
                    <button
                        onClick={() => mutate()}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        Tous les signalements
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/60">
                            {pagination.total} signalement{pagination.total > 1 ? 's' : ''} au total
                        </p>
                        {isValidating && !isLoading && (
                            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                        )}
                    </div>
                </div>
            </div>

            <ReportsNav />

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                        <p className="text-white/60">Chargement des signalements...</p>
                    </div>
                </div>
            ) : (
                <ReportsTable reports={reports} pagination={pagination} onMutate={mutate} basePath="/admin/reports/all" />
            )}
        </div>
    );
}
