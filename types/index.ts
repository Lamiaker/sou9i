// ============================================
// Types centralisés pour le projet SweetLook
// Point d'entrée principal - Barrel Export
// ============================================

// Modèles métier (UI/Frontend)
export * from './models'

// Types Prisma dérivés (Backend)
export * from './prisma'

// Data Transfer Objects (Services)
export * from './dto'

// Types API (Request/Response)
export * from './api'

// Types UI (Hooks, Components)
export * from './ui'

// Ré-export des enums Prisma pour usage unifié
export {
    Role,
    ReportStatus,
    AdStatus,
    VerificationStatus,
    FieldType,
    TicketStatus,
    TicketCategory,
    ServiceRequestStatus,
    ServiceType,
} from '@prisma/client'
