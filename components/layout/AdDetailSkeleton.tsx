import { Skeleton } from "@/components/ui/Skeleton";

export default function AdDetailSkeleton() {
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb Skeleton */}
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image Gallery Skeleton */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <Skeleton className="aspect-[4/3] w-full" />
                            <div className="flex gap-2 p-4">
                                <Skeleton className="w-20 h-20 rounded-lg" />
                                <Skeleton className="w-20 h-20 rounded-lg" />
                                <Skeleton className="w-20 h-20 rounded-lg" />
                            </div>
                        </div>

                        {/* Ad Details Skeleton */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2 w-2/3">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-8 w-1/3" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                </div>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>

                        </div>
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-6">
                        {/* Seller Skeleton */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex gap-4 mb-6">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="space-y-2 flex-1 pt-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>

                        {/* Tips Skeleton */}
                        <div className="bg-blue-50 rounded-2xl p-6 h-40">
                            <Skeleton className="h-full w-full bg-blue-100" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
