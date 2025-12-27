"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, CheckCircle, Star, XCircle, Ban, Users, Search } from 'lucide-react';

const tabs = [
    { name: 'En attente', href: '/admin/users', icon: Clock },
    { name: 'Vérifiés', href: '/admin/users/verified', icon: CheckCircle },
    { name: 'Confiance', href: '/admin/users/trusted', icon: Star },
    { name: 'Rejetés', href: '/admin/users/rejected', icon: XCircle },
    { name: 'Bannis', href: '/admin/users/banned', icon: Ban },
    { name: 'Tous', href: '/admin/users/all', icon: Users },
    { name: 'Recherche ID', href: '/admin/search', icon: Search },
];

export default function UsersNav() {
    const pathname = usePathname();

    return (
        <div className="flex flex-wrap gap-2 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                            ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg"
                            : "text-white/60 hover:text-white hover:bg-white/10"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
