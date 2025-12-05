# ✅ Édition d'Annonce - Version Simplifiée

## 🎯 Champs Modifiables

### ✅ CE QUI PEUT ÊTRE MODIFIÉ

1. **Titre** - Texte libre
2. **Images** - Ajouter/Supprimer (max 5)
3. **Prix** - En DZD
4. **Description** - Texte long
5. **Localisation** - Ville/Wilaya
6. **Statut** - En ligne OU Vendu

### ❌ CE QUI NE PEUT PAS ÊTRE MODIFIÉ

- Catégorie (fixe)
- État (neuf, bon état, etc.)
- Marque
- Taille
- Livraison disponible
- Prix négociable

---

## 📝 Formulaire d'Édition

```
┌─────────────────────────────────────────┐
│ [← Retour] Modifier l'annonce           │
├─────────────────────────────────────────┤
│ 📷 Photos (3/5)                         │
│ [Img1] [Img2] [Img3] [+ Ajouter]        │
├─────────────────────────────────────────┤
│ • Titre *                               │
│ • Description *                         │
│ • Prix * | Localisation *               │
│ • Statut: [En ligne ▼]                 │
│           - En ligne                    │
│           - Vendu                       │
├─────────────────────────────────────────┤
│ [Annuler] [💾 Enregistrer]              │
└─────────────────────────────────────────┘
```

---

## 🔧 Champs du Formulaire

### 1. Titre
- **Type**: Texte
- **Requis**: Oui
- **Limite**: Aucune
- **Exemple**: "iPhone 14 Pro Max - Comme neuf"

### 2. Images
- **Type**: Upload multiple
- **Requis**: Au moins 1
- **Maximum**: 5 images
- **Actions**: 
  - Supprimer une image existante
  - Ajouter de nouvelles images
  - La 1ère image = principale

### 3. Prix
- **Type**: Number
- **Requis**: Oui
- **Minimum**: > 0
- **Format**: DZD (Dinar Algérien)
- **Exemple**: 150000

### 4. Description
- **Type**: Textarea (5 lignes)
- **Requis**: Oui
- **Limite**: Aucune
- **Placeholder**: "Décrivez votre article en détail..."

### 5. Localisation
- **Type**: Texte
- **Requis**: Oui
- **Exemple**: "Alger", "Oran", "Constantine"

### 6. Statut
- **Type**: Select
- **Options**: 
  - `active` → "En ligne"
  - `sold` → "Vendu"
- **Par défaut**: active

---

## 💾 Données Envoyées à l'API

```typescript
// PATCH /api/ads/[id]
{
  "title": string,
  "description": string,
  "price": number,
  "location": string,
  "images": string[],
  "status": "active" | "sold",
  "userId": string
}
```

**Note** : Seulement ces champs sont envoyés. Les autres (catégorie, marque, etc.) ne sont PAS modifiés.

---

## 🎨 Interface

### Header
```
[← Retour] Modifier l'annonce
Titre, images, prix, description, localisation et statut
```

### Section Images
- Grid 2-3 colonnes
- Badge "Principale" sur la 1ère
- Badge "Nouvelle" sur les nouvelles images (vert)
- Bouton ❌ pour supprimer
- Zone upload si < 5 images

### Formulaire
- 1 champ par ligne (mobile)
- 2 champs par ligne pour Prix/Localisation (desktop)
- Labels avec astérisque rouge pour champs requis
- Icônes à gauche (prix, localisation)

### Boutons
- **Annuler** : Bordure grise, retour /dashboard/annonces
- **Enregistrer** : Gradient primary→secondary, icône Save

---

## ✅ Validation

### Côté Client

```typescript
❌ Titre vide
❌ Description vide
❌ Prix <= 0
❌ Localisation vide
❌ Aucune image
```

### Messages d'Erreur

Affichés en haut du formulaire avec:
- Icône AlertCircle (rouge)
- Fond rouge-50
- Bordure rouge-200

### Messages de Succès

- Icône CheckCircle (vert)
- Fond vert-50
- "Annonce mise à jour avec succès !"
- "Redirection en cours..."
- Redirection après 2 secondes

---

## 🔒 Sécurité

### Vérification Propriétaire

```typescript
if (ad.userId !== user?.id) {
  router.push('/dashboard/annonces');
  return;
}
```

**Résultat** : Un utilisateur ne peut modifier QUE ses propres annonces.

---

## 📊 Workflow Complet

```
1. Clic [✏️ Modifier] depuis dashboard
   ↓
2. Redirection: /dashboard/annonces/[id]/edit
   ↓
3. Chargement annonce (GET /api/ads/[id])
   ↓
4. Vérification: userId === ad.userId
   ↓
5. Formulaire pré-rempli
   → Titre, description, prix, location, statut
   → Images existantes affichées
   ↓
6. Utilisateur modifie:
   → Change le titre
   → Supprime 1 image
   → Ajoute 2 nouvelles images
   → Change le prix
   → Change le statut: "Vendu"
   ↓
7. Clic [💾 Enregistrer]
   ↓
8. Upload nouvelles images
   → Retour URLs
   ↓
9. PATCH /api/ads/[id]
   → Seulement les champs modifiables
   {
     title, description, price,
     location, images, status, userId
   }
   ↓
10. Message succès
    ↓
11. Redirect /dashboard/annonces (2s)
```

---

## 🎯 Différence avec Création

| Champ | Création | Édition |
|-------|----------|---------|
| Titre | ✅ | ✅ |
| Description | ✅ | ✅ |
| Prix | ✅ | ✅ |
| Images | ✅ NEW | ✅ Existing + NEW |
| Localisation | ✅ | ✅ |
| **Catégorie** | ✅ | ❌ (Non modifiable) |
| **Sous-catégorie** | ✅ | ❌ |
| **État** | ✅ | ❌ |
| **Marque** | ✅ | ❌ |
| **Taille** | ✅ | ❌ |
| **Livraison** | ✅ | ❌ |
| **Négociable** | ✅ | ❌ |
| Statut | Auto (active) | ✅ (active/sold) |

---

## 💡 Pourquoi Cette Simplification ?

### Avantages

✅ **Plus Rapide**
- Moins de champs = édition plus rapide
- Focus sur l'essentiel

✅ **Plus Sûr**
- Catégorie non modifiable = pas de confusion
- Champs métier (marque, taille) fixés à la création

✅ **Meilleure UX**
- Interface claire
- Pas de surcharge cognitive
- Changements rapides (prix, statut)

### Use Cases Principaux

1. **Ajuster le prix** (baisse, hausse)
2. **Marquer comme vendu** (sold)
3. **Améliorer la description** (plus de détails)
4. **Ajouter/supprimer des photos**
5. **Corriger une faute** dans le titre

---

## 🧪 Tests

### Scénario 1 : Modification Simple

```
1. Modifier le prix: 150000 → 140000
2. Cliquer Enregistrer
3. ✅ Prix mis à jour
4. ✅ Redirection dashboard
```

### Scénario 2 : Ajouter Images

```
1. Annonce avec 2 images
2. Ajouter 2 nouvelles images
3. Total: 4 images
4. Enregistrer
5. ✅ 4 images dans l'annonce
```

### Scénario 3 : Marquer Vendu

```
1. Statut: "En ligne"
2. Changer → "Vendu"
3. Enregistrer
4. ✅ Annonce marquée vendue
5. ✅ Badge "Vendu" dans dashboard
```

### Scénario 4 : Sécurité

```
1. Utilisateur A tente de modifier annonce de B
2. ✅ Redirection dashboard
3. ❌ Pas d'accès au formulaire
```

---

## 📁 Fichier

**Path**: `app/dashboard/annonces/[id]/edit/page.tsx`

**Imports**:
- `useAuth` - Vérifier connexion et propriétaire
- `useAd` - Charger l'annonce
- `useImageUpload` - Upload nouvelles images

**State**:
```typescript
formData: {
  title, description, price, location, status
}
existingImages: string[]
newFiles: File[]
```

---

## ✅ Résumé

**6 champs modifiables** :
1. Titre
2. Images
3. Prix
4. Description
5. Localisation
6. Statut (En ligne / Vendu)

**Statut** : Juste 2 options
- En ligne (active)
- Vendu (sold)

**Simplicité** : Interface épurée, modification rapide

---

**Date**: 2025-12-05  
**Status**: ✅ **SIMPLIFIÉ ET FONCTIONNEL**  
**Version**: Finale
