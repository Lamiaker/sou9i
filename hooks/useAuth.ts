'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRequireAuth(redirectUrl = '/login') {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return // Still loading

        if (!session) {
            router.push(`${redirectUrl}?redirect=${window.location.pathname}`)
        }
    }, [session, status, router, redirectUrl])

    return { session, status, isLoading: status === 'loading' }
}

export function useAuth() {
    const { data: session, status, update } = useSession()

    return {
        user: session?.user,
        isAuthenticated: !!session,
        isLoading: status === 'loading',
        status,
        update,
    }
}
