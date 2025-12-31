# 🔐 Rapport des Corrections de Sécurité

## Date: 2025-12-31

Ce document résume toutes les corrections de sécurité effectuées suite à l'audit passif de l'application.

---

## ✅ Corrections Effectuées

### 1. 🔴 CRITIQUE - Authentification sur les routes CRUD des annonces

**Fichiers modifiés:**
- `app/api/ads/route.ts`
- `app/api/ads/[id]/route.ts`

**Problème:** L'authentification était commentée ("TODO") et le `userId` était accepté directement du body de la requête, permettant l'usurpation d'identité.

**Correction:**
- Ajout de `getServerSession(authOptions)` sur toutes les routes POST, PATCH, DELETE
- Le `userId` est maintenant récupéré exclusivement de la session authentifiée
- Throw `AuthenticationError()` si non authentifié
- Throw `ForbiddenError()` si l'utilisateur tente de modifier une annonce qui ne lui appartient pas

**Code exemple:**
```typescript
const session = await getServerSession(authOptions)
if (!session?.user?.id) {
    throw new AuthenticationError()
}
const userId = session.user.id // Impossible à usurper
```

---

### 2. 🔴 ÉLEVÉ - Validation des uploads de fichiers

**Fichiers modifiés:**
- `app/api/upload/images/route.ts`
- `app/api/upload/avatar/route.ts`

**Problème:** Aucune validation du type MIME, taille non limitée, extension basée sur le nom original.

**Corrections:**
- ✅ Authentification requise pour uploader
- ✅ Validation du type MIME (image/jpeg, image/png, image/gif, image/webp)
- ✅ Limite de taille (5MB pour images, 2MB pour avatars)
- ✅ Limite du nombre de fichiers (max 5)
- ✅ Extension déterminée par le type MIME (pas l'extension originale)
- ✅ Noms de fichiers aléatoires (timestamp + random string)
- ✅ Protection contre path traversal via `path.basename()`

---

### 3. 🔴 ÉLEVÉ - Rate limiting sur forgot-password

**Fichier modifié:**
- `app/api/auth/forgot-password/route.ts`

**Problème:** Aucun rate limiting au niveau API, risque d'abus du service email.

**Correction:**
- Ajout de rate limiting: 3 tentatives par heure par IP
- Header `Retry-After` dans la réponse 429
- Log des erreurs via le système centralisé

---

### 4. 🟡 MOYEN - Fichier .env dans .gitignore

**Fichier modifié:**
- `.gitignore`

**Problème:** La ligne ignorant les fichiers `.env` était commentée.

**Correction:**
- Décommenté et étendu pour couvrir tous les fichiers d'environnement:
  - `.env`, `.env.*`, `.env.local`, `.env.development`, `.env.production`, etc.
- Ajout de patterns pour les fichiers sensibles: `*.key`, `*.pem`, `secrets/`, `credentials/`

---

### 5. 🟡 MOYEN - Routes de debug sécurisées

**Fichiers modifiés:**
- `app/api/debug/ads/route.ts`
- `app/api/debug/categories/route.ts`

**Problème:** Routes de debug exposées potentiellement en production.

**Correction:**
- Désactivation complète en production (`NODE_ENV === 'production'` → 404)
- Vérification admin maintenue en développement
- Utilisation du système de logging centralisé

---

### 6. 🟡 MOYEN - Validation d'email renforcée

**Fichier modifié:**
- `app/api/user/profile/route.ts`

**Problème:** Validation d'email basique avec `includes('@')`.

**Correction:**
- Schéma de validation Zod complet pour tous les champs du profil:
  - `name`: min 2 caractères, max 100
  - `email`: validation Zod `.email()`
  - `phone`: regex pour format algérien
  - `city`: min 2 caractères, max 100
- Toutes les données passent par le validateur avant traitement

---

### 7. 🟡 MOYEN - Sanitisation JSON-LD

**Fichier modifié:**
- `app/annonces/[id]/page.tsx`

**Problème:** `dangerouslySetInnerHTML` avec données utilisateur non sanitisées.

**Correction:**
- Fonction `sanitizeForJsonLd()` qui échappe les caractères dangereux:
  - `<` → `\u003c`
  - `>` → `\u003e`
  - `&` → `\u0026`
  - `'` → `\u0027`
  - `"` → `\u0022`
- Sanitisation récursive pour les objets et tableaux

---

### 8. 🟢 FAIBLE - Logging centralisé

**Fichiers modifiés:**
- Toutes les routes API mentionnées ci-dessus

**Amélioration:**
- Remplacement des `console.error()` par `logServerError()` du système centralisé
- Aucune fuite de stack trace côté client
- Messages d'erreur génériques via `ERROR_MESSAGES.GENERIC`

---

## Mises à jour côté Client

Les pages suivantes ont été mises à jour pour ne plus envoyer le `userId` dans le body des requêtes:

- `app/deposer/page.tsx` - Création d'annonce
- `app/dashboard/annonces/[id]/edit/page.tsx` - Édition d'annonce
- `app/dashboard/annonces/page.tsx` - Suppression soft delete

---

## Résumé des fichiers modifiés

| Fichier | Type de correction |
|---------|-------------------|
| `app/api/ads/route.ts` | Auth + Session |
| `app/api/ads/[id]/route.ts` | Auth + Session |
| `app/api/upload/images/route.ts` | Upload sécurisé |
| `app/api/upload/avatar/route.ts` | Upload sécurisé |
| `app/api/auth/forgot-password/route.ts` | Rate limiting |
| `app/api/user/profile/route.ts` | Validation Zod |
| `app/api/debug/ads/route.ts` | Désactivé en prod |
| `app/api/debug/categories/route.ts` | Désactivé en prod |
| `app/annonces/[id]/page.tsx` | Sanitisation JSON-LD |
| `app/deposer/page.tsx` | Suppression userId client |
| `app/dashboard/annonces/[id]/edit/page.tsx` | Suppression userId client |
| `app/dashboard/annonces/page.tsx` | Suppression userId client |
| `.gitignore` | Protection secrets |

---

## Vérification

✅ TypeScript compile sans erreurs (`npx tsc --noEmit` → exit code 0)

---

## Recommandations restantes

1. **Tests de régression**: Tester manuellement les flux de création, édition et suppression d'annonces.

2. **Tests d'authentification**: Vérifier que les requêtes non authentifiées sont bien rejetées avec 401.

3. **HTTPS en production**: S'assurer que le site utilise HTTPS pour protéger les cookies de session.

4. **Audit des dépendances**: Exécuter régulièrement `npm audit` pour détecter les vulnérabilités.

5. **Headers de sécurité**: Considérer l'ajout de headers CSP, X-Frame-Options, etc. via `next.config.ts`.
