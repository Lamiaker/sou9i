'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface MessageBadgeProps {
    className?: string
    showZero?: boolean
    iconSize?: number
}

export default function MessageBadge({
    className = '',
    showZero = false,
    iconSize = 20
}: MessageBadgeProps) {
    const { status } = useSession()
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status !== 'authenticated') {
            setIsLoading(false)
            return
        }

        const fetchUnreadCount = async () => {
            try {
                const response = await fetch('/api/messages/unread')
                const data = await response.json()

                if (data.success) {
                    setUnreadCount(data.data.count)
                }
            } catch (error) {
                console.error('Erreur fetch unread count:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUnreadCount()

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(fetchUnreadCount, 30000)

        return () => clearInterval(interval)
    }, [status])

    if (status !== 'authenticated') {
        return null
    }

    return (
        <Link
            href="/dashboard/messages"
            className={`relative inline-flex items-center justify-center p-2 rounded-full transition hover:bg-gray-100 ${className}`}
            title={`${unreadCount} message(s) non lu(s)`}
        >
            <MessageCircle size={iconSize} className="text-gray-600" />
            {(unreadCount > 0 || (showZero && !isLoading)) && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    )
}
