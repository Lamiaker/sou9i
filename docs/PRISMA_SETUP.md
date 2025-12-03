# 🗄️ Configuration Base de Données - Prisma

## 📋 Prérequis

1. **PostgreSQL** installé localement ou sur un service cloud
   - Local: [PostgreSQL Download](https://www.postgresql.org/download/)
   - Cloud: [Supabase](https://supabase.com) (gratuit) ou [Neon](https://neon.tech)

## 🚀 Configuration

### Option 1 : PostgreSQL Local

1. Installer PostgreSQL
2. Créer une base de données:
```sql
CREATE DATABASE marketplace;
```

3. Ajouter dans `.env`:
```env
DATABASE_URL="postgresql://postgres:votre_password@localhost:5432/marketplace"
```

### Option 2 : Supabase (Recommandé pour débutants)

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer la "Connection String" (PostgreSQL)
4. Coller dans `.env`:
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## 📦 Variables d'environnement nécessaires

Créer un fichier `.env` à la racine avec:

```env
# Base de données
DATABASE_URL="votre_url_postgresql_ici"

# NextAuth (optionnel pour l'instant)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generer-avec-openssl-rand-base64-32"
```

## 🔧 Commandes Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer la migration initiale
npx prisma migrate dev --name init

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Réinitialiser la BDD (attention!)
npx prisma migrate reset
```

## 📊 Schéma actuel

Le schéma inclut:
- ✅ Users (utilisateurs)
- ✅ Ads (annonces)
- ✅ Categories
- ✅ Favorites
- ✅ Messages & Conversations
- ✅ Reviews (avis)

## 🎯 Prochaines étapes

1. Configurer la DATABASE_URL
2. Exécuter `npx prisma migrate dev --name init`
3. Exécuter `npx prisma generate`
4. Créer les premières routes API
