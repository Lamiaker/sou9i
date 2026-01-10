import { AdminService } from '@/services';
import UsersTable from '@/components/admin/UsersTable';
import UsersNav from '@/components/admin/UsersNav';
import { Users, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        role?: string;
    }>;
}

export default async function AllUsersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    const search = params.search || '';
    const role = params.role || '';
    const status = ''; // Vide pour tous les statuts

    const { users, pagination } = await AdminService.getUsers({
        page,
        limit,
        search,
        role,
        status,
    });

    const formattedUsers = users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt).toISOString(),
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-white/60 mt-1">
                        {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} au total
                    </p>
                </div>
            </div>

            <UsersNav />

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-6">
                <form className="flex flex-col lg:flex-row gap-4">
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

                    <select
                        name="role"
                        defaultValue={role}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-800">Tous les rôles</option>
                        <option value="USER" className="bg-slate-800">Utilisateurs</option>
                        <option value="ADMIN" className="bg-slate-800">Administrateurs</option>
                    </select>

                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </form>
            </div>

            <UsersTable users={formattedUsers} pagination={pagination} basePath="/sl-panel-9x7k/users/all" />
        </div>
    );
}


