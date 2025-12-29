"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogIn, UserPlus, Shield, Zap, Heart, Star, Sparkles } from "lucide-react";

export default function ConnexionRequise() {
    const { status } = useSession();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/deposer");
        }
    }, [status, router]);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-pulse" />
                </div>
            </div>
        );
    }

    const avantages = [
        { icon: Zap, text: "Publication instantanée", color: "text-amber-500" },
        { icon: Shield, text: "100% sécurisé", color: "text-emerald-500" },
        { icon: Heart, text: "C'est gratuit", color: "text-pink-500" },
        { icon: Star, text: "Communauté active", color: "text-purple-500" },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div
                className={`
                    grid md:grid-cols-2 gap-8 items-center
                    transition-all duration-700 ease-out
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
            >
                {/* Left side - Illustration & Benefits */}
                <div
                    className={`
                        hidden md:flex flex-col items-center space-y-8
                        transition-all duration-700 delay-200
                        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
                    `}
                >
                    {/* Illustration */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl scale-110"></div>
                        <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/50">
                            <Image
                                src="/images/connexion-illustration.png"
                                alt="Rejoignez SweetLook"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Benefits grid */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                        {avantages.map((avantage, index) => (
                            <div
                                key={index}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm
                                    border border-gray-100 shadow-sm hover:shadow-md transition-all
                                    hover:scale-105 cursor-default
                                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                                `}
                                style={{ transitionDelay: `${300 + index * 100}ms` }}
                            >
                                <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-50 to-white shadow-inner`}>
                                    <avantage.icon className={`h-4 w-4 ${avantage.color}`} />
                                </div>
                                <span className="text-xs font-medium text-gray-700">{avantage.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side - Main Card */}
                <div
                    className={`
                        relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl 
                        shadow-2xl shadow-gray-200/50 border border-white/50
                        transition-all duration-700 delay-100
                        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
                    `}
                >
                    {/* Decorative corner */}
                    <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full opacity-10 blur-xl"></div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur opacity-30 animate-pulse"></div>
                            <div className="relative mx-auto h-20 w-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transform hover:rotate-3 transition-transform">
                                <Sparkles className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                            Déposer une annonce
                        </h1>
                        <p className="mt-3 text-gray-500 text-base leading-relaxed">
                            Connectez-vous pour publier votre annonce et <br className="hidden sm:block" />
                            <span className="text-primary font-medium">toucher des milliers d'acheteurs</span>
                        </p>
                    </div>

                    {/* Mobile benefits */}
                    <div className="md:hidden flex flex-wrap justify-center gap-2 mb-6">
                        {avantages.map((avantage, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100"
                            >
                                <avantage.icon className={`h-3.5 w-3.5 ${avantage.color}`} />
                                <span className="text-xs font-medium text-gray-600">{avantage.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-4">
                        {/* Login button - Primary */}
                        <Link
                            href="/login?callbackUrl=%2Fdeposer"
                            className="
                                group relative w-full flex items-center justify-center gap-3 
                                py-4 px-6 rounded-2xl text-lg font-semibold text-white
                                bg-gradient-to-r from-primary via-primary to-secondary
                                hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
                                focus:outline-none focus:ring-4 focus:ring-primary/30
                                transition-all duration-300 overflow-hidden
                            "
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                            <LogIn className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            <span>Se connecter</span>
                        </Link>

                        {/* Separator */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200/80" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-sm text-gray-400 font-medium">
                                    Nouveau sur SweetLook ?
                                </span>
                            </div>
                        </div>

                        {/* Signup button - Secondary */}
                        <Link
                            href="/signup"
                            className="
                                group w-full flex items-center justify-center gap-3 
                                py-4 px-6 rounded-2xl text-lg font-semibold
                                text-gray-700 bg-gray-50 border-2 border-gray-200
                                hover:bg-white hover:border-primary/30 hover:text-primary
                                hover:shadow-lg hover:-translate-y-0.5
                                focus:outline-none focus:ring-4 focus:ring-primary/20
                                transition-all duration-300
                            "
                        >
                            <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span>Créer un compte gratuit</span>
                        </Link>
                    </div>

                    {/* Footer message */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400 leading-relaxed">
                            🌸 Rejoignez <span className="font-semibold text-primary">+10 000</span> utilisateurs<br />
                            qui font confiance à SweetLook
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
