"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LogIn, UserPlus, FileText } from "lucide-react";

export default function ConnexionRequise() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/deposer");
        }
    }, [status, router]);

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100/50 backdrop-blur-sm">
            <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/5">
                    <FileText className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                    Déposer une annonce
                </h2>
                <p className="mt-4 text-gray-500 text-lg">
                    Pour déposer une annonce, vous devez être connecté à votre compte.
                </p>
            </div>

            <div className="mt-8 space-y-4">
                <Link href="/login?callbackUrl=%2Fdeposer" className="w-full group relative flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md hover:shadow-lg">
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <LogIn className="h-5 w-5 text-primary-content group-hover:text-white" aria-hidden="true" />
                    </span>
                    Se connecter
                </Link>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Pas encore de compte ?
                        </span>
                    </div>
                </div>

                <Link href="/signup" className="w-full group relative flex justify-center py-3 px-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-sm hover:shadow-md">
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <UserPlus className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    </span>
                    Créer un compte
                </Link>
            </div>

            <p className="mt-6 text-center text-sm text-gray-400">
                Rejoignez notre communauté et commencez à vendre dès aujourd&apos;hui !
            </p>
        </div>
    );
}
