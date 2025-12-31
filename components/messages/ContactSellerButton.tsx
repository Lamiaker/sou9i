'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2 } from 'lucide-react'

interface ContactSellerButtonProps {
    sellerId: string
    sellerName?: string
    adId?: string
    adTitle?: string
    className?: string
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
    fullWidth?: boolean
}

export default function ContactSellerButton({
    sellerId,
    sellerName,
    adId,
    adTitle,
    className = '',
    variant = 'primary',
    size = 'md',
    showIcon = true,
    fullWidth = false,
}: ContactSellerButtonProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        // Si non connecté, rediriger vers login
        if (status !== 'authenticated') {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
            return
        }

        // Ne pas permettre de se contacter soi-même
        if (session?.user?.id === sellerId) {
            return
        }

        setIsLoading(true)

        try {
            // Créer ou récupérer la conversation
            const response = await fetch('/api/messages/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: sellerId,
                    adTitle: adTitle,
                    adId: adId,
                }),
            })

            const data = await response.json()

            if (data.success) {
                // Rediriger vers la page de messages avec la conversation sélectionnée
                router.push(`/dashboard/messages?conversation=${data.data.id}`)
            } else {
                console.error('Erreur:', data.error)
                alert('Impossible de démarrer la conversation. Veuillez réessayer.')
            }
        } catch (error) {
            console.error('Erreur:', error)
            alert('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setIsLoading(false)
        }
    }

    // Styles selon la variante
    const variantStyles = {
        primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-[1.02]',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    }

    // Styles selon la taille
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2.5 text-base gap-2',
        lg: 'px-6 py-3 text-lg gap-2.5',
    }

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 22,
    }

    // Si c'est l'utilisateur lui-même, ne pas afficher le bouton
    if (session?.user?.id === sellerId) {
        return null
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
        >
            {isLoading ? (
                <Loader2 size={iconSizes[size]} className="animate-spin" />
            ) : showIcon ? (
                <MessageCircle size={iconSizes[size]} />
            ) : null}
            <span>
                {isLoading
                    ? 'Chargement...'
                    : status !== 'authenticated'
                        ? 'Se connecter pour contacter'
                        : `Contacter ${sellerName || 'le vendeur'}`
                }
            </span>
        </button>
    )
}
