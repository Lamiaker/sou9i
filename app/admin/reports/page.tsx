import { AdminService } from '@/services';
import ReportsTable from '@/components/admin/ReportsTable';
import { AlertTriangle, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        status?: string;
    }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const status = params.status || '';

    const { reports, pagination } = await AdminService.getReports({
        page,
        limit: 20,
        status,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        Centre de Signalements
                    </h1>
                    <p className="text-white/60 mt-1">
                        {pagination.total} signalement{pagination.total > 1 ? 's' : ''} au total
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-6">
                <form className="flex flex-col sm:flex-row gap-4">
                    {/* Status Filter */}
                    <select
                        name="status"
                        defaultValue={status}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer flex-1 sm:flex-none"
                    >
                        <option value="" className="bg-slate-800">Tous les statuts</option>
                        <option value="PENDING" className="bg-slate-800">En attente</option>
                        <option value="RESOLVED" className="bg-slate-800">Résolus</option>
                        <option value="REJECTED" className="bg-slate-800">Rejetés</option>
                    </select>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </form>
            </div>

            {/* Reports Table */}
            <ReportsTable reports={reports} pagination={pagination} />
        </div>
    );
}
