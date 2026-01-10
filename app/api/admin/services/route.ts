import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { ServiceRequestService } from "@/services/ServiceRequestService";
import { ServiceRequestStatus, ServiceType } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

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


