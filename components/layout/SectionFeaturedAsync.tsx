import SectionFeatured from "./SectionFeatured";
import { getSectionData } from "@/lib/fetchers";

export default async function SectionFeaturedAsync({
    slug,
    title,
    viewAllLink
}: {
    slug: string;
    title: string;
    viewAllLink: string;
}) {
    const products = await getSectionData(slug);

    if (products.length === 0) return null;

    return (
        <SectionFeatured
            title={title}
            viewAllLink={viewAllLink}
            products={products}
        />
    );
}
