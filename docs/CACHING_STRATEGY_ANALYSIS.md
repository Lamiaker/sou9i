# 🔄 Analyse de Stratégie de Caching - SweetLook

**Version**: 1.0  
**Date**: 4 Janvier 2026  
**Statut**: Document d'analyse - ⚠️ AUCUNE IMPLÉMENTATION

---

## 📋 Résumé Exécutif

Ce document analyse l'état actuel du caching dans l'application Next.js **SweetLook** et propose des stratégies d'optimisation pour une mise en production. L'analyse couvre les mécanismes existants, les zones critiques, et les recommandations stratégiques.

---

## 🔍 1. État Actuel du Caching

### 1.1 Mécanismes de Cache Identifiés

#### ✅ ISR (Incremental Static Regeneration)

L'application utilise déjà ISR sur plusieurs pages publiques :

| Page | Revalidation | Fichier |
|------|--------------|---------|
| Page d'accueil (`/`) | 60 secondes | `app/page.tsx` |
| Liste catégories (`/categories`) | 120 secondes | `app/categories/page.tsx` |
| Catégorie dynamique (`/categories/[slug]`) | 60 secondes | `app/categories/[slug]/page.tsx` |
| Détail annonce (`/annonces/[id]`) | 60 secondes | `app/annonces/[id]/page.tsx` |

**Mécanisme utilisé** : `export const revalidate = <seconds>`

#### ✅ Static Site Generation (SSG)

- La page `/categories/[slug]` utilise `generateStaticParams()` pour pré-générer les routes statiques au build time
- Les catégories (parents et enfants) sont pré-rendues

#### ✅ Cache Invalidation avec `revalidatePath()`

L'application utilise activement l'invalidation de cache on-demand dans les API routes :

| API Route | Pages Revalidées |
|-----------|------------------|
| `POST /api/ads` | `/`, `/categories`, `/dashboard/annonces`, `/admin/ads`, `/admin` |
| `POST/PUT /api/admin/categories` | `/`, `/categories`, `/categories/[slug]` |
| `POST /api/admin/reports` | `/admin/reports`, `/admin/ads`, `/admin/users`, `/`, `/search`, `/categories`, `/annonces` |
| `PUT /api/support/[id]` | `/dashboard/support`, `/dashboard/support/mes-demandes` |

#### ✅ Cache Client avec SWR

**Configuration globale** (`components/providers/SWRProvider.tsx`) :
```typescript
{
  refreshInterval: 0,        // Désactivé par défaut
  revalidateOnFocus: true,   // Revalide au focus de l'onglet
  revalidateOnReconnect: true // Revalide à la reconnexion
}
```

**Hooks SWR identifiés** :
- `useAds.ts` : Cache des annonces avec `keepPreviousData: true`, `dedupingInterval: 2000`
- `useDynamicFields.ts` : Cache des champs dynamiques avec `revalidateOnFocus: false`
- Pages Admin : Multiples requêtes SWR avec `refreshInterval` variable (30s à 300s)

#### ❌ Cache NON utilisé

| Mécanisme | Statut |
|-----------|--------|
| `unstable_cache()` | ❌ Non utilisé |
| Fetch avec `cache: 'force-cache'` | ❌ Non utilisé |
| Cache-Control Headers | ❌ Non configuré |
| Edge Runtime | ❌ Non utilisé |
| Redis / Memcached | ❌ Non configuré |

### 1.2 Configuration Next.js

**Fichier** : `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [...]
  }
}
```

**Observations** :
- ❌ Pas de configuration de `headers()` pour Cache-Control
- ❌ Pas de configuration d'`experimental.staleTimes`
- ❌ Pas de configuration de CDN spécifique

### 1.3 Base de Données (Prisma)

**Fichier** : `lib/prisma.ts`

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // log: ['query'], // Désactivé
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Observations** :
- ✅ Singleton pattern pour éviter les connexions multiples en développement
- ❌ Aucun cache de requêtes Prisma
- ❌ Pas d'extension Prisma Accelerate

---

## 📊 2. Analyse des Types de Données

### 2.1 Classification des Données

| Type | Exemples | Caractéristiques | Cache Recommandé |
|------|----------|------------------|------------------|
| **Données Statiques** | Catégories, Wilayas, Conditions | Rarement modifiées | ✅ Long (1h - 24h) |
| **Données Semi-Dynamiques** | Annonces actives, Tendances | MAJ par action admin/user | ✅ ISR (60-120s) + On-Demand |
| **Données Dynamiques** | Messages, Notifications | Temps réel requis | ⚠️ Client-side uniquement |
| **Données Utilisateur Privées** | Dashboard stats, Favoris | Spécifiques à l'utilisateur | ⚠️ Cache per-user ou pas de cache |
| **Données Sensibles** | Sessions, Tokens, Mots de passe | Confidentielles | ❌ Jamais cacher |

### 2.2 Données Publiques (Cachables)

| Ressource | Fréquence MAJ | Stratégie |
|-----------|---------------|-----------|
| Liste des catégories | ~Quotidien | ISR 5min + revalidatePath |
| Annonces publiques (listing) | Fréquent | ISR 60s + revalidatePath |
| Détail annonce | Rare | ISR 60s + revalidatePath |
| Catégories "Tendance" | ~Quotidien | ISR 5min |
| Pages statiques (CGU, Confidentialité) | Très rare | SSG pure |

### 2.3 Données Privées (À ne PAS Cacher côté serveur)

| Ressource | Risque si caché |
|-----------|-----------------|
| `/api/user/profile` | Fuite de données personnelles |
| `/api/user/stats` | Stats incorrectes si caching inter-users |
| `/api/favorites` | Favoris d'un autre utilisateur |
| `/dashboard/*` | Données personnelles exposées |
| `/api/messages` | Messages privés exposés |

---

## ⚡ 3. Impact du Cache sur les Métriques

### 3.1 Performance

| Métrique | Sans Cache | Avec Cache Optimisé | Amélioration |
|----------|------------|---------------------|--------------|
| **TTFB** (Time To First Byte) | 200-500ms | 50-100ms | ~80% |
| **LCP** (Largest Contentful Paint) | 1.5-3s | 0.5-1s | ~60% |
| **Server Load** | 100% requêtes DB | ~20% requêtes DB | ~80% |

### 3.2 Coût Serveur

| Scénario | Requêtes DB/heure | Impact Cache |
|----------|-------------------|--------------|
| Homepage (100 visites/h) | 100 requêtes | → 1 requête (ISR 60s) |
| Catégories (50 visites/h) | 50 requêtes | → 1 requête (ISR 120s) |
| Détail annonce populaire | N requêtes | → ~1 requête (ISR 60s) |

**Économie estimée** : 85-95% de réduction des requêtes DB pour les pages publiques.

### 3.3 Scalabilité

| Aspect | Impact Positif | Risque |
|--------|----------------|--------|
| Pics de trafic | ✅ Absorbés par le cache | - |
| Croissance utilisateurs | ✅ Coût linéaire réduit | - |
| Multi-région | ✅ CDN Edge efficace | ⚠️ Invalidation globale |

### 3.4 Cohérence des Données

| Situation | Comportement Actuel | Risque |
|-----------|---------------------|--------|
| Nouvelle annonce créée | Page d'accueil revalidée | ✅ Minime (60s max) |
| Catégorie modifiée | Revalidation des pages liées | ✅ Minime |
| Annonce supprimée | Revalidation manuelle | ⚠️ Annonce fantôme possible |
| Prix modifié | Revalidation page annonce | ✅ Minime (60s) |

---

## 🎯 4. Zones Critiques à Cacher

### 4.1 Haute Priorité (Impact Élevé)

| Zone | Méthode Actuelle | Recommandation |
|------|------------------|----------------|
| **Page d'accueil** | ISR 60s ✅ | Conserver, ajouter Edge CDN |
| **Pages catégories** | ISR 60-120s ✅ | Conserver, optimiser SSG |
| **Détail annonce** | ISR 60s ✅ | Ajouter cache des métadonnées |
| **API `/api/categories`** | Aucun cache | Ajouter `unstable_cache()` ou headers |

### 4.2 Moyenne Priorité

| Zone | Méthode Actuelle | Recommandation |
|------|------------------|----------------|
| **API `/api/ads` (GET)** | Aucun cache | Cache conditional avec ETags |
| **Images uploads** | Pas de CDN | Servir via CDN avec Cache-Control |
| **Champs dynamiques** | SWR client | Ajouter cache serveur 5min |
| **API section-data** | Aucun cache | Cache 60s par slug |

### 4.3 À NE PAS Cacher

| Zone | Raison |
|------|--------|
| `/dashboard/*` | Données utilisateur privées |
| `/admin/*` | Données sensibles, temps réel requis |
| `POST/PUT/DELETE` API routes | Mutations, pas de cache |
| `/api/messages` | Données temps réel, privées |
| `/api/auth/*` | Sécurité |
| `/api/user/profile` | Données personnelles |

---

## 📐 5. Stratégies de Caching Recommandées

### 5.1 Stratégie 1 : ISR Progressive (Court Terme)

**Objectif** : Optimiser les pages existantes.

| Action | Durée Revalidation | Pages |
|--------|-------------------|-------|
| Pages ultra-stables | 300-600s | CGU, Confidentialité |
| Catégories liste | 300s | `/categories` |
| Homepage | 60s | `/` (conserver) |
| Détail annonce | 120s | `/annonces/[id]` (augmenter) |

### 5.2 Stratégie 2 : Cache par Tag (Moyen Terme)

**Concept** : Utiliser `revalidateTag()` pour invalidation fine.

```
Tags possibles :
- "categories" → toutes les pages catégories
- "category-{id}" → une catégorie spécifique
- "ads" → toutes les annonces
- "ad-{id}" → une annonce spécifique
- "trending" → section tendances
```

**Avantage** : Invalidation chirurgicale sans revalider tout.

### 5.3 Stratégie 3 : Cache API avec `unstable_cache()` (Moyen Terme)

**Cible** : Requêtes Prisma les plus fréquentes.

| Service | Méthode | TTL Suggéré |
|---------|---------|-------------|
| `CategoryService.getAllCategories()` | unstable_cache | 5 min |
| `CategoryService.getTrendingCategories()` | unstable_cache | 3 min |
| `CategoryService.getParentCategories()` | unstable_cache | 5 min |
| `AdService.getAds()` (sans filters user) | unstable_cache | 1 min |

### 5.4 Stratégie 4 : Cache Edge (Long Terme)

**Concept** : Déployer sur des CDN Edge (Vercel Edge, Cloudflare).

**Avantages** :
- Latence réduite géographiquement
- Cache distribué mondialement
- Résilience accrue

**Prérequis** :
- Hébergement compatible (Vercel, Cloudflare Pages)
- Configuration des headers Cache-Control

### 5.5 Stratégie 5 : Cache Utilisateur Segmenté

**Pour les fonctionnalités futures** :

| Cas d'usage | Approche |
|-------------|----------|
| Dashboard admin (même pour tous) | Cache 30s par rôle |
| Stats globales publiques | Cache serveur 5min |
| Recherche publique | Cache par query hash |

---

## ⚠️ 6. Risques et Points de Vigilance

### 6.1 Données Obsolètes

| Risque | Scénario | Mitigation |
|--------|----------|------------|
| **Annonce vendue encore visible** | Délai ISR | revalidatePath() immédiat |
| **Prix incorrect affiché** | Cache client | SWR avec revalidation courte |
| **Catégorie supprimée visible** | Cache Edge long | invalidation forcée |

### 6.2 Fuites de Données (CRITIQUE ⚠️)

| Risque | Cause | Prévention |
|--------|-------|------------|
| **Cache user A servi à user B** | Cache serveur sans key utilisateur | NE JAMAIS cacher `/api/user/*` côté serveur |
| **Dashboard admin accessible** | Cache mal configuré | Vérifier `no-store` sur routes privées |
| **Session dans le cache** | Mauvaise config | Exclure headers sensibles |

**Règle d'or** : Les routes API privées doivent TOUJOURS avoir `cache: 'no-store'`.

### 6.3 Invalidation Complexe

| Défi | Contexte |
|------|----------|
| Cascade d'invalidations | Modification catégorie → revalider toutes les annonces |
| Invalidation globale coûteuse | Beaucoup de pages à revalider |
| Race conditions | Invalidation avant que le cache soit écrit |

### 6.4 Impact SEO

| Aspect | Impact Cache |
|--------|--------------|
| **Positif** : TTFB rapide | ✅ Améliore Core Web Vitals |
| **Positif** : Pages toujours disponibles | ✅ Uptime 100% perçu |
| **Risque** : Contenu obsolète indexé | ⚠️ Garder revalidation < 1h |
| **Risque** : Erreurs 404 mises en cache | ⚠️ Configurer TTL court pour erreurs |

---

## 📋 7. Plan d'Action Recommandé

### Phase 1 : Audit & Préparation (Avant Production)
1. ✅ Documenter les TTL actuels (fait dans ce document)
2. ⬜ Ajouter des headers `no-store` explicites sur `/api/user/*`
3. ⬜ Vérifier que toutes les mutations appellent `revalidatePath()`
4. ⬜ Tester les scénarios d'invalidation en staging

### Phase 2 : Optimisation Serveur (Sprint 1-2)
1. ⬜ Implémenter `unstable_cache()` sur `CategoryService`
2. ⬜ Augmenter TTL des pages statiques (CGU → 1h)
3. ⬜ Ajouter `revalidateTag()` pour invalidation groupée

### Phase 3 : Optimisation Client (Sprint 2-3)
1. ⬜ Configurer SWR avec `dedupingInterval` optimal
2. ⬜ Ajouter indicateurs de "données en cours de mise à jour"
3. ⬜ Implémenter polling intelligent pour le dashboard

### Phase 4 : Edge & CDN (Sprint 4+)
1. ⬜ Configurer CDN pour les images uploadées
2. ⬜ Évaluer migration vers Edge Runtime pour pages publiques
3. ⬜ Ajouter monitoring de hit rate cache

---

## 📊 8. Métriques de Suivi

### KPIs à Monitorer Post-Production

| Métrique | Outil Suggéré | Cible |
|----------|---------------|-------|
| Cache Hit Rate | Vercel Analytics / CDN | > 80% |
| TTFB P95 | Web Vitals | < 200ms |
| DB Query Count / minute | Prisma Metrics | Réduction 70% |
| Temps de revalidation | Logs Next.js | < 2s |
| Erreurs de cache stale | Monitoring custom | < 0.1% |

---

## ✅ Conclusion

L'application SweetLook dispose déjà d'une **base solide de caching ISR** sur les pages critiques. Les principales opportunités d'amélioration sont :

1. **Cache des services Prisma** via `unstable_cache()` pour réduire les requêtes DB
2. **Sécurisation explicite** des routes privées avec `no-store`
3. **Optimisation des TTL** selon la fréquence de modification des données
4. **Préparation CDN/Edge** pour la scalabilité future

⚠️ **Rappel** : Ce document est une analyse. Aucune modification n'est appliquée sans validation explicite.

---

*Document généré le 4 Janvier 2026 - Analyse du projet SweetLook*
