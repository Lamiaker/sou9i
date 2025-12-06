import { Skeleton } from "@/components/ui/Skeleton";

export default function CategorySkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <Skeleton className="h-9 w-64" /> {/* Title */}
                            <Skeleton className="h-5 w-48" /> {/* Subtitle */}
                        </div>

                        {/* Toggle buttons skeleton */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <Skeleton className="w-10 h-10 rounded" />
                            <Skeleton className="w-10 h-10 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div
                            key={item}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                {/* Card Header */}
                                <div className="flex items-start justify-between">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                </div>

                                {/* Count */}
                                <Skeleton className="h-4 w-24" />

                                {/* Subcategories */}
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-3 w-12 ml-4 mt-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
