# 🔒 Middleware d'Authentification

## ✅ **Ce qui a été configuré**

### 1. Middleware Next.js (`middleware.ts`)
- ✅ Protège automatiquement les routes:
  - `/dashboard/*` - Toutes les pages du dashboard
  - `/deposer` - Déposer une annonce
  - `/messages/*` - Messagerie

### 2. SessionProvider (`components/providers/SessionProvider.tsx`)
- ✅ Wrapper pour NextAuth SessionProvider
- ✅ Intégré dans `app/layout.tsx`

### 3. Hooks Personnalisés (`hooks/useAuth.ts`)
- ✅ `useAuth()` - Récupérer l'utilisateur connecté
- ✅ `useRequireAuth()` - Forcer l'authentification

### 4. UserMenu (`components/layout/UserMenu.tsx`)
- ✅ Affichage utilisateur connecté
- ✅ Dropdown menu avec déconnexion
- ✅ Liens dashboard et profil

---

## 🚀 **Comment ça fonctionne**

### Routes Protégées Automatiquement

Quand un utilisateur non connecté essaie d'accéder:
- `/dashboard` → Redirigé vers `/login?redirect=/dashboard`
- `/deposer` → Redirigé vers `/login?redirect=/deposer`
- `/messages` → Redirigé vers `/login?redirect=/messages`

Après connexion, l'utilisateur est automatiquement redirigé vers la page demandée.

---

## 📖 **Utilisation**

### Dans un Server Component

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Utilisateur connecté
  return <div>Welcome {session.user.name}</div>
}
```

### Dans un Client Component

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Chargement...</div>
  if (!isAuthenticated) return <div>Non connecté</div>

  return <div>Hello {user?.name}</div>
}
```

### Avec useRequireAuth (Redirection automatique)

```typescript
'use client'

import { useRequireAuth } from '@/hooks/useAuth'

export default function ProtectedPage() {
  const { session, isLoading } = useRequireAuth()

  if (isLoading) return <div>Chargement...</div>

  // L'utilisateur est forcément connecté ici
  return <div>Page protégée</div>
}
```

---

## 🎨 **Intégrer UserMenu dans le Header**

Modifiez `components/layout/Header.tsx` :

```typescript
import UserMenu from '@/components/layout/UserMenu'

// Dans la section desktop du Header:
<div className="flex items-center space-x-6">
  {/* Autres boutons... */}
  
  {/* Remplacer le bouton "Se connecter" par: */}
  <UserMenu />
</div>
```

---

## ⚙️ **Configuration du Middleware**

### Fichier `middleware.ts`

```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',     // Protège tout le dashboard
    '/deposer',              // Protège la page de dépôt d'annonce
    '/messages/:path*',      // Protège la messagerie
  ],
}
```

### Ajouter d'autres routes protégées

```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/deposer',
    '/messages/:path*',
    '/profil',              // Ajouter profil
    '/settings',            // Ajouter settings
  ],
}
```

### Exclure certaines routes

```typescript
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

---

## 🧪 **Tester l'Authentification**

1. **Déconnecté** : Essayer d'accéder `/dashboard`
   - ✅ Devrait rediriger vers `/login?redirect=/dashboard`

2. **Se connecter** : Login avec credentials
   - ✅ Devrait rediriger vers `/dashboard` (grâce au query param)

3. **UserMenu** : Vérifier le dropdown
   - ✅ Affiche nom et email
   - ✅ Liens dashboard et profil
   - ✅ Bouton déconnexion fonctionne

---

## 🔧 **API des Hooks**

### useAuth()

```typescript
const { user, isAuthenticated, isLoading, status } = useAuth()

// user: { id, name, email, image } | undefined
// isAuthenticated: boolean
// isLoading: boolean
// status: 'authenticated' | 'unauthenticated' | 'loading'
```

### useRequireAuth()

```typescript
const { session, status, isLoading } = useRequireAuth('/login')

// Redirige automatiquement si non connecté
// session: Session | null
// status: 'authenticated' | 'unauthenticated' | 'loading'
// isLoading: boolean
```

---

## 📝 **Exemples concrets**

### Exemple 1 : Dashboard Page

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdService } from '@/services'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Récupérer les annonces de l'utilisateur
  const ads = await AdService.getUserAds(session.user.id)

  return (
    <div>
      <h1>Bienvenue {session.user.name}</h1>
      <p>Vous avez {ads.length} annonces</p>
    </div>
  )
}
```

### Exemple 2 : Bouton conditionnel

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function DeposerButton() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Link href="/login?redirect=/deposer">
        Se connecter pour déposer
      </Link>
    )
  }

  return (
    <Link href="/deposer">
      Déposer une annonce
    </Link>
  )
}
```

---

## 🎯 **Prochaines étapes**

1. ✅ Middleware créé et configuré
2. ✅ SessionProvider intégré
3. ✅ Hooks useAuth créés
4. ✅ UserMenu avec déconnexion créé

**À faire :**
1. [ ] Intégrer `<UserMenu />` dans le Header desktop
2. [ ] Tester les redirections
3. [ ] Supprimer l'ancien AuthContext (optionnel)
4. [ ] Ajouter un loader pour les pages protégées

---

## ✨ **Résultat**

Votre application a maintenant :
- ✅ Protection automatique des routes sensibles
- ✅ Redirection intelligente après login
- ✅ Menu utilisateur avec déconnexion
- ✅ Hooks réutilisables pour l'auth
- ✅ Intégration complète NextAuth

**Toutes les routes `/dashboard`, `/deposer`, et `/messages` sont maintenant protégées ! 🔒**
