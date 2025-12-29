import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ServiceRequestService } from "@/services/ServiceRequestService";
import { ServiceRequestStatus } from "@prisma/client";

// GET - Obtenir une demande par ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Accès non autorisé" },
                { status: 403 }
            );
        }

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

// PUT - Mettre à jour une demande
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Accès non autorisé" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        // Validation du statut si fourni
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

// DELETE - Supprimer une demande
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Accès non autorisé" },
                { status: 403 }
            );
        }

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
