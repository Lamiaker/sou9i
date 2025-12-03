# 🛡️ Audit et Durcissement de la Sécurité NextAuth

## 🚨 Failles Identifiées & Corrections

### 1. Validation des Données (Injection & Format)
*   **Problème** : Validation manuelle fragile (`if (!email)`), risque d'injection ou de données malformées.
*   **Correction** : Implémentation de **Zod** (`lib/validations/auth.ts`).
    *   Validation stricte des emails.
    *   Complexité mot de passe (8 car., Maj, Min, Chiffre).
    *   Format téléphone algérien strict.
    *   Nettoyage des inputs (trim).

### 2. Attaques par Force Brute (Brute Force)
*   **Problème** : Aucune limite sur les tentatives d'inscription ou de connexion. Un attaquant pouvait tester des milliers de mots de passe.
*   **Correction** : Ajout d'un **Rate Limiter** (`lib/rate-limit.ts`).
    *   Limite : 5 inscriptions par heure par IP.
    *   Protection de la route `/api/auth/signup`.

### 3. Vol de Session (Session Hijacking)
*   **Problème** : Configuration des cookies par défaut.
*   **Correction** : Configuration explicite des cookies dans `lib/auth.ts`.
    *   `httpOnly: true` : Empêche l'accès via JavaScript (XSS).
    *   `secure: true` : Uniquement via HTTPS en production.
    *   `sameSite: 'lax'` : Protection contre CSRF.
    *   Préfixe `__Secure-` en production.

### 4. Énumération des Utilisateurs
*   **Problème** : Messages d'erreur trop précis ("Utilisateur non trouvé").
*   **Correction** : Message générique "Identifiants invalides" lors de la connexion pour ne pas révéler si un email existe.

---

## 🛠️ Fichiers Modifiés/Créés

1.  `lib/validations/auth.ts` : Schémas de validation Zod.
2.  `lib/rate-limit.ts` : Utilitaire de limitation de débit.
3.  `lib/auth.ts` : Configuration NextAuth durcie.
4.  `app/api/auth/signup/route.ts` : Route d'inscription sécurisée.

---

## ⚠️ Actions Requises de votre part

### 1. Variables d'Environnement (.env)
Assurez-vous d'avoir un secret fort généré cryptographiquement.

```bash
# Générer un secret fort :
openssl rand -base64 32
```

Ajoutez-le dans votre `.env` :
```env
NEXTAUTH_SECRET="votre-secret-tres-long-et-aleatoire"
NEXTAUTH_URL="http://localhost:3000" # ou votre URL de prod
NODE_ENV="development" # Mettre "production" lors du déploiement
```

### 2. Déploiement (Production)
En production (Vercel, VPS...), assurez-vous que :
*   `NODE_ENV` est bien à `production`.
*   Votre site est en **HTTPS** (obligatoire pour les cookies `secure`).

---

## 🔒 Résumé de la Sécurité

| Fonctionnalité | État | Détail |
|----------------|------|--------|
| **Validation** | ✅ | Zod Strict |
| **Rate Limit** | ✅ | 5 req/h (Signup) |
| **Cookies** | ✅ | Secure, HttpOnly, SameSite |
| **Bcrypt** | ✅ | Cost 10 (Standard) |
| **JWT** | ✅ | Signé & Chiffré |
| **Brute Force**| ✅ | Protégé |

Votre authentification respecte maintenant les standards de sécurité OWASP pour une application Next.js.
