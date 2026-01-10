import type { Metadata, ResolvingMetadata } from 'next';
import { AdService } from '@/services/adService';

type Props = {
    params: { id: string };
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    try {
        const ad = await AdService.getAdById(id);

        const previousImages = (await parent).openGraph?.images || [];
        const adImages = ad.images && ad.images.length > 0 ? ad.images : [];

        return {
            title: `${ad.title} | SweetLook`,
            description: ad.description ? ad.description.substring(0, 150) + '...' : 'Découvrez cette annonce sur SweetLook',
            openGraph: {
                title: ad.title,
                description: ad.description ? ad.description.substring(0, 150) + '...' : undefined,
                images: [...adImages, ...previousImages],
            },
        };
    } catch (e) {
        return {
            title: 'Annonce | SweetLook',
            description: 'Détails de l\'annonce sur SweetLook',
        };
    }
}

export default function AdDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
