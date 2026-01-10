import { NextRequest, NextResponse } from "next/server";
import { ServiceRequestService } from "@/services/ServiceRequestService";
import { ServiceType } from "@prisma/client";

// POST - Créer une nouvelle demande de service
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation des champs requis
        if (!body.name || !body.email || !body.serviceType || !body.description) {
            return NextResponse.json(
                { error: "Les champs nom, email, type de service et description sont requis" },
                { status: 400 }
            );
        }

        // Validation du type de service
        const validServiceTypes: ServiceType[] = [
            'SITE_VITRINE', 'ECOMMERCE', 'APP_WEB',
            'APP_MOBILE', 'DESIGN_UX', 'CONSULTING', 'OTHER'
        ];

        if (!validServiceTypes.includes(body.serviceType)) {
            return NextResponse.json(
                { error: "Type de service invalide" },
                { status: 400 }
            );
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: "Format d'email invalide" },
                { status: 400 }
            );
        }

        const serviceRequest = await ServiceRequestService.create({
            name: body.name,
            email: body.email,
            phone: body.phone,
            company: body.company,
            serviceType: body.serviceType,
            budget: body.budget,
            deadline: body.deadline,
            description: body.description,
        });

        return NextResponse.json(serviceRequest, { status: 201 });
    } catch (error) {
        console.error("Erreur création demande service:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la demande" },
            { status: 500 }
        );
    }
}


