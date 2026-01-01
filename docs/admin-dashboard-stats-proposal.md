# 📊 Proposition de Dashboard Admin - Statistiques & Graphiques

> **Document d'analyse conceptuelle - SweetLook**  
> Date : 01/01/2026  
> Version : 1.0  
> ⚠️ **Aucune implémentation sans validation explicite**

---

## 📋 Table des matières

1. [Analyse des données disponibles](#1-analyse-des-données-disponibles)
2. [KPIs recommandés](#2-kpis-recommandés)
3. [Types de graphiques proposés](#3-types-de-graphiques-proposés)
4. [Structure du dashboard](#4-structure-du-dashboard)
5. [Impact technique](#5-impact-technique)
6. [Stratégie d'implémentation](#6-stratégie-dimplementation)
7. [Points de vigilance](#7-points-de-vigilance)

---

## 1. Analyse des données disponibles

### 1.1 Modèles de données identifiés

| Modèle | Champs clés exploitables | Potentiel statistique |
|--------|-------------------------|----------------------|
| **User** | `createdAt`, `role`, `verificationStatus`, `isBanned`, `city` | Croissance, répartition, modération |
| **Ad** | `createdAt`, `status`, `moderationStatus`, `views`, `price`, `location`, `categoryId` | Volume, performance, tendances |
| **Category** | `parentId`, `isTrending`, `order` | Répartition, popularité |
| **Report** | `status`, `reason`, `createdAt` | Modération, tendances de signalement |
| **Favorite** | `createdAt`, `adId`, `userId` | Engagement, popularité |
| **Message** | `createdAt`, `read` | Activité, engagement |
| **Conversation** | `createdAt`, `updatedAt` | Activité utilisateur |
| **Review** | `rating`, `createdAt` | Satisfaction, qualité |
| **SupportTicket** | `status`, `category`, `createdAt` | Qualité de service |
| **ServiceRequest** | `status`, `serviceType`, `createdAt` | Demandes B2B |

### 1.2 Relations exploitables

```
User ─┬─> Ads (1:N) ─> Category (N:1)
      ├─> Favorites (1:N)
      ├─> Messages (1:N) ─> Conversations
      ├─> Reviews (1:N) sender/receiver
      ├─> Reports (1:N) reporter/reported
      └─> SupportTickets (1:N)
```

### 1.3 Champs temporels disponibles

- `createdAt` sur tous les modèles → **Évolutions dans le temps**
- `updatedAt` sur User, Ad, Conversation, Report, SupportTicket → **Activité de modification**
- `bannedAt` sur User → **Historique de modération**

---

## 2. KPIs recommandés

### 2.1 📈 KPIs Globaux (Vue d'ensemble)

| KPI | Description | Source | Priorité |
|-----|-------------|--------|----------|
| **Total utilisateurs** | Nombre d'inscrits | `User.count()` | 🔴 Haute |
| **Nouveaux utilisateurs (période)** | Inscriptions sur 7j/30j | `User.count({ createdAt >= date })` | 🔴 Haute |
| **Taux de croissance** | % évolution vs période précédente | Calcul comparatif | 🟡 Moyenne |
| **Total annonces actives** | Annonces visibles | `Ad.count({ status: 'active', moderationStatus: 'APPROVED' })` | 🔴 Haute |
| **Annonces en attente** | File de modération | `Ad.count({ moderationStatus: 'PENDING' })` | 🔴 Haute |
| **Signalements en attente** | Urgences à traiter | `Report.count({ status: 'PENDING' })` | 🔴 Haute |
| **Tickets support ouverts** | SAV en cours | `SupportTicket.count({ status: 'OPEN' })` | 🟡 Moyenne |

### 2.2 👥 KPIs Utilisateurs

| KPI | Description | Calcul |
|-----|-------------|--------|
| **Répartition par statut** | PENDING / VERIFIED / TRUSTED / REJECTED / BANNED | Group by `verificationStatus` + `isBanned` |
| **Taux de vérification** | % utilisateurs vérifiés/total | `VERIFIED + TRUSTED / total` |
| **Taux de ban** | % comptes bannis | `isBanned: true / total` |
| **Utilisateurs actifs (30j)** | Ayant créé une annonce ou message récemment | Jointure temporelle |
| **Distribution géographique** | Répartition par ville | Group by `city` |
| **Top créateurs d'annonces** | Utilisateurs les plus prolifiques | Order by `_count.ads` |

### 2.3 📦 KPIs Annonces

| KPI | Description | Calcul |
|-----|-------------|--------|
| **Répartition par statut** | active / sold / archived | Group by `status` |
| **Répartition par modération** | PENDING / APPROVED / REJECTED | Group by `moderationStatus` |
| **Taux d'approbation** | % annonces approuvées | `APPROVED / total` |
| **Taux de rejet** | % annonces rejetées | `REJECTED / total` |
| **Performance par catégorie** | Nombre d'annonces par catégorie | Group by `categoryId` |
| **Prix moyen par catégorie** | Benchmark | `AVG(price) GROUP BY categoryId` |
| **Total vues** | Engagement global | `SUM(views)` |
| **Top annonces (vues)** | Annonces les plus populaires | Order by `views DESC` |
| **Annonces avec favoris** | Popularité | Join avec `Favorite` count |

### 2.4 🛡️ KPIs Modération

| KPI | Description | Calcul |
|-----|-------------|--------|
| **Signalements par raison** | Types de problèmes | Group by `reason` |
| **Temps moyen de traitement** | Réactivité équipe | `AVG(resolvedAt - createdAt)` |
| **Taux de résolution** | Efficacité | `RESOLVED / total` |
| **Taux de rejet (faux signalements)** | Qualité des signalements | `REJECTED / total` |
| **Utilisateurs multi-signalés** | Récidivistes | Users avec `reportedCount > N` |

### 2.5 💬 KPIs Engagement

| KPI | Description | Calcul |
|-----|-------------|--------|
| **Messages échangés (période)** | Activité messagerie | `Message.count({ createdAt >= date })` |
| **Conversations actives** | Engagement | `Conversation.count({ updatedAt >= 7 days })` |
| **Favoris ajoutés (période)** | Intérêt utilisateur | `Favorite.count({ createdAt >= date })` |
| **Note moyenne globale** | Satisfaction | `AVG(Review.rating)` |
| **Distribution des notes** | Qualité perçue | Group by `rating` (1-5) |

### 2.6 🎫 KPIs Support

| KPI | Description | Calcul |
|-----|-------------|--------|
| **Tickets par catégorie** | Types de demandes | Group by `category` |
| **Tickets par statut** | File d'attente | Group by `status` |
| **Temps moyen de réponse** | SLA | `AVG(respondedAt - createdAt)` |
| **Taux de résolution** | Efficacité | `RESOLVED + CLOSED / total` |

---

## 3. Types de graphiques proposés

### 3.1 📊 Cards Statistiques (Chiffres clés)

**Usage** : Affichage instantané des métriques principales

| Card | Donnée | Indicateur secondaire |
|------|--------|----------------------|
| 👥 Utilisateurs | Total | +X ce mois (%) |
| 📦 Annonces actives | Total | X en attente |
| 🚨 Signalements | En attente | Urgence colorée |
| 🎫 Support | Tickets ouverts | Temps moyen réponse |
| 👁️ Vues totales | Cumul | Tendance 7j |
| ⭐ Note moyenne | /5 | Évolution |

**Position recommandée** : Header du dashboard (ligne principale)

### 3.2 📈 Line Charts (Évolution temporelle)

| Graphique | Données | Granularité | Période |
|-----------|---------|-------------|---------|
| **Inscriptions** | Nouveaux users par jour/semaine | Jour/Semaine | 30j/90j/1an |
| **Nouvelles annonces** | Annonces créées par jour | Jour/Semaine | 30j/90j |
| **Vues totales** | Cumul des vues | Jour | 30j |
| **Messages échangés** | Volume messages | Jour | 30j |
| **Signalements** | Évolution signalements | Semaine | 90j |

**Position recommandée** : Section centrale, pleine largeur

### 3.3 📊 Bar Charts (Comparaisons)

| Graphique | Données | Orientation |
|-----------|---------|-------------|
| **Annonces par catégorie** | Count par catégorie parent | Horizontal |
| **Utilisateurs par ville** | Top 10 villes | Horizontal |
| **Signalements par raison** | Répartition | Horizontal |
| **Tickets par catégorie** | Types de demandes | Horizontal |
| **Annonces par jour semaine** | Pattern d'activité | Vertical |

**Position recommandée** : Sections secondaires, demi-largeur

### 3.4 🍩 Donut/Pie Charts (Répartition)

| Graphique | Segments | Couleurs suggérées |
|-----------|----------|-------------------|
| **Statut utilisateurs** | PENDING/VERIFIED/TRUSTED/REJECTED/BANNED | Jaune/Vert/Bleu/Orange/Rouge |
| **Statut annonces** | active/sold/archived | Vert/Bleu/Gris |
| **Modération annonces** | PENDING/APPROVED/REJECTED | Jaune/Vert/Rouge |
| **Statut signalements** | PENDING/RESOLVED/REJECTED | Jaune/Vert/Orange |
| **Statut tickets** | OPEN/IN_PROGRESS/RESOLVED/CLOSED | Rouge/Jaune/Vert/Gris |

**Position recommandée** : Colonnes latérales ou sections tertiaires

### 3.5 📋 Tables/Listes (Détails)

| Liste | Colonnes | Actions |
|-------|----------|---------|
| **Derniers utilisateurs** | Avatar, Nom, Email, Date, Statut | Voir profil |
| **Dernières annonces** | Image, Titre, Prix, Catégorie, Statut | Modérer |
| **Signalements urgents** | Raison, Annonce/User, Date, Actions | Traiter |
| **Top annonces** | Titre, Vues, Favoris, Catégorie | Voir |
| **Tickets récents** | Sujet, Catégorie, Statut, Date | Répondre |

**Position recommandée** : Bas du dashboard ou onglets dédiés

---

## 4. Structure du dashboard

### 4.1 Architecture proposée

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 HEADER : Titre + Sélecteur de période + Actions globales    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 👥 Users│ │📦 Ads   │ │🚨 Reports│ │🎫 Support│ │👁️ Views │   │
│  │  1,234  │ │   567   │ │   12    │ │    8    │ │  45.2K  │   │
│  │ +15%    │ │ +8 pend │ │ urgent! │ │ avg 2h  │ │ ↑ 12%   │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📈 ÉVOLUTION PRINCIPALE (Line Chart - Full Width)              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │     Inscriptions & Annonces (30 jours)                      ││
│  │     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~            ││
│  │                                              ↗              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
├───────────────────────────────┬─────────────────────────────────┤
│                               │                                 │
│  📊 CATÉGORIES (Bar Chart)    │  🍩 RÉPARTITIONS (Donut Charts) │
│  ┌───────────────────────────┐│  ┌─────────────┐┌─────────────┐│
│  │ Mode         ████████ 234 ││  │   Users     ││   Ads       ││
│  │ Beauté       ██████ 189   ││  │    🍩       ││    🍩       ││
│  │ Services     █████ 156    ││  │ V:45% P:30% ││ A:80% P:15% ││
│  │ Maison       ████ 123     ││  └─────────────┘└─────────────┘│
│  └───────────────────────────┘│                                 │
│                               │                                 │
├───────────────────────────────┴─────────────────────────────────┤
│                                                                 │
│  📋 ACTIVITÉ RÉCENTE (3 colonnes)                               │
│  ┌─────────────────┐┌─────────────────┐┌─────────────────────┐ │
│  │ 👥 Nouveaux     ││ 📦 Dernières    ││ 🚨 Signalements     │ │
│  │   Utilisateurs  ││   Annonces      ││   En Attente        │ │
│  │ • Marie L.  2h  ││ • iPhone 13  1h ││ • Fraude    urgent  │ │
│  │ • Jean D.   5h  ││ • Robe Zara  3h ││ • Contenu   modéré  │ │
│  │ • Sara K.   8h  ││ • MacBook   12h ││ • Spam      normal  │ │
│  └─────────────────┘└─────────────────┘└─────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚡ ACTIONS RAPIDES                                              │
│  [Modérer annonces] [Valider utilisateurs] [Traiter signalements]│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Hiérarchie de l'information

1. **Niveau 1 - Critique** (Header)
   - Alertes (signalements, files d'attente)
   - KPIs principaux avec indicateurs de tendance

2. **Niveau 2 - Stratégique** (Corps principal)
   - Graphiques d'évolution temporelle
   - Répartitions et comparaisons

3. **Niveau 3 - Opérationnel** (Bas de page)
   - Listes d'actions à effectuer
   - Raccourcis vers les tâches courantes

### 4.3 Vues proposées

| Vue | Contenu | Audience |
|-----|---------|----------|
| **Dashboard Global** | Vue synthétique de tous les KPIs | Tous admins |
| **Détail Utilisateurs** | Focus users, vérifications, bans | Modérateurs |
| **Détail Annonces** | Focus modération, catégories | Modérateurs |
| **Détail Signalements** | Focus reports, urgences | Modérateurs senior |
| **Analytics Avancés** | Tendances long terme, prévisions | Direction |

---

## 5. Impact technique

### 5.1 Performance

#### Requêtes critiques identifiées

| Requête | Complexité | Risque | Mitigation |
|---------|------------|--------|------------|
| `COUNT(*)` sur User, Ad | Faible | ✅ Acceptable | Index existants |
| `GROUP BY categoryId` | Moyenne | ⚠️ Modéré | Limiter aux parents |
| `GROUP BY city` | Moyenne | ⚠️ Modéré | Limiter au top 10 |
| `SUM(views)` sur toutes les ads | Haute | 🔴 À surveiller | Cache ou pré-calcul |
| Jointures temporelles (30j) | Moyenne | ⚠️ Modéré | Index sur `createdAt` |
| Calculs de moyenne rating | Faible | ✅ Acceptable | Limité en volume |

#### Recommandations performance

1. **Index recommandés** (déjà présents selon le schéma) :
   - `User(createdAt)`, `User(verificationStatus)`, `User(isBanned)`
   - `Ad(createdAt)`, `Ad(status)`, `Ad(moderationStatus)`, `Ad(categoryId)`
   - `Report(status)`, `Report(createdAt)`

2. **Stratégie de cache** :
   - Stats globales : cache 5 minutes
   - Graphiques évolution : cache 15 minutes
   - Listes récentes : cache 1 minute ou temps réel

3. **Agrégations différées** :
   - Total vues : calcul nocturne ou incrémental
   - Historique 90j+ : tables d'agrégation

### 5.2 Sécurité

| Point | État actuel | Recommandation |
|-------|-------------|----------------|
| **Accès admin** | Middleware vérifie `role: ADMIN` | ✅ Maintenir |
| **Rate limiting** | À vérifier | Limiter les appels stats API |
| **Données sensibles** | Emails exposés | Masquer partiellement si export |
| **Logs d'accès** | À évaluer | Logger les accès dashboard |
| **CORS** | À vérifier | Restreindre aux domaines autorisés |

### 5.3 Scalabilité

| Seuil | Impact | Action recommandée |
|-------|--------|-------------------|
| < 10K users, 50K ads | Aucun | Requêtes directes OK |
| 10K-100K users | Modéré | Activer cache Redis |
| 100K+ users | Important | Tables d'agrégation, cron jobs |
| 1M+ records | Critique | Architecture événementielle (Kafka/RabbitMQ) |

---

## 6. Stratégie d'implémentation

### Phase 1 : Fondations (Semaine 1-2) ✅ **COMPLÉTÉE**
**Objectif** : Stats basiques déjà présentes améliorées

- [x] Enrichir `getDashboardStats()` → `getEnhancedDashboardStats()` avec :
  - Utilisateurs par statut de vérification
  - Annonces par statut de modération
  - Tickets support ouverts
  - Tendances 7 jours et mensuelle
- [x] Stats d'engagement (vues, favoris, messages, notes)
- [x] API `/api/admin/stats` - Stats enrichies
- [x] API `/api/admin/stats/timeline` - Données temporelles
- [x] API `/api/admin/stats/distribution` - Répartitions
- [x] Dashboard amélioré avec :
  - Cards avec tendances (+/-%)
  - Mini-donut charts CSS (statuts users/ads)
  - Section engagement
  - Actions rapides avec badges compteurs

### Phase 2 : Graphiques simples (Semaine 3-4) ✅ **COMPLÉTÉE**
**Objectif** : Visualisations temporelles basiques

- [x] Composants graphiques réutilisables (`components/admin/charts.tsx`)
  - TimelineChart (Area/Line chart)
  - MultiLineChart
  - SimpleBarChart
  - DonutChart avec légende
  - SparklineCard
- [x] Line chart : Évolution inscriptions sur période sélectionnée
- [x] Line chart : Évolution annonces sur période sélectionnée
- [x] Donut charts interactifs : Statuts users/ads avec tooltips
- [x] Bar charts : Top catégories et top villes
- [x] Sélecteur de période (7j/30j/90j)
- [x] Librairie utilisée : **Recharts**

### Phase 3 : Analytics par dimension (Semaine 5-6) ✅ **COMPLÉTÉE**
**Objectif** : Vues détaillées

- [x] Page analytics dédiée (`/admin/analytics`)
- [x] Graphique multi-séries (Users vs Ads)
- [x] Bar chart : Top 10 catégories
- [x] Bar chart : Top 10 villes
- [x] Graphiques d'engagement (messages, favoris)
- [x] Donuts : Utilisateurs par ville, Reports par raison, Tickets par catégorie
- [x] Top performances : Annonces vues, Annonces favorisées, Créateurs
- [x] Tables interactives avec tri
- [x] Utilitaire d'export CSV (`lib/export-csv.ts`)
- [x] Boutons d'export sur chaque section
- [x] Lien Analytics dans la navigation admin

### Phase 4 : Temps réel & alertes (Semaine 7-8) ✅ **COMPLÉTÉE**
**Objectif** : Monitoring actif

- [x] Système d'alertes configurable (`lib/admin-alerts.ts`)
  - Seuils personnalisables
  - Règles de détection automatique
  - 3 niveaux : danger, warning, info
- [x] Composants d'alertes (`components/admin/AlertsPanel.tsx`)
  - AlertsPanel : panneau complet avec dismiss
  - AlertBadge : badge pulsant
  - ToastNotification : toast animé
  - StatusIndicator : indicateur global
- [x] API `/api/admin/alerts` - Alertes actives en temps réel
- [x] Intégration au dashboard :
  - Indicateur de statut dans le header
  - Panneau d'alertes dépliable
  - Polling automatique (30s)
- [x] Persistance localStorage des alertes ignorées (24h)
- [x] Animations CSS (slide-up, shake)

### Phase 5 : Analytics avancés (Optionnel)
**Objectif** : Business intelligence

- [ ] Taux de conversion (inscription → 1ère annonce)
- [ ] Cohortes utilisateurs
- [ ] Prévisions tendances (ML light)
- [ ] Comparaison périodes (YoY, MoM)

---

## 7. Points de vigilance

### 7.1 ⚠️ Avant mise en production

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Requêtes lentes** | UX dégradée | Tests de charge, EXPLAIN ANALYZE |
| **Surcharge API** | Indisponibilité | Rate limiting, cache agressif |
| **Données incohérentes** | Décisions erronées | Validation des calculs, tests unitaires |
| **Accès non autorisé** | Fuite de données | Audit sécurité, tests pénétration |
| **Pic de mémoire** | Crash serveur | Pagination obligatoire, streams |

### 7.2 🔒 Checklist sécurité

- [ ] Vérifier que TOUTES les routes stats sont protégées par auth admin
- [ ] Aucune donnée sensible (mots de passe, tokens) exposée
- [ ] Rate limiting sur endpoints statistiques (max 60 req/min)
- [ ] Logging des accès au dashboard admin
- [ ] Validation des paramètres (dates, filtres) côté serveur

### 7.3 📊 Checklist données

- [ ] Vérifier cohérence des comptages (total = somme des statuts)
- [ ] Gérer les cas limites (0 données, nouvelles catégories)
- [ ] Documenter les définitions des KPIs
- [ ] Prévoir la gestion des fuseaux horaires

### 7.4 🎨 Checklist UX

- [ ] États de chargement (skeletons)
- [ ] Gestion des erreurs utilisateur
- [ ] Responsive design (mobile admin)
- [ ] Accessibilité (ARIA labels sur graphiques)
- [ ] Tooltips explicatifs sur les métriques

---

## 📎 Annexes

### A. Endpoints API suggérés

```
GET /api/admin/stats/overview          → KPIs globaux
GET /api/admin/stats/users             → Stats utilisateurs détaillées
GET /api/admin/stats/ads               → Stats annonces détaillées
GET /api/admin/stats/timeline?metric=X → Données temporelles
GET /api/admin/stats/distribution?by=X → Répartitions
```

### B. Librairies recommandées (sans ajout avant validation)

| Librairie | Usage | Bundle size | Alternative |
|-----------|-------|-------------|-------------|
| **Recharts** | Graphiques React | ~450KB | Victory, Nivo |
| **date-fns** | Déjà installé | - | - |
| **SWR** | Déjà installé | - | - |

### C. Schéma de cache suggéré

```
stats:overview         → TTL 5min
stats:timeline:users   → TTL 15min
stats:timeline:ads     → TTL 15min
stats:distribution:*   → TTL 30min
activity:recent        → TTL 1min
```

---

> **⚠️ RAPPEL** : Ce document est une **proposition d'analyse uniquement**.  
> Aucune implémentation ne doit être effectuée sans validation explicite de chaque phase.

---

*Document généré le 01/01/2026 par analyse automatisée du projet SweetLook*
