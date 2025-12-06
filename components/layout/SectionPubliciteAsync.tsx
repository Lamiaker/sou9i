import { SectionPublicite } from "./SectionPublicite";

interface SectionPubliciteProps {
    title: string;
    image: string;
}

export async function SectionPubliciteAsync(props: SectionPubliciteProps) {
    // Simuler un délai réseau pour voir le skeleton (pour la démo)
    // await new Promise(resolve => setTimeout(resolve, 800));

    return <SectionPublicite {...props} />;
}
