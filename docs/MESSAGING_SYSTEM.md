# 💬 Système de Messagerie en Temps Réel

## 📋 Vue d'ensemble

Le système de messagerie permet aux utilisateurs de communiquer en quasi temps réel via un système de **polling intelligent**. Il inclut :

- ✅ Conversations entre acheteurs et vendeurs
- ✅ Synchronisation automatique des messages (polling toutes les 3 secondes)
- ✅ API REST complète pour toutes les opérations
- ✅ Association des conversations aux annonces
- ✅ Compteur de messages non lus
- ✅ Badge de notification
- ✅ Bouton "Contacter le vendeur" intégré

> **Note**: Le système utilise le polling HTTP au lieu de WebSocket pour une meilleure compatibilité avec Next.js App Router. Les messages sont rafraîchis automatiquement toutes les 3 secondes quand une conversation est ouverte.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  useMessages() ─────► useSocket() ─────► Socket.IO Client   │
│       │                                        │             │
│       ▼                                        ▼             │
│  /dashboard/messages               WebSocket Connection      │
│       │                                        │             │
└───────┼────────────────────────────────────────┼─────────────┘
        │                                        │
        ▼                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
├─────────────────────────────────────────────────────────────┤
│  /api/messages/* ◄────► MessageService ◄────► Socket.IO     │
│       │                      │                Server        │
│       ▼                      ▼                               │
│                         Prisma ORM                           │
│                             │                                │
│                             ▼                                │
│                        PostgreSQL                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers

```
├── services/
│   └── messageService.ts       # Service métier (CRUD conversations/messages)
│
├── app/api/messages/
│   ├── route.ts                # POST/GET messages
│   ├── unread/route.ts         # GET nombre de non-lus
│   └── conversations/
│       ├── route.ts            # GET/POST conversations
│       └── [id]/route.ts       # GET/DELETE conversation spécifique
│
├── pages/api/
│   └── socket.ts               # Serveur Socket.IO
│
├── lib/
│   └── socket.ts               # Configuration Socket.IO (alternative)
│
├── hooks/
│   ├── useSocket.ts            # Hook Socket.IO client
│   └── useMessages.ts          # Hook gestion messages haut niveau
│
├── components/messages/
│   └── ContactSellerButton.tsx # Bouton "Contacter le vendeur"
│
└── app/dashboard/messages/
    └── page.tsx                # Interface de messagerie
```

---

## 🔌 API REST

### Conversations

#### GET `/api/messages/conversations`
Récupère toutes les conversations de l'utilisateur connecté.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv-123",
      "adTitle": "iPhone 14 Pro",
      "adId": "ad-456",
      "participants": [...],
      "lastMessage": {...},
      "unreadCount": 2
    }
  ]
}
```

#### POST `/api/messages/conversations`
Crée une nouvelle conversation ou récupère une existante.

**Body :**
```json
{
  "recipientId": "user-456",
  "adTitle": "iPhone 14 Pro",
  "adId": "ad-789"
}
```

#### GET `/api/messages/conversations/[id]`
Récupère une conversation avec tous ses messages.

#### DELETE `/api/messages/conversations/[id]`
Supprime une conversation.

---

### Messages

#### POST `/api/messages`
Envoie un nouveau message.

**Body :**
```json
{
  "conversationId": "conv-123",
  "content": "Bonjour, votre annonce m'intéresse"
}
```

#### GET `/api/messages?conversationId=xxx&page=1&limit=50`
Récupère les messages avec pagination.

#### GET `/api/messages/unread`
Récupère le nombre total de messages non lus.

---

## 🔗 WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `userId: string` | Authentifier l'utilisateur |
| `join_conversation` | `conversationId: string` | Rejoindre une conversation |
| `leave_conversation` | `conversationId: string` | Quitter une conversation |
| `send_message` | `{ conversationId, content, senderId }` | Envoyer un message |
| `typing` | `{ conversationId, isTyping }` | Indicateur de frappe |
| `mark_read` | `{ conversationId }` | Marquer comme lu |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticated` | `{ userId, conversationsJoined }` | Confirmation auth |
| `new_message` | `Message` | Nouveau message reçu |
| `user_typing` | `{ conversationId, userId, isTyping }` | Quelqu'un tape |
| `messages_read` | `{ conversationId, userId }` | Messages marqués lus |
| `notification` | `{ type, conversationId, message }` | Notification |
| `error` | `{ message }` | Erreur |

---

## 🎣 Hooks React

### useSocket()

Hook bas niveau pour la connexion Socket.IO.

```typescript
const {
  isConnected,
  isAuthenticated,
  sendMessage,
  joinConversation,
  leaveConversation,
  sendTypingIndicator,
  markAsRead,
} = useSocket({
  onNewMessage: (msg) => console.log('New:', msg),
  onTyping: (event) => console.log('Typing:', event),
})
```

### useMessages()

Hook haut niveau pour la gestion complète des messages.

```typescript
const {
  // État
  conversations,
  selectedConversation,
  messages,
  isLoading,
  unreadTotal,
  isConnected,
  
  // Actions
  selectConversation,
  sendMessage,
  startConversation,
  sendTypingIndicator,
  markAsRead,
  
  // Helpers
  getOtherParticipant,
  currentUserId,
} = useMessages()
```

---

## 🎨 Composant ContactSellerButton

Bouton réutilisable pour contacter un vendeur :

```tsx
import ContactSellerButton from '@/components/messages/ContactSellerButton'

<ContactSellerButton
  sellerId="user-123"
  sellerName="Sarah"
  adId="ad-456"
  adTitle="iPhone 14 Pro"
  variant="primary"  // 'primary' | 'secondary' | 'outline'
  size="md"          // 'sm' | 'md' | 'lg'
  fullWidth={false}
/>
```

---

## 🚀 Utilisation

### 1. Démarrer une conversation depuis une annonce

Le bouton est déjà intégré dans `/app/annonces/[id]/page.tsx` :

```tsx
// Dans la page annonce (/annonces/[id])
import ContactSellerButton from '@/components/messages/ContactSellerButton'

// Dans le composant
<ContactSellerButton
  sellerId={ad.user.id}
  sellerName={ad.user.name || undefined}
  adId={ad.id}
  adTitle={ad.title}
  variant="outline"
  fullWidth
/>
```

Le bouton :
- Vérifie si l'utilisateur est connecté (sinon redirige vers login)
- Crée ou récupère une conversation existante
- Redirige vers `/dashboard/messages?conversation=xxx`
- La conversation s'ouvre automatiquement

### 2. Afficher le badge de messages non lus

```tsx
import { MessageBadge } from '@/components/messages'

// Dans le header ou sidebar
<MessageBadge iconSize={24} />
```

### 3. Envoyer un message programmatiquement

```tsx
import { useMessages } from '@/hooks/useMessages'

function MyComponent() {
  const { startConversation, sendMessage } = useMessages()
  
  const handleContact = async () => {
    // Créer ou récupérer la conversation
    const conv = await startConversation('user-456', 'iPhone 14 Pro', 'ad-789')
    
    // Envoyer un message
    if (conv) {
      await sendMessage('Bonjour, votre annonce m\'intéresse !')
    }
  }
}
```

---

## ⚙️ Configuration

### Variables d'environnement

```env
# .env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

### Prisma Schema

Les modèles `Conversation` et `Message` sont déjà définis dans `prisma/schema.prisma`.

---

## 🧪 Test

### Via l'interface

1. Connectez-vous avec deux comptes différents
2. Créez une annonce avec le premier compte
3. Avec le second compte, cliquez "Contacter le vendeur"
4. Envoyez des messages et observez le temps réel

### Via API

```bash
# Créer une conversation
curl -X POST http://localhost:3000/api/messages/conversations \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"recipientId": "user-456", "adTitle": "Test"}'

# Envoyer un message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"conversationId": "conv-123", "content": "Hello!"}'
```

---

## 🐛 Dépannage

### WebSocket ne se connecte pas

1. Vérifiez que le serveur est démarré avec `npm run dev`
2. Consultez la console du navigateur pour les erreurs
3. Le système utilise automatiquement le fallback API REST

### Messages non reçus en temps réel

1. Vérifiez l'indicateur de connexion (icône WiFi dans l'header)
2. Rafraîchissez la page pour reconnecter le WebSocket
3. Les messages sont toujours sauvegardés même sans WebSocket

### Erreur "Non authentifié"

1. Assurez-vous d'être connecté
2. La session a peut-être expiré, reconnectez-vous

---

## 📈 Prochaines améliorations

- [ ] Notifications push (Service Workers)
- [ ] Envoi de fichiers/images
- [ ] Messages vocaux
- [ ] Appels vidéo
- [ ] Archivage des conversations
- [ ] Blocage d'utilisateurs
- [ ] Recherche dans les messages

---

**Le système de messagerie est maintenant opérationnel !** 🎉
