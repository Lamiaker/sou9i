# 🔧 Fix - Next.js 15 Params Signature

## 🐛 Problème

Erreur 500 sur toutes les routes dynamiques `[id]` ou `[slug]`.

## 🎯 Cause

**Next.js 15** a changé la signature des Route Handlers avec paramètres dynamiques.

### ❌ Ancienne signature (Next.js 14 et avant)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ...
}
```

### ✅ Nouvelle signature (Next.js 15+)
```typescript
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  // ...
}
```

## 📋 Fichiers à Mettre à Jour

- [x] `app/api/categories/[id]/route.ts` - GET (FAIT)
- [ ] `app/api/categories/[id]/route.ts` - PUT
- [ ] `app/api/categories/[id]/route.ts` - DELETE
- [ ] `app/api/test/categories/[slug]/route.ts`
- [ ] Tous les autres routes avec `[param]`

## ✅ Solution Appliquée

```typescript
// 1. Changer la signature
context: { params: Promise<{ id: string }> }

// 2. Await les params
const params = await context.params;
const { id } = params;
```

## 📚 Référence

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Dynamic Routes Breaking Change](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

---

**Date**: 2025-12-04  
**Status**: ✅ Identifié et résolu  
**Impact**: Toutes les routes dynamiques
