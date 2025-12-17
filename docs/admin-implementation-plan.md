# Plan d'Implémentation - Espace Administrateur

Ce document détaille les étapes techniques pour la mise en place de l'espace administration de la marketplace **MachiFemme**.

## 1. Base de Données & Configuration (✅ Fait)
Mise en place des fondations pour gérer les rôles et les signalements.

- [x] **Mise à jour du Schéma Prisma** :
    - Ajout de l'enum `Role` (USER, ADMIN).
    - Ajout du modèle `Report` pour les signalements.
    - Ajout des relations User/Report et Ad/Report.
- [x] **Migration** : Application des changements en base de données.
- [x] **Création Admin** : Script pour créer un premier super-admin (`admin@marchefemme.com`).

## 2. Protection & Routing (✅ Fait)
Sécuriser l'accès aux pages d'administration.

- [x] **Mise à jour de `auth.ts`** : Inclure le `role` de l'utilisateur dans la session NextAuth.
- [x] **Middleware** : Bloquer l'accès aux routes `/admin/*` pour les non-admins.
- [x] **Layout Admin** (`app/admin/layout.tsx`) :
    - Structure distincte avec Sidebar spécifique Admin.
    - Menu de navigation : Dashboard, Utilisateurs, Annonces, Signalements, Catégories.

## 3. Tableau de Bord (Dashboard) (✅ Fait)
Vue d'ensemble de l'activité du site.

- [x] **Page d'accueil Admin** (`app/admin/page.tsx`) :
    - Affichage des KPIs (Nouveaux utilisateurs, Annonces actives, Signalements ouverts).
    - Activité récente (utilisateurs, annonces, signalements).
    - Actions rapides avec liens vers les sections.

## 4. Gestion des Utilisateurs (✅ Fait)
Le "Gendarme" de la plateforme.

- [x] **Liste des utilisateurs** (`app/admin/users/page.tsx`) :
    - Tableau avec recherche et filtres (rôle, vérification).
    - Actions : Voir détails, Vérifier/Dévérifier, Promouvoir/Rétrograder, Supprimer.
- [x] **API** : `/api/admin/users` pour les actions.
- [x] **Composant** : `UsersTable.tsx` avec actions dropdown.

## 5. Modération des Annonces (✅ Fait)
Contrôle de la qualité et de la légalité.

- [x] **Liste des annonces** (`app/admin/ads/page.tsx`) :
    - Filtres par statut (Active, Vendue, Archivée).
    - Actions : Changer statut, Supprimer.
- [x] **API** : `/api/admin/ads` pour les actions.
- [x] **Composant** : `AdsTable.tsx` avec aperçu images et badge signalements.

## 6. Gestion des Signalements (✅ Fait)
Traitement des alertes utilisateurs.

- [x] **Centre de signalements** (`app/admin/reports/page.tsx`) :
    - Liste des signalements avec filtres par statut.
    - Interface de résolution : Voir l'objet signalé -> Décider (Résoudre ou Rejeter).
- [x] **API** : `/api/admin/reports` pour les actions.
- [x] **Composant** : `ReportsTable.tsx` avec détails reporter/cible.

## 7. Gestion du Contenu (Catégories) (✅ Fait)
Maintenance du catalogue.

- [x] **Page Catégories** (`app/admin/categories/page.tsx`) :
    - Liste arborescente avec expansion/collapse.
    - Formulaire pour Ajouter / Modifier / Supprimer une catégorie.
- [x] **API** : `/api/admin/categories` (POST, PATCH, DELETE).
- [x] **Composant** : `CategoriesManager.tsx` avec modal d'ajout.

---

## Architecture des fichiers créés

```
app/
└── admin/
    ├── layout.tsx              # Layout admin avec metadata
    ├── page.tsx                # Dashboard avec stats et activité
    ├── users/
    │   └── page.tsx            # Gestion des utilisateurs
    ├── ads/
    │   └── page.tsx            # Modération des annonces
    ├── reports/
    │   └── page.tsx            # Centre de signalements
    └── categories/
        └── page.tsx            # Gestion des catégories

app/api/admin/
├── users/route.ts              # API actions utilisateurs
├── ads/route.ts                # API actions annonces
├── reports/route.ts            # API actions signalements
└── categories/route.ts         # API CRUD catégories

components/admin/
├── AdminLayoutClient.tsx       # Layout client avec sidebar
├── UsersTable.tsx              # Tableau utilisateurs
├── AdsTable.tsx                # Tableau annonces
├── ReportsTable.tsx            # Liste signalements
└── CategoriesManager.tsx       # Gestionnaire catégories

services/
└── adminService.ts             # Service métier admin

lib/
└── auth.ts                     # Mise à jour avec rôle dans session

middleware.ts                   # Protection routes admin
```

---

## Design System

L'espace admin utilise un design **glassmorphism sombre** avec :
- Fond dégradé `from-slate-900 via-purple-900 to-slate-900`
- Cards en `bg-white/5 backdrop-blur-xl border border-white/10`
- Accents en dégradé `from-purple-500 to-pink-500`
- Textes en `text-white` et `text-white/60` pour les labels
- Responsive : Sidebar collapsible sur desktop, menu hamburger sur mobile

---

## Identifiants de Test (Local)
- **Email** : `admin@marchefemme.com`
- **Mot de passe** : `Password123!`
