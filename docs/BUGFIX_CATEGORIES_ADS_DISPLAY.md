# 🐛 BUG FIX - Annonces Non Affichées Dans Les Catégories

## ❌ Problème Identifié

Les annonces n'apparaissaient PAS sur les pages de catégories (`/categories/[slug]`).

---

## 🔍 Cause Racine

**Mauvais accès aux données de l'API** :

### Structure API Retournée
```json
{
  "success": true,
  "data": [
    { "id": "1", "title": "iPhone 14", ... },
    { "id": "2", "title": "Robe", ... }
  ],
  "pagination": { "page": 1, "total": 2 }
}
```

### Code de la Page (AVANT - ❌ CASSÉ)
```typescript
if (data.success) {
    setAds(data.data.ads || []);  // ❌ data.data.ads n'existe pas !
}
```

**Résultat** : `data.data.ads` = `undefined` → Aucune annonce affichée

---

## ✅ Solution

### Code Corrigé (APRÈS)
```typescript
if (data.success) {
    const adsArray = Array.isArray(data.data) ? data.data : [];
    setAds(adsArray);  // ✅ Accès correct
}
```

---

## 📊 Logs de Débogage Ajoutés

Pour faciliter le diagnostic futur :

```typescript
console.log('🔍 Fetching ads for category:', category.name, 'ID:', category.id);
console.log('📡 API URL:', `/api/ads?${params.toString()}`);
console.log('📦 API Response:', data);
console.log(`✅ ${adsArray.length} annonce(s) trouvée(s)`);
```

**Ouvrir la console du navigateur** pour voir ces logs !

---

## 🧪 Tests

### 1. Test Navigateur

1. Aller sur `/categories/mode-beaute` (ou n'importe quelle catégorie)
2. **Ouvrir DevTools** (F12)
3. **Onglet Console** :
   ```
   🔍 Fetching ads for category: Mode & Beauté ID: cat-123
   📡 API URL: /api/ads?categoryId=cat-123&status=active&sortBy=recent
   📦 API Response: {success: true, data: Array(3), pagination: {...}}
   ✅ 3 annonce(s) trouvée(s)
   ```
4. **Résultat** : Les annonces s'affichent ! ✅

### 2. Test API Direct

```bash
# Browser ou curl
http://localhost:3000/api/ads?status=active
```

**Vérifier** :
```json
{
  "success": true,
  "data": [...]  // ← Les annonces sont ICI (pas dans data.ads !)
}
```

---

## 📁 Fichiers Modifiés

| Fichier | Modification |
|---------|--------------|
| `app/categories/[slug]/page.tsx` | ✅ Correction accès `data.data` au lieu de `data.data.ads` |
| `app/categories/[slug]/page.tsx` | ✅ Ajout logs deconsolle pour debug |
| `services/adService.ts` | ✅ Filtre catégorie + sous-catégories |

---

## 🎯 Comportement Final

### Scénario Complet

**1. Page catégorie charge** :
```
URL: /categories/mode-beaute
```

**2. Hook récupère catégorie** :
```typescript
const { category } = useCategory('mode-beaute');
// category.id = "cat-mode-123"
```

**3. Appel API** :
```
GET /api/ads?categoryId=cat-mode-123&status=active
```

**4. Service filtre** :
```typescript
// Récupère catégorie + ses enfants (sous-catégories)
categoryIds = ["cat-mode-123", "sub-vet-456", "sub-chau-789"]
// Cherche dans TOUTES ces catégories
```

**5. Réponse API** :
```json
{
  "success": true,
  "data": [
    { "id": "1", "title": "Robe", "categoryId": "sub-vet-456" },
    { "id": "2", "title": "Chaussures", "categoryId": "sub-chau-789" }
  ]
}
```

**6. Page affiche** :
```typescript
setAds(data.data);  // ✅ 2 annonces
```

**7. Rendu** :
```
✅ 2 annonces affichées avec leurs cartes !
```

---

## 🔧 Si Problème Persiste

### Check 1 : Console Navigateur
**Ouvrir DevTools → Console**

**Chercher** :
- 🔍 "Fetching ads for category"
- ✅ "X annonce(s) trouvée(s)"

**Si 0 annonce** → Problème de données

### Check 2 : Network Tab
**DevTools → Network**

1. Filtrer "ads"
2. Voir requête `/api/ads?categoryId=...`
3. Cliquer dessus
4. **Response** : Voir combien d'annonces retournées

### Check 3 : Prisma Studio
**Déjà ouvert**

1. **Table `Ad`** :
   - Vérifier `status` = `"active"`
   - Noter le `categoryId`

2. **Table `Category`** :
   - Trouver la catégorie avec ce `id`
   - Vérifier qu'elle existe

### Check 4 : API Debug
```
http://localhost:3000/api/debug/ads
```

**Voir** :
- Combien d'annonces actives
- Leurs categoryId
- Les catégories disponibles

---

## ✅ Résultat

**AVANT** :
- ❌ Page vide
- ❌ `data.data.ads` = `undefined`
- ❌ Erreur silencieuse

**MAINTENANT** :
- ✅ Annonces affichées
- ✅ Logs clairs dans console
- ✅ Filtre catégorie + sous-catégories fonctionne

---

**Date**: 2025-12-05  
**Status**: ✅ **CORRIGÉ**  
**Bug**: Mauvais accès aux données API (`data.data.ads` → `data.data`)

🎉 **Les annonces s'affichent maintenant sur les pages de catégories !**
