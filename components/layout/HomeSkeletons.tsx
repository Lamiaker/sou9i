import { Skeleton } from "@/components/ui/Skeleton";

export default function SectionPubliciteSkeleton() {
    return (
        <section className="w-full mb-10">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-60">
                <Skeleton className="absolute inset-0 w-full h-full" />
            </div>
        </section>
    );
}

export function SectionMomentDeVendreSkeleton() {
    return (
        <section className="w-full mb-8">
            <div className="bg-orange-50 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-70">
                <div className="flex-1 space-y-2 text-center sm:text-left w-full h-100">
                    <Skeleton className="h-4 w-3/4 mb-4" />
                </div>
                <Skeleton className="w-40 h-12 rounded-lg" />
            </div>
        </section>
    );
}

export function SectionTendancesSkeleton() {
    return (
        <section className="w-full mb-8 relative">
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="relative">
                <div className="flex gap-4 overflow-hidden pb-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="relative min-w-[200px] h-64 rounded-xl overflow-hidden shrink-0 border border-gray-100"
                        >
                            <Skeleton className="w-full h-full" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
