/**
 * Custom Server pour Next.js avec Socket.IO
 * 
 * Ce fichier permet d'avoir un serveur HTTP persistant sur lequel
 * Socket.IO peut s'attacher correctement en production.
 * 
 * Utilisation:
 * - Développement: `npm run dev` (utilise toujours next dev)
 * - Production: `node server.js` (à la place de `next start`)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialiser l'application Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Variables globales
global.io = null;
global.httpServer = null;

/**
 * Configure l'adapter Redis pour Socket.io
 */
async function setupRedisAdapter(socketServer) {
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (!redisHost && !process.env.REDIS_URL) {
        console.log('[Socket.io] Redis non configuré, mode single-instance');
        return;
    }

    try {
        const redisConfig = process.env.REDIS_URL
            ? { url: process.env.REDIS_URL }
            : {
                socket: {
                    host: redisHost || '127.0.0.1',
                    port: parseInt(redisPort || '6379'),
                },
                password: process.env.REDIS_PASSWORD || undefined,
            };

        const pubClient = createClient(redisConfig);
        const subClient = pubClient.duplicate();

        pubClient.on('error', (err) => console.error('[Redis Pub] Erreur:', err.message));
        subClient.on('error', (err) => console.error('[Redis Sub] Erreur:', err.message));

        await Promise.all([pubClient.connect(), subClient.connect()]);

        socketServer.adapter(createAdapter(pubClient, subClient));

        console.log('[Socket.io] Adapter Redis connecté ✓');
    } catch (error) {
        console.error('[Socket.io] Erreur connexion Redis:', error);
        console.log('[Socket.io] Fallback en mode single-instance');
    }
}

/**
 * Initialise Socket.IO sur le serveur HTTP
 */
async function initSocketIO(httpServer) {
    const io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXTAUTH_URL || process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['polling', 'websocket'],
        pingTimeout: 60000,
        pingInterval: 25000,
        allowUpgrades: true,
        httpCompression: true,
    });

    // Configurer Redis en production
    if (process.env.NODE_ENV === 'production') {
        await setupRedisAdapter(io);
    }

    // Map des utilisateurs connectés
    const userSockets = new Map();

    io.on('connection', (socket) => {
        console.log(`[Socket.io] Nouvelle connexion: ${socket.id}`);

        socket.on('authenticate', async (userId) => {
            if (!userId) return;

            socket.data.userId = userId;
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);

            socket.emit('authenticated', { userId });
            console.log(`[Socket.io] Utilisateur ${userId} authentifié`);
        });

        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });

        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        socket.on('typing', (data) => {
            const userId = socket.data.userId;
            if (!userId) return;
            socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
                conversationId: data.conversationId,
                userId,
                isTyping: data.isTyping,
            });
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket.io] Déconnexion: ${socket.id} (${reason})`);
            const userId = socket.data.userId;
            if (userId) {
                const sockets = userSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) userSockets.delete(userId);
                }
            }
        });
    });

    return io;
}

app.prepare().then(async () => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Stocker les références globalement
    global.httpServer = httpServer;

    try {
        const io = await initSocketIO(httpServer);
        global.io = io;
        console.log('✅ Socket.IO initialisé sur le serveur HTTP');
    } catch (error) {
        console.error('❌ Erreur initialisation Socket.IO:', error);
    }

    httpServer.listen(port, hostname, () => {
        console.log(`
🚀 Serveur démarré sur http://${hostname}:${port}
📡 Socket.IO endpoint: /api/socket
🌍 Environnement: ${dev ? 'development' : 'production'}
        `);
    });

    // Gestion propre de l'arrêt
    const gracefulShutdown = () => {
        console.log('\n🛑 Arrêt gracieux du serveur...');
        if (global.io) {
            global.io.close(() => {
                console.log('✅ Socket.IO fermé');
            });
        }
        httpServer.close(() => {
            console.log('✅ Serveur HTTP fermé');
            process.exit(0);
        });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
});
