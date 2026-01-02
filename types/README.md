# 📁 Types TypeScript - Architecture

## Vue d'ensemble

Ce dossier contient tous les types TypeScript centralisés du projet SweetLook.

```
types/
├── index.ts              # Point d'entrée principal (barrel export)
├── next-auth.d.ts        # Augmentation des types NextAuth
├── README.md             # Ce fichier
│
├── models/               # Types de modèles métier (UI/Frontend)
│   ├── index.ts
│   ├── ad.ts             # Product, ProductItem, Ad, AdFormData, SearchFilters
│   ├── user.ts           # User, Seller
│   ├── category.ts       # Categorie, SousCategorie, Tendance
│   ├── message.ts        # Message, Conversation
│   └── dashboard.ts      # DashboardStats
│
├── prisma/               # Types Prisma dérivés (Backend)
│   ├── index.ts
│   └── includes.ts       # AdWithRelations, UserWithRelations, etc.
│
├── dto/                  # Data Transfer Objects (Services)
│   ├── index.ts
│   ├── ad.dto.ts         # CreateAdDTO, UpdateAdDTO, AdFiltersDTO
│   ├── message.dto.ts    # CreateMessageDTO, CreateConversationDTO
│   ├── support.dto.ts    # CreateTicketDTO, UpdateTicketDTO
│   ├── service-request.dto.ts
│   └── subcategory-field.dto.ts
│
├── api/                  # Types API (Request/Response)
│   ├── index.ts
│   ├── common.ts         # ApiResponse, PaginatedResponse, ApiHandler
│   └── responses.ts      # Réponses spécifiques par domaine
│
└── ui/                   # Types UI (Hooks, Components partagés)
    ├── index.ts
    └── hooks.ts          # AdWithDetails, CategoryWithDetails, PaginationInfo
```

## Usage

### Import simple depuis le barrel export

```typescript
// ✅ Recommandé - Import depuis le point d'entrée principal
import { Ad, User, ApiResponse, CreateAdDTO, AdStatus } from '@/types'
```

### Import spécifique (si nécessaire)

```typescript
// Pour des imports plus ciblés
import type { AdWithRelations } from '@/types/prisma'
import type { CreateTicketDTO } from '@/types/dto'
```

## Conventions

### Nommage

| Catégorie | Convention | Exemple |
|-----------|------------|---------|
| Modèles | PascalCase singulier | `Ad`, `User`, `Message` |
| DTOs | Entity + Action + DTO | `CreateAdDTO`, `UpdateUserDTO` |
| Réponses API | Entity + Response | `AdDetailResponse` |
| Props composants | Component + Props | `AdCardProps` (reste local) |

### Règle des "2 usages"

Ne créez un type partagé dans `types/` que s'il est utilisé dans **au moins 2 fichiers différents**.

### Props de composants

Les `Props` de composants restent **locaux** au composant (dans le même fichier `.tsx`).

```typescript
// ✅ Dans le fichier du composant
interface MyComponentProps {
    title: string
    onClick: () => void
}

export function MyComponent({ title, onClick }: MyComponentProps) {
    // ...
}
```

### Types Prisma

- Les enums Prisma sont réexportés depuis `@/types` pour uniformiser les imports
- Les types avec relations sont dans `types/prisma/includes.ts`

```typescript
// ✅ Import unifié des enums Prisma
import { AdStatus, Role, TicketStatus } from '@/types'

// Au lieu de:
// ❌ import { AdStatus } from '@prisma/client'
```

## Migration

Si vous devez ajouter un nouveau type :

1. **Type UI/Frontend** → `types/models/[domain].ts`
2. **DTO Service** → `types/dto/[domain].dto.ts`
3. **Type Prisma dérivé** → `types/prisma/includes.ts`
4. **Type API** → `types/api/[common|responses].ts`

N'oubliez pas d'exporter depuis le `index.ts` du sous-dossier.
