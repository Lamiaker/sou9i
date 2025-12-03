# 🔐 NextA uth.js - Configuration Complète

## ✅ **Ce qui a été fait**

### 1. Installation
- ✅ `next-auth` + `@next-auth/prisma-adapter` installés
- ✅ `bcryptjs` pour hasher les mots de passe

### 2. Services
- ✅ **`UserService`** créé (`services/userService.ts`)
  - Création utilisateur avec hash password
  - Vérification email/password
  - Mise à jour profil
  - Changement de mot de passe
  - Statistiques utilisateur

### 3. Configuration NextAuth
- ✅ **`lib/auth.ts`** - Configuration avec Credentials Provider
- ✅ **`types/next-auth.d.ts`** - Extension types TypeScript
- ✅ **`app/api/auth/[...nextauth]/route.ts`** - Route API NextAuth

### 4. API Routes
- ✅ **`/api/auth/signup`** - Inscription utilisateur
  - Validation complète (email, password 8+ chars, téléphone, ville)
  - Hash du mot de passe
  - Vérification email unique
  - Création dans Prisma

### 5. Pages
- ✅ **Page Signup** (`app/(auth)/signup/page.tsx`)
  - Champs : nom, email, téléphone, ville, mot de passe
  - Validation côté client
  - Connexion API fonctionnelle
  - Redirection après succès

- ✅ **Page Login** (`app/(auth)/login/page.tsx`)
  - Utilise `signIn()` de NextAuth
  - Gestion d'erreurs
  - Redirection avec query string

---

## 🚀 **Comment utiliser**

### Inscription d'un utilisateur

```typescript
// La page signup utilise déjà cette API
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sarah Amrani',
    email: 'sarah@example.com',
    phone: '0555123456',
    city: 'Alger',
    password: 'motdepasse123',
  }),
});
```

### Connexion d'un utilisateur

```typescript
// Utiliser NextAuth signIn
import { signIn } from 'next-auth/react'

const result = await signIn('credentials', {
  email: 'sarah@example.com',
  password: 'motdepasse123',
  redirect: false,
});

if (result?.error) {
  console.error('Erreur de connexion')
} else {
  // Connecté !
  router.push('/')
}
```

### Récupérer la session

```typescript
// Dans un Server Component
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Page() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    // Non connecté
    redirect('/login')
  }

  const userId = session.user.id
  const userName = session.user.name
  
  return <div>Hello {userName}</div>
}
```

```typescript
// Dans un Client Component
'use client'
import { useSession } from 'next-auth/react'

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Chargement...</div>
  if (!session) return <div>Non connecté</div>
  
  return <div>Hello {session.user.name}</div>
}
```

### Déconnexion

```typescript
import { signOut } from 'next-auth/react'

// Déconnexion
await signOut({ callbackUrl: '/login' })
```

---

## 🔒 **Protéger les routes**

### Côté serveur (Server Component)

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login?redirect=/dashboard')
  }

  // Utilisateur connecté
  const userId = session.user.id
  const ads = await AdService.getUserAds(userId)
  
  return <div>Vos annonces...</div>
}
```

### Côté client (Middleware - futur)

```typescript
// middleware.ts (à créer)
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/deposer', '/messages/:path*']
}
```

---

## 📝 **Exemples d'utilisation dans l'app**

### 1. Créer une annonce (protégé)

```typescript
// app/deposer/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DeposerPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login?redirect=/deposer')
  }

  // Formulaire pré-rempli avec les infos utilisateur
  const user = await UserService.getUserById(session.user.id)
  
  return <CreateAdForm user={user} />
}
```

### 2. Mes favoris

```typescript
// app/dashboard/favoris/page.tsx
import { getServerSession } from 'next-auth'
import { FavoriteService } from '@/services'

export default async function FavorisPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const favorites = await FavoriteService.getUserFavorites(session.user.id)
  
  return <FavoritesList favorites={favorites} />
}
```

### 3. API protégée

```typescript
// app/api/ads/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id
  const body = await request.json()
  
  const ad = await AdService.createAd({
    ...body,
    userId,
  })
  
  return NextResponse.json({ success: true, data: ad })
}
```

---

## ⚙️ **Variables d'environnement**

Assurez-vous que votre `.env` contient :

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-super-securise-32-caracteres-minimum"
```

Pour générer un secret :
```bash
openssl rand -base64 32
```

---

## 🎯 **Prochaines étapes**

1. **Créer un middleware** pour protéger automatiquement les routes
2. **Mettre à jour le Header** pour afficher l'utilisateur connecté
3. **Remplacer AuthContext** par NextAuth partout
4. **Ajouter "Remember me"** (session persistante)
5. **Page de profil** pour modifier les infos utilisateur
6. **Réinitialisation de mot de passe** (email)

---

## 🔧 **Services disponibles**

```typescript
import { UserService } from '@/services'

// Créer utilisateur
await UserService.createUser({ email, name, password, phone, city })

// Get by email
await UserService.getUserByEmail(email)

// Get by ID
await UserService.getUserById(id)

// Verify password
await UserService.verifyPassword(password, hashedPassword)

// Update profile
await UserService.updateUser(id, { name, phone, city, avatar })

// Change password
await UserService.changePassword(id, oldPassword, newPassword)

// Get stats
await UserService.getUserStats(id) // { adsCount, favoritesCount }
```

---

## 🎉 **Résultat**

Votre marketplace a maintenant :
- ✅ Authentification complète avec NextAuth.js
- ✅ Inscription fonctionnelle
- ✅ Connexion sécurisée
- ✅ Mots de passe hashés (bcrypt)
- ✅ Sessions persistantes
- ✅ Protection des routes (Server Components)
- ✅ UserService pour gérer les utilisateurs

**Tout est prêt pour protéger vos routes et gérer les utilisateurs ! 🚀**
