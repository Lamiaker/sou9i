// ============================================
// Fichier de compatibilité rétroactive
// Les types sont maintenant centralisés dans @/types/prisma
// Ce fichier existe pour éviter de casser les imports existants
// ============================================

// Réexporter tous les types Prisma depuis le nouveau emplacement
export {
    type UserWithRelations,
    type AdWithRelations,
    type ConversationWithMessages,
    type CreateAdInput,
    type CreateUserInput,
    type UpdateAdInput,
    type AdFilters,
} from '@/types/prisma'

