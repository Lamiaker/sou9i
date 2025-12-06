import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            {/* Sidebar Skeleton */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-[64px]">
                <div className="p-6">
                    <Skeleton className="h-4 w-32 mb-6" /> {/* Header "ESPACE VENDEUR" */}
                    <div className="space-y-1">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="flex items-center gap-3 px-4 py-3">
                                <Skeleton className="w-5 h-5 rounded" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
                <div className="space-y-6">

                    {/* Page Header */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity / Chart Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Skeleton className="w-full h-full opacity-50" />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
