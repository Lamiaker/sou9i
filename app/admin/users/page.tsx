"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import UsersTable from '@/components/admin/UsersTable';
import UsersNav from '@/components/admin/UsersNav';
import { Users, Search, Filter, RefreshCw } from 'lucide-react';

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminUsersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get params from URL
    const page = parseInt(searchParams?.get('page') || '1');
    const limit = parseInt(searchParams?.get('limit') || '20');
    const search = searchParams?.get('search') || '';
    const role = searchParams?.get('role') || '';
    const status = 'PENDING'; // Défaut pour la page principale

    // Build API URL with query params
    const apiUrl = `/api/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}&status=${status}`;

    // SWR with auto-refresh every 10 seconds
    const { data, error, isLoading, isValidating, mutate } = useSWR(apiUrl, fetcher, {
        refreshInterval: 10000, // Polling toutes les 10 secondes
        revalidateOnFocus: true,
        dedupingInterval: 2000,
    });

    const users = data?.users || [];
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

    // Handle form submit for filters
    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const params = new URLSearchParams();

        const searchValue = formData.get('search') as string;
        const roleValue = formData.get('role') as string;

        if (searchValue) params.set('search', searchValue);
        if (roleValue) params.set('role', roleValue);
        params.set('page', '1');

        router.push(`/admin/users?${params.toString()}`);
    };

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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        Gestion des Utilisateurs
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/60">
                            {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} en attente
                        </p>
                        {isValidating && !isLoading && (
                            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                        )}
                    </div>
                </div>
            </div>

            <UsersNav />

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-6">
                <form onSubmit={handleFilterSubmit} className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Rechercher par nom ou email..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        name="role"
                        defaultValue={role}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-800">Tous les rôles</option>
                        <option value="USER" className="bg-slate-800">Utilisateurs</option>
                        <option value="ADMIN" className="bg-slate-800">Administrateurs</option>
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

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                        <p className="text-white/60">Chargement des utilisateurs...</p>
                    </div>
                </div>
            ) : (
                /* Users Table */
                <UsersTable users={users} pagination={pagination} onMutate={mutate} />
            )}
        </div>
    );
}
