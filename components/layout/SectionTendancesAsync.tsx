import { SectionTendances } from "./SectionTendances";
import { TendanceItem } from "@/lib/data/tendances";

interface SectionTendancesProps {
    title: string;
    items: TendanceItem[];
}

export async function SectionTendancesAsync(props: SectionTendancesProps) {
    // Simuler un délai réseau pour voir le skeleton (pour la démo)
    // await new Promise(resolve => setTimeout(resolve, 1000));

    return <SectionTendances {...props} />;
}
