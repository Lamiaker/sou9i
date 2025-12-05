# 🗑️ Gestion des Images - Suppression Automatique

## ✅ SOLUTION IMPLÉMENTÉE

Les **images orphelines sont maintenant supprimées automatiquement** du serveur !

---

## 🔧 Comment Ça Fonctionne

### 1. Édition d'Annonce

**Scénario** : Client retire 2 images

```
Avant édition :
- BDD: ["img1.jpg", "img2.jpg", "img3.jpg"]
- Serveur: img1.jpg, img2.jpg, img3.jpg

Client retire img2.jpg et img3.jpg

Après édition :
- BDD: ["img1.jpg"]
- Serveur: img1.jpg
- ✅ SUPPRIMÉ: img2.jpg, img3.jpg
```

**Code** :
```typescript
// Dans PATCH /api/ads/[id]

// 1. Récupérer l'annonce actuelle
const currentAd = await AdService.getAdById(id);

// 2. Comparer anciennes vs nouvelles images
const oldImages = currentAd.images; // ["img1.jpg", "img2.jpg", "img3.jpg"]
const newImages = body.images;       // ["img1.jpg"]

// 3. Supprimer les images orphelines
await deleteUnusedImages(oldImages, newImages);
// → Supprime img2.jpg et img3.jpg du serveur
```

### 2. Suppression d'Annonce (Soft Delete)

**Scénario** : Client supprime son annonce

**Option 1 - Conservation (Actuel)** :
```
- Annonce: status = "deleted"
- Images: CONSERVÉES sur le serveur
- Raison: Possibilité de restauration
```

**Option 2 - Suppression (Optionnel)** :
```
- Annonce: status = "deleted"
- Images: SUPPRIMÉES du serveur
- Gain d'espace immédiat
```

---

## 📁 Fichier Utilitaire

**Path**: `lib/deleteImages.ts`

```typescript
export async function deleteUnusedImages(
  oldImages: string[], 
  newImages: string[]
): Promise<void> {
  
  // Trouver les images à supprimer
  const imagesToDelete = oldImages.filter(
    img => !newImages.includes(img)
  );
  
  // Supprimer chaque fichier
  for (const imageUrl of imagesToDelete) {
    const filePath = path.join(
      process.cwd(), 
      'public', 
      imageUrl.replace(/^\//, '')
    );
    
    await unlink(filePath); // Suppression
    console.log(`✅ Image supprimée: ${imageUrl}`);
  }
}
```

---

## 🎯 Cas d'Usage

### Cas 1 : Retirer 1 Image

```
1. Annonce avec 3 images
2. Client retire la 2ème
3. Enregistre

Résultat:
✅ BDD mise à jour (2 images)
✅ Fichier supprimé du serveur
```

### Cas 2 : Remplacer Toutes les Images

```
1. Annonce avec 3 anciennes images
2. Client supprime les 3
3. Ajoute 3 nouvelles images
4. Enregistre

Résultat:
✅ 3 anciennes images SUPPRIMÉES
✅ 3 nouvelles images UPLOAD
✅ BDD mise à jour
```

### Cas 3 : Ajouter Sans Retirer

```
1. Annonce avec 2 images
2. Client ajoute 2 nouvelles (total 4)
3. Enregistre

Résultat:
✅ 2 anciennes images CONSERVÉES
✅ 2 nouvelles images AJOUTÉES
❌ Rien supprimé
```

---

## ⚙️ Configuration

### Mode Synchrone (Actuel)

```typescript
// Attend la suppression avant de continuer
await deleteUnusedImages(oldImages, newImages);
```

**Avantage** : Garantie de suppression  
**Inconvénient** : Ralentit la réponse

### Mode Asynchrone (Recommandé)

```typescript
// Supprime en arrière-plan
deleteUnusedImages(oldImages, newImages).catch(err => {
  console.error('Erreur suppression images:', err);
});
```

**Avantage** : Réponse rapide  
**Inconvénient** : Suppression non garantie

**Actuellement implémenté** : Mode **asynchrone** pour ne pas bloquer la réponse.

---

## 🔍 Logs de Débogage

```
Console server :

Suppression de 2 image(s) orpheline(s)
✅ Image supprimée: /uploads/ads/1733407200-abc123.jpg
✅ Image supprimée: /uploads/ads/1733407201-def456.jpg
```

---

## 🛡️ Gestion d'Erreurs

### Fichier Déjà Supprimé

```typescript
try {
  await unlink(filePath);
} catch (error) {
  // Fichier inexistant = pas grave
  console.error('Fichier déjà supprimé');
}
```

### Permission Refusée

```
❌ Erreur suppression: EACCES (permission denied)
→ Vérifier les permissions du dossier /public/uploads/ads/
```

---

## 📊 Économie d'Espace

### Exemple Réel

**Sans suppression automatique** :
```
100 annonces
Chacune modifie 2 fois ses images (3 images par annonce)

Total fichiers orphelins: 100 × 2 × 3 = 600 images
Taille moyenne: 500 KB par image
Espace gaspillé: 600 × 500 KB = 300 MB
```

**Avec suppression automatique** :
```
Espace gaspillé: ~0 MB ✅
```

---

## 🧪 Tests

### Test 1 : Suppression Simple

```bash
# 1. Créer annonce avec 3 images
POST /api/ads
{ images: ["img1.jpg", "img2.jpg", "img3.jpg"] }

# 2. Vérifier dossier
ls public/uploads/ads/
→ img1.jpg, img2.jpg, img3.jpg ✅

# 3. Retirer img2.jpg
PATCH /api/ads/[id]
{ images: ["img1.jpg", "img3.jpg"] }

# 4. Vérifier dossier
ls public/uploads/ads/
→ img1.jpg, img3.jpg
→ img2.jpg SUPPRIMÉ ✅
```

### Test 2 : Remplacement Total

```bash
# 1. Annonce avec anciennes images
images: ["old1.jpg", "old2.jpg"]

# 2. Remplacer par nouvelles
PATCH /api/ads/[id]
{ images: ["new1.jpg", "new2.jpg"] }

# 3. Vérifier
ls public/uploads/ads/
→ new1.jpg, new2.jpg ✅
→ old1.jpg, old2.jpg SUPPRIMÉS ✅
```

---

## 💡 Améliorations Futures

### 1. Nettoyage Cron

```typescript
// Script qui tourne chaque nuit
// Supprime images non référencées en BDD

async function cleanOrphanImages() {
  // 1. Lister tous les fichiers
  const files = await readdir('public/uploads/ads');
  
  // 2. Lister toutes les images en BDD
  const usedImages = await prisma.ad.findMany({
    select: { images: true }
  });
  
  // 3. Supprimer les orphelines
  for (const file of files) {
    if (!isUsedInDB(file, usedImages)) {
      await unlink(file);
    }
  }
}
```

### 2. Corbeille Temporaire

```
Au lieu de supprimer immédiatement :
1. Déplacer vers /uploads/trash/
2. Garder 30 jours
3. Suppression définitive après
```

### 3. Logs Détaillés

```typescript
// Tracer toutes les suppressions
await logger.log({
  action: 'IMAGE_DELETED',
  file: imageUrl,
  adId: id,
  userId: userId,
  timestamp: new Date()
});
```

---

## ✅ Résumé

| Action | Avant | Maintenant |
|--------|-------|------------|
| **Retirer images** | ❌ Fichiers orphelins | ✅ Supprimés auto |
| **Remplacer images** | ❌ Cumul fichiers | ✅ Anciens supprimés |
| **Espace disque** | ❌ Gaspillage | ✅ Optimisé |
| **Performance** | ⚠️ Serveur surchargé | ✅ Propre |

---

## 🎯 Résultat

**AVANT** :
```
/public/uploads/ads/
  ├─ image1.jpg ✅ (utilisée)
  ├─ image2.jpg ⚠️ (orpheline)
  ├─ image3.jpg ⚠️ (orpheline)
  ├─ image4.jpg ✅ (utilisée)
  └─ ... (des centaines d'orphelines)
```

**MAINTENANT** :
```
/public/uploads/ads/
  ├─ image1.jpg ✅ (utilisée)
  ├─ image4.jpg ✅ (utilisée)
  └─ ... (seulement images utilisées) ✅
```

---

**Date**: 2025-12-05  
**Status**: ✅ **IMPLÉMENTÉ**  
**Bénéfice**: Suppression automatique des images orphelines  
**Mode**: Asynchrone (non-bloquant)

🎉 **Plus de fichiers orphelins !**
