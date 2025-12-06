import { SectionMomentDeVendre } from "./SectionMomentDeVendre";

interface SectionMomentDeVendreProps {
    title: string;
    description?: string;
    buttonText: string;
}

export async function SectionMomentDeVendreAsync(props: SectionMomentDeVendreProps) {
    // Simuler un délai réseau pour voir le skeleton (pour la démo)
    // await new Promise(resolve => setTimeout(resolve, 500));

    return <SectionMomentDeVendre {...props} />;
}
