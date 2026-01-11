import type { NextApiRequest, NextApiResponse } from 'next'
import { initSocketServer } from '@/lib/socket'

/**
 * Cette route initialise le serveur Socket.io sur l'instance HTTP de Next.js.
 * Elle est appelée une seule fois lors de la première connexion client.
 * 
 * En production avec Redis adapter, les messages sont synchronisés
 * entre tous les workers PM2.
 */
export default async function handler(req: NextApiRequest, res: any) {
    if (res.socket.server.io) {
        // Déjà initialisé
        res.end()
        return
    }

    // On passe l'instance du serveur HTTP de Next.js à notre utilitaire
    // initSocketServer est maintenant async pour configurer Redis
    const io = await initSocketServer(res.socket.server)

    res.socket.server.io = io // Stocker l'instance réelle
    res.end()
}

export const config = {
    api: {
        bodyParser: false,
    },
}
