"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    basePath: string;
    showPageNumbers?: boolean;
    showItemsPerPage?: boolean;
    className?: string;
    /** Active le prefetch des pages adjacentes (par défaut: true) */
    enablePrefetch?: boolean;
}

export default function Pagination({
    pagination,
    basePath,
    showPageNumbers = true,
    showItemsPerPage = false,
    className = '',
    enablePrefetch = true
}: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { page, limit, total, totalPages } = pagination;

    // Calcul des éléments affichés
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Prefetch des pages adjacentes pour une navigation plus fluide
    useEffect(() => {
        if (!enablePrefetch || totalPages <= 1) return;

        const pagesToPrefetch: number[] = [];

        // Page suivante
        if (page < totalPages) {
            pagesToPrefetch.push(page + 1);
        }

        // Page précédente
        if (page > 1) {
            pagesToPrefetch.push(page - 1);
        }

        pagesToPrefetch.forEach((pageNum) => {
            const params = new URLSearchParams(searchParams?.toString() || '');
            params.set('page', pageNum.toString());
            router.prefetch(`${basePath}?${params.toString()}`);
        });
    }, [page, totalPages, basePath, searchParams, router, enablePrefetch]);

    const goToPage = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('page', newPage.toString());
        router.push(`${basePath}?${params.toString()}`);
    };

    const handleLimitChange = (newLimit: number) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('limit', newLimit.toString());
        params.set('page', '1');
        router.push(`${basePath}?${params.toString()}`);
    };

    // Génération des numéros de pages à afficher
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (page > 3) {
                pages.push('ellipsis');
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (page < totalPages - 2) {
                pages.push('ellipsis');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1 && total <= limit) {
        return null; // Pas de pagination nécessaire
    }

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-6 ${className}`}>
            {/* Info sur les éléments affichés */}
            <div className="flex items-center gap-4">
                <p className="text-gray-500 text-sm">
                    Affichage <span className="text-gray-700 font-medium">{startItem}-{endItem}</span> sur <span className="text-gray-700 font-medium">{total}</span>
                </p>

                {/* Sélecteur d'éléments par page */}
                {showItemsPerPage && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">|</span>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        >
                            <option value="12">12 / page</option>
                            <option value="24">24 / page</option>
                            <option value="48">48 / page</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Contrôles de pagination */}
            <div className="flex items-center gap-1">
                {/* Première page */}
                <button
                    onClick={() => goToPage(1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Première page"
                >
                    <ChevronsLeft className="w-4 h-4 text-gray-600" />
                </button>

                {/* Page précédente */}
                <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Page précédente"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                {/* Numéros de pages */}
                {showPageNumbers && (
                    <div className="flex items-center gap-1 mx-1">
                        {getPageNumbers().map((pageNum, index) => (
                            pageNum === 'ellipsis' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                            ) : (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${page === pageNum
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        ))}
                    </div>
                )}

                {/* Page suivante */}
                <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Page suivante"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>

                {/* Dernière page */}
                <button
                    onClick={() => goToPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Dernière page"
                >
                    <ChevronsRight className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        </div>
    );
}
