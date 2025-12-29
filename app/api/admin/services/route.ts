import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ServiceRequestService } from "@/services/ServiceRequestService";
import { ServiceRequestStatus, ServiceType } from "@prisma/client";

// GET - Obtenir toutes les demandes (admin)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Accès non autorisé" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as ServiceRequestStatus | null;
        const serviceType = searchParams.get("serviceType") as ServiceType | null;
        const search = searchParams.get("search");

        const requests = await ServiceRequestService.getAll({
            status: status || undefined,
            serviceType: serviceType || undefined,
            search: search || undefined,
        });

        const stats = await ServiceRequestService.getStats();

        return NextResponse.json({ requests, stats });
    } catch (error) {
        console.error("Erreur récupération demandes services:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des demandes" },
            { status: 500 }
        );
    }
}
