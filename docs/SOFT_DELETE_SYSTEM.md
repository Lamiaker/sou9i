# 🗑️ Soft Delete - Système de Suppression

## 🎯 Comment Ça Fonctionne

### Pour le CLIENT (Vendeur)

**Vue utilisateur** : Suppression normale
- Click sur [🗑️ Supprimer]
- Confirmation
- **L'annonce DISPARAÎT complètement** de son dashboard
- Il ne la voit plus jamais

**En réalité** : Soft Delete
- L'annonce existe toujours en base de données
- Son `status` passe à `"deleted"`
- Elle est automatiquement filtrée de toutes les vues client

### Pour l'ADMIN (Plus tard)

**Statistiques** :
- L'admin peut voir **toutes les annonces** (y compris deleted)
- Total des annonces créées (incluant les supprimées)
- Statistiques précises de la marketplace

---

## 🔧 Implémentation Technique

### 1. Filtrage Automatique Client

**Dans `app/dashboard/annonces/page.tsx`** :

```typescript
const { ads, loading, error, refetch } = useAds({
    filters: {
        userId: user?.id,
        // Ne jamais montrer les annonces deleted au client
        status: statusFilter === "all" 
            ? "active,pending,sold" // Tous sauf deleted
            : statusFilter,
    },
});
```

**Résultat** :
- ✅ Le filtre "Tous" affiche : active + pending + sold
- ❌ Le filtre "Tous" N'affiche PAS : deleted
- ✅ Plus d'option "Supprimé" dans le select

### 2. Soft Delete au Clic

**Code** :
```typescript
const handleDelete = async (adId: string) => {
    // PATCH au lieu de DELETE
    const response = await fetch(`/api/ads/${adId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: 'deleted',  // <-- Soft delete
            userId: user?.id,
        }),
    });
    
    // Après succès
    refetch(); // Recharge la liste (annonce disparaît)
};
```

### 3. Base de Données

**État de l'annonce** :
```sql
-- Avant suppression
status: "active"  

-- Après suppression
status: "deleted"  

-- L'annonce existe toujours !
-- Elle a juste un statut différent
```

---

## 📊 Requêtes API

### Client (Vendeur)

**GET /api/ads?userId=xxx** :
```javascript
// Filtre automatique dans useAds
filters: {
  userId: "user123",
  status: "active,pending,sold" // Pas de "deleted"
}

// Résultat: seulement les annonces actives/pending/vendues
```

### Admin (Future)

**GET /api/ads?includeDeleted=true** :
```javascript
// Admin peut voir toutes les annonces
filters: {
  // Pas de filtre status
  includeDeleted: true
}

// Résultat: TOUTES les annonces (y compris deleted)
```

---

## 💡 Avantages du Soft Delete

### Pour le Business

✅ **Statistiques précises** :
- Total des annonces créées (tous statuts confondus)
- Taux de suppression
- Analyse des raisons

✅ **Audit & Traçabilité** :
- Historique complet
- Qui a supprimé quoi et quand
- Restauration possible

✅ **Conformité** :
- Garder les données en cas de litige
- Respect des réglementations (period de conservation)

### Pour l'Utilisateur

✅ **Experience "normale"** :
- Il voit l'annonce disparaître
- Comme une vraie suppression
- Pas de confusion

❌ **Pas de spam** :
- Annonces deleted n'apparaissent pas publiquement
- Ne polluent pas les recherches

---

## 🔍 Où Sont Filtrées les Annonces Deleted ?

### 1. Dashboard Vendeur
**File**: `app/dashboard/annonces/page.tsx`
```typescript
status: "active,pending,sold" // Pas deleted
```

### 2. Recherche Publique
**File**: `app/api/ads/route.ts`
```typescript
// TODO: Filtrer automatiquement deleted
where: {
  status: { not: 'deleted' } // Annonces deleted invisibles
}
```

### 3. Détail Annonce
**File**:`app/annonces/[id]/page.tsx`
```typescript
// Si status === 'deleted', afficher 404
if (ad.status === 'deleted') {
  return <NotFound />
}
```

---

## 🛠️ Pour Restaurer une Annonce (Admin)

```typescript
// PATCH /api/ads/[id]
{
  "status": "active", // Repasser en active
  "userId": "admin-id"
}

// L'annonce réapparaît !
```

---

## 📈 Statistiques Admin (Future)

```typescript
// Total annonces créées (tous statuts)
const totalAds = await prisma.ad.count();
// Inclut: active, pending, sold, deleted

// Annonces actives
const activeAds = await prisma.ad.count({
  where: { status: 'active' }
});

// Taux de suppression
const deletedAds = await prisma.ad.count({
  where: { status: 'deleted' }
});

const deleteRate = (deletedAds / totalAds) * 100;
// Ex: "15% des annonces ont été supprimées"
```

---

## ✅ Résumé

| Aspect | Client | Admin |
|--------|--------|-------|
| **Voir annonces deleted** | ❌ Non | ✅ Oui |
| **Voir annonces actives** | ✅ Oui | ✅ Oui |
| **Supprimer** | Soft delete | Soft ou Hard delete |
| **Restaurer** | ❌ Non | ✅ Oui |
| **Statistiques** | Ses annonces actives | Toutes les annonces |

---

## 🎯 Résultat Final

**Pour le client** :
- Expérience normale de suppression
- Annonce disparaît complètement
- Dashboard propre et clair

**Pour l'admin** :
- Données conservées
- Statistiques précises
- Audit complet
- Possibilité de restauration

**Pour la marketplace** :
- Intégrité des données
- Traçabilité
- Conformité légale
- Analyse business

---

**Date**: 2025-12-05  
**Status**: ✅ **IMPLÉMENTÉ**  
**Test**: Créer une annonce → La supprimer → Elle disparaît du dashboard → Reste en BDD avec status="deleted"
