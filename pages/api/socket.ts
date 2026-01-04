import type { NextApiRequest, NextApiResponse } from 'next'
import { initSocketServer } from '@/lib/socket'

/**
 * Cette route initialise le serveur Socket.io sur l'instance HTTP de Next.js.
 * Elle est appelée une seule fois lors de la première connexion client.
 */
export default function handler(req: NextApiRequest, res: any) {
    if (res.socket.server.io) {
        // Déjà initialisé
        res.end()
        return
    }

    console.log('🚀 Initialisation du serveur Socket.io...')

    // On passe l'instance du serveur HTTP de Next.js à notre utilitaire
    initSocketServer(res.socket.server)

    res.socket.server.io = true // Flag pour éviter la ré-initialisation
    res.end()
}

export const config = {
    api: {
        bodyParser: false,
    },
}

