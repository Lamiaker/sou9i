/**
 * Support Service
 * Gestion des tickets de support utilisateur
 */

import { prisma } from '@/lib/prisma';
import {
    TicketStatus,
    TicketCategory,
    type CreateTicketDTO,
    type UpdateTicketDTO,
    type TicketFiltersDTO,
} from '@/types';

// Ré-exporter les types pour compatibilité avec le code existant
export type CreateTicketData = CreateTicketDTO;
export type UpdateTicketData = UpdateTicketDTO;
export type TicketFilters = TicketFiltersDTO;

// Catégories avec labels français
export const TICKET_CATEGORIES = {
    QUESTION: { label: 'Question générale', icon: '❓' },
    BUG: { label: 'Signaler un bug', icon: '🐛' },
    REPORT_CONTENT: { label: 'Signaler un contenu', icon: '⚠️' },
    SUGGESTION: { label: 'Suggestion', icon: '💡' },
    ACCOUNT: { label: 'Problème de compte', icon: '👤' },
    PAYMENT: { label: 'Paiement', icon: '💳' },
    OTHER: { label: 'Autre', icon: '📝' },
} as const;

// Statuts avec labels français
export const TICKET_STATUSES = {
    OPEN: { label: 'Nouveau', color: 'blue' },
    IN_PROGRESS: { label: 'En cours', color: 'yellow' },
    RESOLVED: { label: 'Résolu', color: 'green' },
    CLOSED: { label: 'Fermé', color: 'gray' },
} as const;

export class SupportService {

    /**
     * Créer un nouveau ticket de support
     */
    static async createTicket(data: CreateTicketData) {
        // Validation
        if (!data.subject || data.subject.trim().length < 5) {
            throw new Error('Le sujet doit contenir au moins 5 caractères');
        }
        if (!data.message || data.message.trim().length < 20) {
            throw new Error('Le message doit contenir au moins 20 caractères');
        }
        if (!data.userId && !data.guestEmail) {
            throw new Error('Email requis pour les utilisateurs non connectés');
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                subject: data.subject.trim(),
                message: data.message.trim(),
                category: data.category,
                userId: data.userId || null,
                guestEmail: data.guestEmail || null,
                guestName: data.guestName || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return ticket;
    }

    /**
     * Récupérer un ticket par ID
     */
    static async getTicketById(ticketId: string) {
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    }
                }
            }
        });

        return ticket;
    }

    /**
     * Récupérer les tickets d'un utilisateur
     */
    static async getUserTickets(userId: string) {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return tickets;
    }

    /**
     * Récupérer tous les tickets (admin)
     */
    static async getAllTickets(filters?: TicketFilters) {
        const where: Record<string, unknown> = {};

        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.category) {
            where.category = filters.category;
        }
        if (filters?.userId) {
            where.userId = filters.userId;
        }

        const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    }
                }
            }
        });

        return tickets;
    }

    /**
     * Compter les tickets par statut (admin dashboard)
     */
    static async getTicketStats() {
        const [total, open, inProgress, resolved] = await Promise.all([
            prisma.supportTicket.count(),
            prisma.supportTicket.count({ where: { status: 'OPEN' } }),
            prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
        ]);

        return {
            total,
            open,
            inProgress,
            resolved,
            pending: open + inProgress, // Tickets nécessitant attention
        };
    }

    /**
     * Mettre à jour un ticket (admin)
     */
    static async updateTicket(ticketId: string, data: UpdateTicketData) {
        const updateData: Record<string, unknown> = {};

        if (data.status) {
            updateData.status = data.status;
        }
        if (data.adminResponse !== undefined) {
            updateData.adminResponse = data.adminResponse;
            updateData.respondedAt = new Date();
            updateData.respondedById = data.respondedById;
        }

        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return ticket;
    }

    /**
     * Répondre à un ticket
     */
    static async respondToTicket(ticketId: string, adminId: string, response: string) {
        if (!response || response.trim().length < 10) {
            throw new Error('La réponse doit contenir au moins 10 caractères');
        }

        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                adminResponse: response.trim(),
                respondedAt: new Date(),
                respondedById: adminId,
                status: 'RESOLVED',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        // TODO: Envoyer un email de notification à l'utilisateur

        return ticket;
    }

    /**
     * Changer le statut d'un ticket
     */
    static async changeStatus(ticketId: string, status: TicketStatus) {
        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status },
        });

        return ticket;
    }

    /**
     * Supprimer un ticket
     */
    static async deleteTicket(ticketId: string) {
        await prisma.supportTicket.delete({
            where: { id: ticketId },
        });

        return { success: true };
    }
}
