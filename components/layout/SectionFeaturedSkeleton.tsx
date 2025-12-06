import { Skeleton } from "@/components/ui/Skeleton";

export default function SectionFeaturedSkeleton() {
    return (
        <section className="w-full mb-12 py-8 px-4">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
            </div>

            <div className="max-w-7xl mx-auto bg-gray-50 rounded-2xl px-4 py-5">
                <div className="relative">
                    {/* Conteneur products */}
                    <div className="flex gap-4 overflow-hidden pb-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="relative w-[60vw] min-w-[60vw] sm:w-[280px] sm:min-w-[280px] sm:max-w-[280px] bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100"
                            >
                                {/* Seller info */}
                                <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>

                                {/* Image */}
                                <div className="relative h-72 bg-gray-100">
                                    <Skeleton className="w-full h-full" />
                                </div>

                                {/* Product info */}
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-8 w-24" />

                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-28 rounded" />
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        <Skeleton className="h-3 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
