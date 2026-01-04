"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    basePath: string; // ex: '/admin/users' ou '/admin/ads'
    showPageNumbers?: boolean;
    showItemsPerPage?: boolean;
    onPageChange?: (page: number) => void; // Callback optionnel pour changement de page
    /** Active le prefetch des pages adjacentes (par défaut: true) */
    enablePrefetch?: boolean;
}

export default function AdminPagination({
    pagination,
    basePath,
    showPageNumbers = true,
    showItemsPerPage = true,
    onPageChange,
    enablePrefetch = true
}: PaginationProps) {
    const router = useRouter();
    const { page, limit, total, totalPages } = pagination;

    // Calcul des éléments affichés
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Prefetch des pages adjacentes pour une navigation plus fluide
    useEffect(() => {
        // Ne pas prefetch si onPageChange est utilisé (gestion manuelle)
        if (!enablePrefetch || totalPages <= 1 || onPageChange) return;

        const pagesToPrefetch: number[] = [];

        // Page suivante
        if (page < totalPages) {
            pagesToPrefetch.push(page + 1);
        }

        // Page précédente
        if (page > 1) {
            pagesToPrefetch.push(page - 1);
        }

        // Utiliser window.location.search pour rester cohérent avec le composant
        pagesToPrefetch.forEach((pageNum) => {
            const params = new URLSearchParams(window.location.search);
            params.set('page', pageNum.toString());
            router.prefetch(`${basePath}?${params.toString()}`);
        });
    }, [page, totalPages, basePath, router, enablePrefetch, onPageChange]);

    const goToPage = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        if (onPageChange) {
            onPageChange(newPage);
        } else {
            const params = new URLSearchParams(window.location.search);
            params.set('page', newPage.toString());
            router.push(`${basePath}?${params.toString()}`);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('limit', newLimit.toString());
        params.set('page', '1'); // Reset to first page
        router.push(`${basePath}?${params.toString()}`);
    };

    // Génération des numéros de pages à afficher
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5; // Nombre max de pages visibles

        if (totalPages <= maxVisible + 2) {
            // Afficher toutes les pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Toujours afficher la première page
            pages.push(1);

            if (page > 3) {
                pages.push('ellipsis');
            }

            // Pages autour de la page courante
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (page < totalPages - 2) {
                pages.push('ellipsis');
            }

            // Toujours afficher la dernière page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1 && total <= limit) {
        // Afficher juste le compteur si pas de pagination nécessaire
        return (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                <p className="text-white/40 text-sm">
                    {total} élément{total > 1 ? 's' : ''} au total
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10">
            {/* Info sur les éléments affichés */}
            <div className="flex items-center gap-4">
                <p className="text-white/40 text-sm">
                    Affichage <span className="text-white/70 font-medium">{startItem}-{endItem}</span> sur <span className="text-white/70 font-medium">{total}</span>
                </p>

                {/* Sélecteur d'éléments par page */}
                {showItemsPerPage && (
                    <div className="flex items-center gap-2">
                        <span className="text-white/40 text-sm">|</span>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                        >
                            <option value="10" className="bg-slate-800">10 / page</option>
                            <option value="20" className="bg-slate-800">20 / page</option>
                            <option value="50" className="bg-slate-800">50 / page</option>
                            <option value="100" className="bg-slate-800">100 / page</option>
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
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Première page"
                >
                    <ChevronsLeft className="w-4 h-4 text-white/70" />
                </button>

                {/* Page précédente */}
                <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Page précédente"
                >
                    <ChevronLeft className="w-4 h-4 text-white/70" />
                </button>

                {/* Numéros de pages */}
                {showPageNumbers && (
                    <div className="flex items-center gap-1 mx-1">
                        {getPageNumbers().map((pageNum, index) => (
                            pageNum === 'ellipsis' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-white/40">...</span>
                            ) : (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${page === pageNum
                                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10'
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
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Page suivante"
                >
                    <ChevronRight className="w-4 h-4 text-white/70" />
                </button>

                {/* Dernière page */}
                <button
                    onClick={() => goToPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Dernière page"
                >
                    <ChevronsRight className="w-4 h-4 text-white/70" />
                </button>
            </div>
        </div>
    );
}
