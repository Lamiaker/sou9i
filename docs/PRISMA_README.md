# 🚀 Configuration Prisma - Marketplace

## ✅ Ce qui a été fait

### 1. **Installation & Configuration**
- ✅ Prisma & Prisma Client installés
- ✅ Schéma Prisma complet créé (`prisma/schema.prisma`)
- ✅ Client Prisma singleton (`lib/prisma.ts`)
- ✅ Types TypeScript (`lib/prisma-types.ts`)

### 2. **Modèles de données**
Le schéma inclut :
- 👤 **User** - Utilisateurs avec authentification
- 📢 **Ad** - Annonces avec images, prix, localisation
- 📁 **Category** - Catégories d'annonces
- ❤️ **Favorite** - Système de favoris
- 💬 **Message & Conversation** - Messagerie
- ⭐ **Review** - Système d'avis

### 3. **Routes API créées**
- ✅ `GET/POST /api/ads` - Liste et création d'annonces
- ✅ `GET/PATCH/DELETE /api/ads/[id]` - Gestion d'une annonce
- ✅ `GET/POST/DELETE /api/favorites` - Gestion des favoris

### 4. **Script de seed**
- ✅ `prisma/seed.ts` - Données de test prêtes

---

## 📋 Prochaines étapes

### Étape 1 : Configurer la base de données

**Option A - PostgreSQL Local** (si installé)
```bash
# Créer une base de données
createdb marketplace
```

**Option B - Supabase** (Recommandé - Gratuit)
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte et un projet
3. Récupérer la "Connection String" PostgreSQL

### Étape 2 : Configurer .env

Créer un fichier `.env` à la racine :

```env
# PostgreSQL Local
DATABASE_URL="postgresql://postgres:password@localhost:5432/marketplace"

# OU Supabase
# DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generer-avec-openssl-rand-base64-32"
```

### Étape 3 : Exécuter les migrations

```bash
# Générer le client Prisma
npx prisma generate

# Créer la base de données et tables
npx prisma migrate dev --name init

# (Optionnel) Peupler avec des données de test
npx prisma db seed
```

### Étape 4 : Tester Prisma Studio

```bash
# Ouvrir l'interface graphique
npx prisma studio
```

Accessible sur `http://localhost:5555`

---

## 🔧 Configuration package.json

Ajouter dans `package.json` :

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## 📚 Utilisation dans votre code

### Exemple : Récupérer des annonces

```typescript
import { prisma } from '@/lib/prisma'

// Dans un Server Component ou API Route
const ads = await prisma.ad.findMany({
  where: { status: 'active' },
  include: {
    user: true,
    category: true,
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
})
```

### Exemple : Créer une annonce

```typescript
const newAd = await prisma.ad.create({
  data: {
    title: 'Mon annonce',
    description: 'Description',
    price: 5000,
    location: 'Alger',
    images: ['url1.jpg', 'url2.jpg'],
    user: { connect: { id: userId } },
    category: { connect: { id: categoryId } },
  },
})
```

---

## 🎯 Routes API disponibles

### Annonces
```bash
GET    /api/ads              # Liste avec filtres
POST   /api/ads              # Créer
GET    /api/ads/[id]         # Détails
PATCH  /api/ads/[id]         # Modifier
DELETE /api/ads/[id]         # Supprimer
```

### Favoris  
```bash
GET    /api/favorites?userId=xxx   # Liste
POST   /api/favorites               # Ajouter
DELETE /api/favorites?userId=xxx&adId=yyy  # Retirer
```

---

## 🐛 Dépannage

### Erreur de connexion
```bash
# Vérifier que PostgreSQL est lancé
# Si local:
pg_ctl status

# Tester la connexion
npx prisma db pull
```

### Réinitialiser la BDD
```bash
npx prisma migrate reset
npx prisma db seed
```

### Supprimer et recréer
```bash
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

---

## 📖 Documentation

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)

---

## ✨ Prêt pour la suite !

Une fois Prisma configuré, vous pourrez :
1. ✅ Remplacer les données mock par de vraies données
2. ✅ Implémenter NextAuth pour l'authentification
3. ✅ Connecter le FavoritesContext à l'API
4. ✅ Créer la messagerie fonctionnelle
5. ✅ Ajouter l'upload d'images

**Besoin d'aide ?** Consultez `docs/PRISMA_SETUP.md`
