# 📚 API Documentation - Catégories

Cette documentation décrit toutes les routes API disponibles pour gérer les catégories.

## 🔗 Base URL
```
http://localhost:3000/api/categories
```

---

## 📋 Endpoints disponibles

### 1. Récupérer toutes les catégories

**GET** `/api/categories`

Récupère toutes les catégories avec différentes options.

#### Query Parameters:

| Paramètre | Type | Description | Valeurs possibles |
|-----------|------|-------------|-------------------|
| `type` | string | Type de récupération | `all` (défaut), `hierarchy`, `parents` |
| `withCount` | boolean | Inclure le compteur d'annonces | `true`, `false` |
| `parentId` | string | Récupérer les enfants d'une catégorie | ID de la catégorie parent |

#### Exemples:

**Toutes les catégories:**
```bash
GET /api/categories
GET /api/categories?type=all
```

**Catégories hiérarchiques (parents avec enfants):**
```bash
GET /api/categories?type=hierarchy
```

**Seulement les catégories parentes:**
```bash
GET /api/categories?type=parents
```

**Avec compteur d'annonces:**
```bash
GET /api/categories?withCount=true
```

**Enfants d'une catégorie spécifique:**
```bash
GET /api/categories?parentId=cm4ir7qvz0000123xyz
```

#### Réponse:
```json
{
  "success": true,
  "data": [
    {
      "id": "cm4ir7qvz0000123xyz",
      "name": "Gâteaux & Pâtisserie",
      "slug": "gateaux-patisserie",
      "icon": null,
      "description": null,
      "order": 0,
      "parentId": null,
      "createdAt": "2025-12-04T14:00:00.000Z",
      "children": [
        {
          "id": "cm4ir7qvz0001456abc",
          "name": "Gâteaux traditionnels",
          "slug": "gateaux-patisserie-gateaux-traditionnels",
          "parentId": "cm4ir7qvz0000123xyz",
          "_count": {
            "ads": 5
          }
        }
      ],
      "_count": {
        "ads": 12,
        "children": 4
      }
    }
  ]
}
```

---

### 2. Récupérer une catégorie par ID ou slug

**GET** `/api/categories/:id`

Récupère une catégorie spécifique par son ID ou son slug.

#### Path Parameters:

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID ou slug de la catégorie |

#### Query Parameters:

| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `includeRelations` | boolean | Inclure parent et enfants | `true` |

#### Exemples:

**Par ID:**
```bash
GET /api/categories/cm4ir7qvz0000123xyz
```

**Par slug:**
```bash
GET /api/categories/gateaux-patisserie
```

**Sans relations:**
```bash
GET /api/categories/gateaux-patisserie?includeRelations=false
```

#### Réponse réussie (200):
```json
{
  "success": true,
  "data": {
    "id": "cm4ir7qvz0000123xyz",
    "name": "Gâteaux & Pâtisserie",
    "slug": "gateaux-patisserie",
    "icon": null,
    "description": null,
    "order": 0,
    "parentId": null,
    "createdAt": "2025-12-04T14:00:00.000Z",
    "parent": null,
    "children": [...],
    "_count": {
      "ads": 12,
      "children": 4
    }
  }
}
```

#### Réponse erreur (404):
```json
{
  "success": false,
  "error": "Catégorie non trouvée"
}
```

---

### 3. Créer une nouvelle catégorie

**POST** `/api/categories`

Crée une nouvelle catégorie.

#### Body (JSON):

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | ✅ | Nom de la catégorie |
| `slug` | string | ✅ | Slug unique (URL-friendly) |
| `icon` | string | ❌ | Icône (optionnel) |
| `description` | string | ❌ | Description (optionnel) |
| `order` | number | ❌ | Ordre d'affichage |
| `parentId` | string | ❌ | ID de la catégorie parente |

#### Exemple:

```bash
POST /api/categories
Content-Type: application/json

{
  "name": "Nouvelle Catégorie",
  "slug": "nouvelle-categorie",
  "description": "Description de la catégorie",
  "order": 10
}
```

#### Réponse réussie (201):
```json
{
  "success": true,
  "data": {
    "id": "cm4ir7qvz0002789def",
    "name": "Nouvelle Catégorie",
    "slug": "nouvelle-categorie",
    "icon": null,
    "description": "Description de la catégorie",
    "order": 10,
    "parentId": null,
    "createdAt": "2025-12-04T15:00:00.000Z",
    "parent": null,
    "children": []
  }
}
```

#### Réponse erreur (400):
```json
{
  "success": false,
  "error": "Le nom et le slug sont requis"
}
```

#### Réponse erreur (409):
```json
{
  "success": false,
  "error": "Une catégorie avec ce slug existe déjà"
}
```

---

### 4. Mettre à jour une catégorie

**PUT** `/api/categories/:id`

Met à jour une catégorie existante.

#### Path Parameters:

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de la catégorie |

#### Body (JSON):

Tous les champs sont optionnels. Seuls les champs fournis seront mis à jour.

```json
{
  "name": "Nom modifié",
  "slug": "slug-modifie",
  "icon": "🎂",
  "description": "Nouvelle description",
  "order": 5,
  "parentId": "cm4ir7qvz0000123xyz"
}
```

#### Réponse réussie (200):
```json
{
  "success": true,
  "data": {
    "id": "cm4ir7qvz0002789def",
    "name": "Nom modifié",
    "slug": "slug-modifie",
    ...
  }
}
```

---

### 5. Supprimer une catégorie

**DELETE** `/api/categories/:id`

Supprime une catégorie.

⚠️ **Contraintes:**
- La catégorie ne doit pas avoir d'annonces
- La catégorie ne doit pas avoir de sous-catégories

#### Exemple:

```bash
DELETE /api/categories/cm4ir7qvz0002789def
```

#### Réponse réussie (200):
```json
{
  "success": true,
  "message": "Catégorie supprimée avec succès"
}
```

#### Réponse erreur (409):
```json
{
  "success": false,
  "error": "Impossible de supprimer : 12 annonce(s) utilisent cette catégorie"
}
```

ou

```json
{
  "success": false,
  "error": "Impossible de supprimer : cette catégorie a 4 sous-catégorie(s)"
}
```

---

## 🔧 Utilisation avec JavaScript/TypeScript

### Fetch API

```javascript
// Récupérer toutes les catégories hiérarchiques
async function getCategories() {
  const response = await fetch('http://localhost:3000/api/categories?type=hierarchy');
  const data = await response.json();
  
  if (data.success) {
    console.log('Catégories:', data.data);
  }
}

// Créer une catégorie
async function createCategory(categoryData) {
  const response = await fetch('http://localhost:3000/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  
  const data = await response.json();
  return data;
}
```

### Axios

```javascript
import axios from 'axios';

// Récupérer une catégorie
const category = await axios.get('/api/categories/gateaux-patisserie');

// Mettre à jour une catégorie
const updated = await axios.put(`/api/categories/${id}`, {
  name: 'Nouveau nom',
});

// Supprimer une catégorie
await axios.delete(`/api/categories/${id}`);
```

---

## 📊 Structure des données

### Category

```typescript
{
  id: string;                    // ID unique (CUID)
  name: string;                  // Nom de la catégorie
  slug: string;                  // Slug unique pour l'URL
  icon?: string;                 // Icône (optionnel)
  description?: string;          // Description (optionnel)
  order: number;                 // Ordre d'affichage (défaut: 0)
  parentId?: string;             // ID de la catégorie parente (null si parent)
  createdAt: Date;               // Date de création
  
  // Relations (si includeRelations = true)
  parent?: Category | null;      // Catégorie parente
  children?: Category[];         // Sous-catégories
  
  // Compteurs (si withCount = true ou type = hierarchy)
  _count?: {
    ads: number;                 // Nombre d'annonces actives
    children: number;            // Nombre de sous-catégories
  }
}
```

---

## 🧪 Tests

Un script de test est disponible :

```bash
node test-categories.mjs
```

Ce script teste tous les endpoints et affiche les résultats.

---

## 📝 Notes importantes

1. **Slugs uniques** : Chaque catégorie doit avoir un slug unique dans toute la table
2. **Hiérarchie** : Une catégorie peut avoir un parent et plusieurs enfants
3. **Compteurs automatiques** : Les compteurs `_count` sont calculés automatiquement
4. **Cascade delete** : Pensez à vérifier les annonces et sous-catégories avant suppression
5. **Performance** : Utilisez `type=hierarchy` pour obtenir l'arbre complet en une seule requête

---

## 🚀 Prochaines étapes

- [ ] Ajouter l'authentification pour POST, PUT, DELETE
- [ ] Ajouter la pagination pour GET /api/categories
- [ ] Ajouter le tri personnalisé
- [ ] Ajouter la recherche de catégories
- [ ] Ajouter la gestion des icônes/images
