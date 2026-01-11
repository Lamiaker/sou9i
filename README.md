# 🛍️ SweetLook - Marketplace

Une plateforme de marketplace moderne construite avec Next.js 16, permettant aux utilisateurs de publier et consulter des annonces de produits et services.

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du Projet](#-structure-du-projet)
- [Architecture](#-architecture)
- [API](#-api)
- [Déploiement](#-déploiement)

---

## ✨ Fonctionnalités

### 👤 Utilisateurs
- **Authentification** : Inscription, connexion, réinitialisation de mot de passe
- **OAuth** : Connexion via Google
- **Profil** : Gestion du profil, avatar, informations personnelles
- **Dashboard** : Espace personnel avec statistiques

### 📦 Annonces
- **Publication** : Création d'annonces avec images multiples
- **Catégories** : Hiérarchie de catégories/sous-catégories dynamiques
- **Champs dynamiques** : Champs personnalisés selon la catégorie
- **Recherche** : Filtres avancés (prix, localisation, etc.)
- **Favoris** : Sauvegarde d'annonces en favoris

### 💬 Messagerie
- **Messages temps réel** : Communication acheteur/vendeur via Socket.io
- **Notifications** : Système de notifications en temps réel
- **Conversations** : Historique des échanges

### 🛡️ Administration
- **Dashboard admin** : Statistiques, graphiques, alertes
- **Gestion utilisateurs** : Vérification, bannissement
- **Modération** : Approbation des annonces, gestion des signalements
- **Catégories** : Gestion dynamique des catégories

### 🔒 Sécurité
- **Rate limiting** : Protection contre les abus
- **Validation** : Validation des données avec Zod
- **Sessions** : Gestion sécurisée avec NextAuth.js

---

## 🛠️ Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 16.1.1 | Framework React full-stack |
| **React** | 19.2.0 | Interface utilisateur |
| **TypeScript** | 5.x | Typage statique |
| **Prisma** | 6.19.0 | ORM base de données |
| **PostgreSQL** | - | Base de données relationnelle |
| **NextAuth.js** | 4.24.13 | Authentification |
| **Socket.io** | 4.8.1 | WebSockets temps réel |
| **Tailwind CSS** | 4.x | Styling |
| **SWR** | 2.3.8 | Data fetching & caching |
| **Recharts** | 3.6.0 | Graphiques admin |
| **Resend** | 6.6.0 | Envoi d'emails |
| **Zod** | 4.1.13 | Validation de schémas |
| **Redis** | 5.10.0 | Caching & Rate Limiting |

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Étapes

```bash
# 1. Cloner le repository
git clone <repository-url>
cd sweetlook

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Initialiser la base de données
npx prisma generate
npx prisma db push

# 5. Seeder la base de données (optionnel)
npx prisma db seed

# 6. Lancer Redis (Production ou Docker)
# Assurez-vous d'avoir une instance Redis qui tourne

# 7. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/sweetlook"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-tres-long-et-securise"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# Resend (emails)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Redis (Production)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="" # Laisser vide si pas de mot de passe
# REDIS_URL="" # Alternative si vous utilisez une URL complète (ex: Upstash)
```

---

## 📁 Structure du Projet

```
marchefemme/
├── app/                    # Pages et routes (App Router)
│   ├── (auth)/            # Routes authentification
│   ├── admin/             # Dashboard admin
│   ├── api/               # Routes API
│   ├── annonces/          # Pages annonces
│   ├── categories/        # Pages catégories
│   ├── dashboard/         # Espace utilisateur
│   └── ...
├── components/            # Composants React
│   ├── admin/            # Composants admin
│   ├── layout/           # Header, Footer, Navigation
│   ├── ui/               # Composants UI réutilisables
│   └── ...
├── hooks/                 # Hooks React personnalisés
│   ├── useAuth.ts        # Authentification
│   ├── useAds.ts         # Gestion annonces
│   ├── useCategories.ts  # Catégories
│   └── ...
├── lib/                   # Utilitaires et configurations
│   ├── auth.ts           # Configuration NextAuth
│   ├── prisma.ts         # Client Prisma
│   ├── errors.ts         # Gestion d'erreurs
│   └── ...
├── services/              # Logique métier
│   ├── adService.ts      # Service annonces
│   ├── userService.ts    # Service utilisateurs
│   ├── categoryService.ts # Service catégories
│   └── ...
├── types/                 # Types TypeScript
├── prisma/               # Schéma et migrations
│   └── schema.prisma
└── public/               # Assets statiques
```

---

## 🏗️ Architecture

### Services Layer

L'application utilise une architecture en couches avec un pattern **Service** :

```
Route API → Service → Prisma → Base de données
```

**Services disponibles** :
- `AdService` : CRUD des annonces
- `UserService` : Gestion des utilisateurs
- `CategoryService` : Catégories hiérarchiques
- `MessageService` : Messagerie
- `FavoriteService` : Gestion des favoris
- `AdminService` : Opérations admin
- `SupportService` : Tickets support

### Hooks personnalisés

| Hook | Usage |
|------|-------|
| `useAuth()` | État d'authentification |
| `useAds()` | Récupération d'annonces avec SWR |
| `useCategories()` | Catégories avec cache |
| `useMessages()` | Messagerie temps réel |
| `useFavorites()` | Gestion des favoris |

---

## 🔌 API

### Endpoints principaux

#### Annonces
```
GET    /api/ads              # Liste des annonces
GET    /api/ads/[id]         # Détail d'une annonce
POST   /api/ads              # Créer une annonce
PUT    /api/ads/[id]         # Modifier une annonce
DELETE /api/ads/[id]         # Supprimer une annonce
```

#### Catégories
```
GET    /api/categories                   # Toutes les catégories
GET    /api/categories?type=hierarchy    # Catégories hiérarchiques
GET    /api/categories/[slug]            # Catégorie par slug
GET    /api/categories/trending          # Catégories tendances
```

#### Authentification
```
POST   /api/auth/signup          # Inscription
POST   /api/auth/[...nextauth]   # NextAuth handlers
POST   /api/auth/forgot-password # Mot de passe oublié
POST   /api/auth/reset-password  # Réinitialisation
```

#### Messages
```
GET    /api/messages/conversations    # Liste conversations
GET    /api/messages/conversations/[id]  # Messages d'une conversation
POST   /api/messages                  # Envoyer un message
PUT    /api/messages/read             # Marquer comme lu
```

#### Administration
```
GET    /api/admin/stats        # Statistiques
GET    /api/admin/users        # Gestion utilisateurs
GET    /api/admin/ads          # Gestion annonces
GET    /api/admin/reports      # Signalements
```

---

## 📱 Pages principales

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/annonces/[id]` | Détail d'une annonce |
| `/categories` | Toutes les catégories |
| `/categories/[slug]` | Annonces d'une catégorie |
| `/search` | Recherche avancée |
| `/deposer` | Publier une annonce |
| `/dashboard` | Espace utilisateur |
| `/dashboard/annonces` | Mes annonces |
| `/dashboard/messages` | Messagerie |
| `/dashboard/favoris` | Mes favoris |
| `/admin` | Dashboard admin |

---

## 🚢 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Variables d'environnement en production

Configurez les mêmes variables d'environnement dans votre plateforme de déploiement avec les valeurs de production.

### Base de données

Utilisez un service PostgreSQL managé :
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

---

## 📝 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Démarrer en production
npm run lint         # Vérification ESLint
npm run create-admin # Créer un compte admin
```

---

## 🔐 Créer un compte administrateur

```bash
npm run create-admin [email] [password] [name]

# Exemple avec valeurs par défaut
npm run create-admin
# Email: admin@sweetlook.net
# Password: Password123!
```

---

## 📄 License

Ce projet est sous licence privée. Tous droits réservés.

---

## 🤝 Contribution

Pour contribuer au projet, veuillez contacter le propriétaire du repository.
