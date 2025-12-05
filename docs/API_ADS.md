# 🚀 API Annonces - Documentation

## ✅ Routes Disponibles

### 1. Liste des Annonces
```
GET /api/ads
```

**Paramètres (query):**
- `categoryId`: string - Filtrer par catégorie
- `minPrice`: number - Prix minimum  
- `maxPrice`: number - Prix maximum
- `location`: string - Localisation (recherche partielle)
- `condition`: string - État du produit
- `search`: string - Recherche dans titre/description
- `status`: string - État de l'annonce (default: 'active')
- `userId`: string - Annonces d'un utilisateur
- `page`: number - Numéro de page (default: 1)
- `limit`: number - Annonces par page (default: 12)

**Réponse:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

### 2. Détails d'une Annonce
```
GET /api/ads/[id]
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    "description": "...",
    "price": 1000,
    "images": [...],
    "user": {...},
    "category": {...},
    "_count": {
      "favorites": 5
    }
  }
}
```

### 3. Incrémenter les Vues
```
POST /api/ads/[id]/views
```

### 4. Créer une Annonce
```
POST /api/ads
```

**Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "price": number (required),
  "categoryId": "string (required)",
  "userId": "string (required)",
  "location": "string (required)",
  "images": ["url1", "url2"],
  "condition": "string",
  "brand": "string",
  "size": "string",
  "deliveryAvailable": boolean,
  "negotiable": boolean
}
```

### 5. Mettre à Jour une Annonce
```
PATCH /api/ads/[id]
```

### 6. Supprimer une Annonce
```
DELETE /api/ads/[id]?userId=xxx
```

---

## 📁 Hook React: `useAds`

### Import
```typescript
import { useAds, useAd } from '@/hooks/useAds';
```

### Liste d'Annonces
```typescript
const { ads, loading, error, pagination, refetch } = useAds({
  filters: {
    categoryId: 'xxx',
    minPrice: 100,
    maxPrice: 1000,
    location: 'Alger',
    search: 'iPhone'
  },
  page: 1,
  limit: 12
});
```

### Annonce Unique
```typescript
const { ad, loading, error, refetch } = useAd(id);
```

---

## 🔄 Mise à Jour Next.js 15

Toutes les routes ont été mises à jour pour Next.js 15 :

```typescript
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  // ...
}
```

---

**Status**: ✅ Complet et fonctionnel
