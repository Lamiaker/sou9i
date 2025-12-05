# 🚀 Guide de Démarrage Rapide - FemMarket

## ✅ Prêt à Tester !

Votre marketplace est maintenant **fonctionnelle** ! Voici comment la tester :

---

## 1️⃣ Pré-requis

```bash
# Serveur démarré
npm run dev

# Base de données connectée
# Prisma configuré
# .env avec DATABASE_URL et NEXTAUTH_SECRET
```

---

## 2️⃣ Tester les Catégories

### Via le Navigateur
```
1. Ouvrir http://localhost:3000
2. Observer les catégories dans le header
3. Cliquer sur une catégorie
   → Redirection vers /categories/[slug]
4. Voir les annonces de cette catégorie
```

### Via l'API
```bash
# Toutes les catégories
curl http://localhost:3000/api/categories

# Hiérarchie
curl http://localhost:3000/api/categories?type=hierarchy

# Une catégorie
curl http://localhost:3000/api/categories/mode-beaute
```

---

## 3️⃣ Créer une Annonce de Test

### Méthode 1 : Via l'Interface (Recommandé)

```
1. Se connecter
   → http://localhost:3000/auth/login

2. Aller sur /deposer
   → http://localhost:3000/deposer

3. Uploader des images (1-5)
   → Depuis votre ordinateur

4. Remplir le formulaire
   Titre: "iPhone 14 Pro Max"
   Description: "Comme neuf, acheté il y a 3 mois..."
   Catégorie: "Mode & Beauté"
   Prix: 150000
   Location: "Alger"
   
5. Cliquer "Publier l'annonce"

6. ✅ Redirection automatique vers /annonces/[id]
```

### Méthode 2 : Via l'API (Pour Tests)

```bash
# 1. D'abord, uploader une image
curl -X POST http://localhost:3000/api/upload/images \
  -F "images=@/path/to/image.jpg"

# Réponse: { "data": ["/uploads/ads/xxx.jpg"] }

# 2. Créer l'annonce
curl -X POST http://localhost:3000/api/ads \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 14 Pro Max",
    "description": "Comme neuf...",
    "price": 150000,
    "categoryId": "cmiri1jfg000iwc4gf7t663i9",
    "userId": "votre-user-id",
    "location": "Alger",
    "images": ["/uploads/ads/xxx.jpg"],
    "condition": "Neuf",
    "negotiable": true,
    "deliveryAvailable": true
  }'
```

---

## 4️⃣ Voir une Annonce

```
1. Récupérer l'ID de l'annonce créée
   → Exemple: "clxy123abc"

2. Ouvrir
   → http://localhost:3000/annonces/clxy123abc

3. Vérifier l'affichage :
   ✓ Images en galerie
   ✓ Titre et prix
   ✓ Description
   ✓ Informations vendeur
   ✓ Annonces similaires
```

---

## 5️⃣ Parcourir les Annonces

```
# Toutes les annonces
http://localhost:3000/api/ads

# Par catégorie
http://localhost:3000/api/ads?categoryId=xxx

# Avec filtres
http://localhost:3000/api/ads?minPrice=1000&maxPrice=5000&location=Alger

# Page 2
http://localhost:3000/api/ads?page=2&limit=12
```

---

## 🧪 Checklist de Test

### Frontend

- [ ] **Homepage** charge
- [ ] **Catégories** s'affichent dans le header
- [ ] **Clic sur catégorie** → Page catégorie
- [ ] **Skeleton loader** pendant chargement
- [ ] **Page /categories** affiche toutes les catégories
- [ ] **Toggle Grille/Liste** fonctionne
- [ ] **Page /deposer** accessible après connexion
- [ ] **Upload d'images** fonctionne
- [ ] **Preview d'images** s'affiche
- [ ] **Suppression d'image** fonctionne
- [ ] **Formulaire** se valide
- [ ] **Soumission** crée l'annonce
- [ ] **Redirection** vers annonce créée
- [ ] **Page /annonces/[id]** affiche tout
- [ ] **Galerie d'images** navigation fonctionne
- [ ] **Annonces similaires** s'affichent

### API

- [ ] **GET /api/categories** → 200
- [ ] **GET /api/categories/[slug]** → 200
- [ ] **GET /api/ads** → 200
- [ ] **GET /api/ads/[id]** → 200
- [ ] **POST /api/upload/images** → URLs
- [ ] **POST /api/ads** → Annonce créée
- [ ] **POST /api/ads/[id]/views** → Vues incrémentées

---

## 🐛 Problèmes Courants

### 1. "Aucune catégorie ne s'affiche"

**Solution** :
```bash
# Vérifier que le seed a été exécuté
npx prisma db seed

# Vérifier l'API
curl http://localhost:3000/api/categories
```

### 2. "Erreur 500 sur /api/categories/[slug]"

**Solution** :
```
C'est le problème Next.js 15 !
→ Vérifier que la signature est :
context: { params: Promise<{ id: string }> }
const params = await context.params;
```

### 3. "Upload d'images échoue"

**Solution** :
```bash
# Vérifier que le dossier existe
ls public/uploads/ads/

# Créer si nécessaire
mkdir -p public/uploads/ads
```

### 4. "Pas de redirection après création annonce"

**Solution** :
```typescript
// Vérifier que l'API retourne bien :
{ success: true, data: { id: "xxx" } }

// Et que le code fait :
router.push(`/annonces/${result.data.id}`);
```

---

## 📊 Données de Test

### Créer un Utilisateur Test

```sql
-- Via Prisma Studio ou SQL
INSERT INTO User (id, email, name, password)
VALUES ('test-user-123', 'test@example.com', 'Test User', 'hashed-password');
```

### Catégories Existantes

```
✅ 75 catégories déjà seedées !

Principales :
- Mode & Beauté
- Gâteaux & Pâtisserie
- Décoration & Événements
- Bébé & Enfants
- Services Femmes
- ... et 70 autres
```

---

## 💡 Conseils

### Pour de Meilleursue Tests

1. **Utilisez de vraies images**
   - Téléchargez des images de produits
   - Minimum 500x500px recommandé

2. **Remplissez tous les champs**
   - Cela donne un aperçu réaliste
   - Teste toutes les fonctionnalités

3. **Créez plusieurs annonces**
   - Dans différentes catégories
   - Avec différents prix
   - Pour tester les filtres

4. **Testez sur mobile**
   - Responsive design
   - Touch interactions

---

## 🎯 Prochaine Étape

### Option 1 : Tests Manuels
```
→ Créer 5-10 annonces de test
→ Tester toutes les fonctionnalités
→ Noter les bugs/améliorations
```

### Option 2 : Seed Automatique
```
→ Créer un script de seed pour les annonces
→ Générer 20-50 annonces de test
→ Avec images placeholder
```

### Option 3 : Cloudinary
```
→ S'inscrire sur Cloudinary (gratuit)
→ Intégrer l'API
→ Remplacer upload local
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

- `docs/API_CATEGORIES.md` - API des catégories
- `docs/API_ADS.md` - API des annonces
- `docs/DEPOSER_ANNONCE_COMPLETE.md` - Dépôt d'annonce
- `docs/ADS_INTEGRATION_COMPLETE.md` - Intégration annonces
- `docs/SESSION_RECAP_05_12_2025.md` - Récap session

---

## ✅ Vous êtes PRÊT !

Tout est en place pour **tester votre marketplace** ! 🚀

**Commencez par** :
1. Se connecter
2. Aller sur `/deposer`
3. Créer votre première annonce
4. La voir publiée en temps réel !

---

**Besoin d'aide ?** Consultez les docs ou demandez de l'assistance !

**Bon test !** 🎉
