import { prisma } from "@/lib/prisma";
import {
    ServiceRequestStatus,
    ServiceType,
    type CreateServiceRequestDTO,
    type UpdateServiceRequestDTO,
    type ServiceRequestFiltersDTO,
} from "@/types";

// Ré-exporter les types pour compatibilité avec le code existant
export type CreateServiceRequestData = CreateServiceRequestDTO;
export type UpdateServiceRequestData = UpdateServiceRequestDTO;

// Extension locale avec le champ search
export interface ServiceRequestFilters extends ServiceRequestFiltersDTO {
    search?: string;
}

// Service
export const ServiceRequestService = {
    // Créer une nouvelle demande
    async create(data: CreateServiceRequestData) {
        return prisma.serviceRequest.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                serviceType: data.serviceType,
                budget: data.budget,
                deadline: data.deadline,
                description: data.description,
            },
        });
    },

    // Obtenir toutes les demandes (admin)
    async getAll(filters?: ServiceRequestFilters) {
        const where: Record<string, unknown> = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.serviceType) {
            where.serviceType = filters.serviceType;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { company: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return prisma.serviceRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    },

    // Obtenir une demande par ID
    async getById(id: string) {
        return prisma.serviceRequest.findUnique({
            where: { id },
        });
    },

    // Mettre à jour une demande (admin)
    async update(id: string, data: UpdateServiceRequestData) {
        return prisma.serviceRequest.update({
            where: { id },
            data: {
                status: data.status,
                adminNotes: data.adminNotes,
            },
        });
    },

    // Supprimer une demande (admin)
    async delete(id: string) {
        return prisma.serviceRequest.delete({
            where: { id },
        });
    },

    // Obtenir les statistiques
    async getStats() {
        const [total, newRequests, contacted, inProgress, completed] = await Promise.all([
            prisma.serviceRequest.count(),
            prisma.serviceRequest.count({ where: { status: 'NEW' } }),
            prisma.serviceRequest.count({ where: { status: 'CONTACTED' } }),
            prisma.serviceRequest.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
        ]);

        return {
            total,
            new: newRequests,
            contacted,
            inProgress,
            completed,
        };
    },
};
