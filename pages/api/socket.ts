import type { NextApiRequest, NextApiResponse } from 'next'
import { initSocketServer } from '@/lib/socket'

/**
 * Cette route initialise le serveur Socket.io sur l'instance HTTP de Next.js.
 * Elle est appelée une seule fois lors de la première connexion client.
 * 
 * NOTE: En production avec le custom server (server.js), cette route
 * est rarement appelée car Socket.io est déjà initialisé au démarrage.
 * Elle reste utile pour next dev et comme fallback.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: NextApiRequest, res: NextApiResponse & { socket: any }) {
    // Si Socket.io est déjà initialisé globalement (custom server) ou localement
    if (global.io || res.socket?.server?.io) {
        console.log('[/api/socket] Socket.io déjà initialisé')
        res.end()
        return
    }

    console.log('[/api/socket] Initialisation de Socket.io...')

    // On passe l'instance du serveur HTTP de Next.js à notre utilitaire
    const io = await initSocketServer(res.socket.server)

    // Stocker l'instance sur le serveur HTTP (pour next dev)
    res.socket.server.io = io

    console.log('[/api/socket] Socket.io initialisé ✓')
    res.end()
}

export const config = {
    api: {
        bodyParser: false,
    },
}
