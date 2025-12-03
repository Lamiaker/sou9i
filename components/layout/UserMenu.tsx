'use client'

import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'next-auth/react'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function UserMenu() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return (
            <>
                {/* Desktop - Style avec texte */}
                <Link
                    href="/login"
                    className="hidden lg:flex flex-col items-center group cursor-pointer text-gray-700"
                >
                    <User size={22} />
                    <span className="relative text-xs font-medium mt-1">
                        Se connecter
                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-secondary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                    </span>
                </Link>

                {/* Mobile - Bouton simple */}
                <Link
                    href="/login"
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
                >
                    <User size={22} className="text-gray-700" />
                </Link>
            </>
        )
    }

    return (
        <div className="relative" ref={menuRef}>
            {/* Desktop - User Avatar avec dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:flex items-center gap-2 hover:text-primary transition"
            >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
            </button>

            {/* Mobile - Bouton déconnexion direct */}
            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="lg:hidden p-2 hover:bg-red-50 rounded-full transition group"
                title="Se déconnecter"
            >
                <LogOut size={22} className="text-red-600" />
            </button>

            {/* Dropdown Menu (Desktop uniquement) */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsOpen(false)}
                    >
                        <User size={16} />
                        Mon tableau de bord
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                signOut({ callbackUrl: '/login' })
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full"
                        >
                            <LogOut size={16} />
                            Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
