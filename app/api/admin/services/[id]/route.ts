import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { ServiceRequestService } from "@/services/ServiceRequestService";
import { ServiceRequestStatus } from "@prisma/client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const { id } = await params;
        const serviceRequest = await ServiceRequestService.getById(id);

        if (!serviceRequest) {
            return NextResponse.json(
                { error: "Demande non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json(serviceRequest);
    } catch (error) {
        console.error("Erreur récupération demande service:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de la demande" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const { id } = await params;
        const body = await request.json();

        const validStatuses: ServiceRequestStatus[] = [
            'NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
        ];

        if (body.status && !validStatuses.includes(body.status)) {
            return NextResponse.json(
                { error: "Statut invalide" },
                { status: 400 }
            );
        }

        const updatedRequest = await ServiceRequestService.update(id, {
            status: body.status,
            adminNotes: body.adminNotes,
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Erreur mise à jour demande service:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de la demande" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const { id } = await params;
        await ServiceRequestService.delete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur suppression demande service:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression de la demande" },
            { status: 500 }
        );
    }
}
