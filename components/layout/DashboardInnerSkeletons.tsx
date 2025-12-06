import { Skeleton } from "@/components/ui/Skeleton";

export function AnnoncesSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="w-40 h-10 rounded-lg" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-8">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="p-4 flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-48" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="w-8 h-8 rounded" />
                                <Skeleton className="w-8 h-8 rounded" />
                                <Skeleton className="w-8 h-8 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <Skeleton className="w-32 h-32 rounded-full mb-4" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-6 w-40 rounded-full" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <Skeleton className="h-5 w-24" />
                        <div className="space-y-2">
                            <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-8" /></div>
                            <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-8" /></div>
                        </div>
                    </div>
                </div>

                {/* Right Col */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <Skeleton className="h-6 w-48 border-b border-gray-100 pb-4 mb-6" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Skeleton className="h-10 w-48 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SettingsSkeleton() {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <Skeleton className="h-6 w-24 mb-1" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Skeleton className="h-10 w-40 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <Skeleton className="w-12 h-6 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
