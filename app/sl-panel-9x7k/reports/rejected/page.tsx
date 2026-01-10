"use client";

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import ReportsTable from '@/components/admin/ReportsTable';
import ReportsNav from '@/components/admin/ReportsNav';
import { XCircle, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RejectedReportsPage() {
    const searchParams = useSearchParams();

    const page = parseInt(searchParams?.get('page') || '1');
    const status = 'REJECTED';

    const apiUrl = `/api/admin/reports/list?page=${page}&limit=20&status=${status}`;

    const { data, error, isLoading, isValidating, mutate } = useSWR(apiUrl, fetcher, {
        refreshInterval: 30000,
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-white" />
                        </div>
                        Signalements rejetés
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/60">
                            {pagination.total} faux signalement{pagination.total > 1 ? 's' : ''}
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
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
                        <p className="text-white/60">Chargement des signalements...</p>
                    </div>
                </div>
            ) : (
                <ReportsTable reports={reports} pagination={pagination} onMutate={mutate} basePath="/sl-panel-9x7k/reports/rejected" />
            )}
        </div>
    );
}


