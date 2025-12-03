# 🚀 Guide d'utilisation des Services

## 📁 Structure des Services

```
services/
├── index.ts              ← Export centralisé
├── adService.ts          ← Gestion des annonces
├── favoriteService.ts    ← Gestion des favoris
└── categoryService.ts    ← Gestion des catégories
```

---

## ✅ Avantages de cette architecture

1. **Réutilisabilité** : Appeler les services depuis n'importe où
2. **Testabilité** : Tests unitaires faciles
3. **Maintenabilité** : Logique centralisée
4. **Performance** : Server Components appellent directement la DB
5. **Type-safety** : TypeScript complet

---

## 📖 Exemples d'utilisation

### 1. Dans un Server Component (Recommandé)

```typescript
// app/search/page.tsx
import { AdService } from '@/services'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  // Appel DIRECT du service (pas de fetch HTTP)
  const result = await AdService.getAds({
    categoryId: searchParams.category,
    search: searchParams.search,
  })

  return (
    <div>
      <h1>Résultats ({result.pagination.total})</h1>
      {result.ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  )
}
```

### 2. Dans une API Route

```typescript
// app/api/ads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AdService } from '@/services'

export async function GET(request: NextRequest) {
  try {
    const result = await AdService.getAds({ status: 'active' })
    return NextResponse.json({ success: true, data: result.ads })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

### 3. Dans un Client Component (via fetch)

```typescript
// components/AdList.tsx
'use client'

import { useState, useEffect } from 'react'

export default function AdList() {
  const [ads, setAds] = useState([])

  useEffect(() => {
    fetch('/api/ads')
      .then((res) => res.json())
      .then((data) => setAds(data.data))
  }, [])

  return <div>{/* Afficher les annonces */}</div>
}
```

---

## 📚 API des Services

### AdService

```typescript
// Récupérer des annonces avec filtres
const result = await AdService.getAds(
  {
    categoryId: 'abc',
    search: 'robe',
    minPrice: 1000,
    maxPrice: 5000,
    location: 'Alger',
    condition: 'Neuf',
    status: 'active',
    userId: 'user123',
  },
  1, // page
  12 // limit
)

// Récupérer une annonce par ID
const ad = await AdService.getAdById('ad-id-123')

// Créer une annonce
const newAd = await AdService.createAd({
  title: 'Magnifique robe',
  description: 'Description...',
  price: 3500,
  categoryId: 'cat-123',
  userId: 'user-123',
  location: 'Alger',
  images: ['url1.jpg', 'url2.jpg'],
  deliveryAvailable: true,
})

// Mettre à jour
const updated = await AdService.updateAd(
  'ad-id',
  'user-id',
  { price: 4000, title: 'Nouveau titre' }
)

// Supprimer
await AdService.deleteAd('ad-id', 'user-id')

// Annonces d'un utilisateur
const userAds = await AdService.getUserAds('user-id', 'active')
```

### FavoriteService

```typescript
// Favoris d'un utilisateur
const favorites = await FavoriteService.getUserFavorites('user-id')

// Vérifier si favori
const isFav = await FavoriteService.isFavorite('user-id', 'ad-id')

// Ajouter
await FavoriteService.addFavorite('user-id', 'ad-id')

// Retirer
await FavoriteService.removeFavorite('user-id', 'ad-id')

// Toggle (ajouter/retirer)
const result = await FavoriteService.toggleFavorite('user-id', 'ad-id')
// result.action === 'added' ou 'removed'
// result.isFavorite === true ou false

// Compter
const count = await FavoriteService.countUserFavorites('user-id')

// IDs seulement
const ids = await FavoriteService.getUserFavoriteIds('user-id')
```

### CategoryService

```typescript
// Toutes les catégories
const categories = await CategoryService.getAllCategories()

// Par ID
const category = await CategoryService.getCategoryById('cat-id')

// Par slug
const category = await CategoryService.getCategoryBySlug('mode-beaute')

// Avec compteur d'annonces
const categoriesWithCount = await CategoryService.getCategoriesWithCount()
```

---

## 🎯 Cas d'usage réels

### Cas 1 : Page de recherche

```typescript
// app/search/page.tsx
import { AdService, CategoryService } from '@/services'

export default async function SearchPage({ searchParams }) {
  const [result, categories] = await Promise.all([
    AdService.getAds({ search: searchParams.q }),
    CategoryService.getCategoriesWithCount(),
  ])

  return (
    <div>
      <Sidebar categories={categories} />
      <Results ads={result.ads} pagination={result.pagination} />
    </div>
  )
}
```

### Cas 2 : Dashboard utilisateur

```typescript
// app/dashboard/annonces/page.tsx
import { AdService } from '@/services'

export default async function UserAdsPage() {
  // TODO: Récupérer userId depuis session
  const userId = 'user-123'
  
  const ads = await AdService.getUserAds(userId)

  return <AdsList ads={ads} />
}
```

### Cas 3 : Page favoris

```typescript
// app/dashboard/favoris/page.tsx
import { FavoriteService } from '@/services'

export default async function FavoritesPage() {
  // TODO: Récupérer userId depuis session
  const userId = 'user-123'
  
  const favorites = await FavoriteService.getUserFavorites(userId)

  return <FavoritesList favorites={favorites} />
}
```

---

## ⚡ Bonnes pratiques

### ✅ À FAIRE

```typescript
// ✅ Server Component - Appel direct
const ads = await AdService.getAds()

// ✅ API Route - Validation + Service
export async function POST(req) {
  const body = await req.json()
  if (!body.title) return NextResponse.json({ error: 'Title required' })
  return AdService.createAd(body)
}

// ✅ Gestion d'erreurs
try {
  const ad = await AdService.getAdById(id)
} catch (error) {
  if (error.message === 'Annonce non trouvée') {
    return notFound()
  }
}
```

### ❌ À ÉVITER

```typescript
// ❌ Server Component qui fait un fetch (inutile)
const res = await fetch('http://localhost:3000/api/ads')
const ads = await res.json()

// ❌ Logique DB directement dans API Route
export async function GET() {
  const ads = await prisma.ad.findMany({ where: ... })
  // Devrait utiliser AdService.getAds()
}

// ❌ Duplication de logique
// Ne pas copier-coller la même requête Prisma partout
```

---

## 🧪 Tests (Futur)

```typescript
// __tests__/services/adService.test.ts
import { AdService } from '@/services'

describe('AdService', () => {
  it('should filter ads by category', async () => {
    const result = await AdService.getAds({ categoryId: 'cat-123' })
    expect(result.ads.every(ad => ad.categoryId === 'cat-123')).toBe(true)
  })
})
```

---

## 📝 TODO: Prochaines étapes

1. [ ] Intégrer NextAuth pour récupérer userId automatiquement
2. [ ] Créer UserService pour gérer les utilisateurs
3. [ ] Créer MessageService pour la messagerie
4. [ ] Ajouter des tests unitaires
5. [ ] Migrer les pages existantes pour utiliser les services

---

**Besoin d'aide ?** Consultez les exemples dans chaque service !
