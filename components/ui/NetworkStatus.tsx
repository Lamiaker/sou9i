'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function NetworkStatus() {
    const [isOffline, setIsOffline] = useState(false)
    const [showBackOnline, setShowBackOnline] = useState(false)

    useEffect(() => {
        function handleOnline() {
            setIsOffline(false)
            setShowBackOnline(true)
            const timer = setTimeout(() => setShowBackOnline(false), 3000)
            return () => clearTimeout(timer)
        }

        function handleOffline() {
            setIsOffline(true)
            setShowBackOnline(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Initial check
        if (!navigator.onLine) {
            setIsOffline(true)
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOffline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white py-1 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
                <WifiOff size={16} />
                Connexion perdue. Vous êtes en mode hors-ligne.
            </div>
        )
    }

    if (showBackOnline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white py-1 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
                <Wifi size={16} />
                Connexion rétablie !
            </div>
        )
    }

    return null
}
