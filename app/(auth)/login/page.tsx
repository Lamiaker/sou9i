"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Check } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { getErrorMessage } from "@/lib/errors";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaError, setCaptchaError] = useState(false);

    const redirectPath = searchParams?.get("callbackUrl");
    const message = searchParams?.get("message");
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace(redirectPath || "/");
        }
    }, [status, session, router, redirectPath]);

    if (status === 'authenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(""); // Clear error on typing
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (process.env.NODE_ENV === 'production' && !captchaToken) {
            setError("Veuillez vérifier que vous n'êtes pas un robot");
            return;
        }

        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                captchaToken,
                redirect: false,
            });

            if (result?.error) {
                // Si l'erreur contient un message spécifique (ex: ban raison), on l'affiche
                if (result.error.includes("suspendu") || result.error.includes("banni")) {
                    setError(result.error);
                } else {
                    setError("Email ou mot de passe incorrect");
                }
                return;
            }

            router.refresh(); // Refresh pour mettre à jour la session
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full ">

            <div className="  sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                    Bonjour !
                </h2>
                <p className="ml-2 mt-2 text-center text-sm text-gray-600">
                    Connectez-vous pour découvrir toutes nos fonctionnalités.
                </p>
            </div>

            <div className=" sm:mx-auto  sm:w-full sm:max-w-md mt-8">
                {/* Message après changement de mot de passe */}
                {message === 'password-changed' && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm mx-3 sm:mx-0">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700 font-medium">
                                    Mot de passe modifié avec succès !
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Veuillez vous reconnecter avec votre nouveau mot de passe.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message si redirection car protection route */}
                {redirectPath && !error && (
                    <div className="mb-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md shadow-sm mx-3 sm:mx-0">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-orange-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-orange-700 font-medium">
                                    Vous devez être connecté pour accéder à cette page.
                                </p>
                                <p className="text-xs text-orange-600 mt-1">
                                    Veuillez vous connecter ou créer un compte.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-3 sm:mx-0">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Message d'erreur pour utilisateur banni */}
                        {error && (error.includes("suspendu") || error.includes("banni")) ? (
                            <div className="rounded-md bg-red-50 border border-red-200 p-4">
                                <p className="text-sm text-red-800 mb-2">{error}</p>
                                <p className="text-sm text-red-700">
                                    Pour contester cette décision, contactez-nous : {' '}
                                    <a
                                        href="mailto:support@sweetlook.net"
                                        className="font-medium underline hover:text-red-900"
                                    >
                                        support@sweetlook.net
                                    </a>
                                </p>
                            </div>
                        ) : error ? (
                            <div className="rounded-md bg-red-50 p-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        ) : null}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Adresse email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 outline-none border transition"
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="focus:ring-primary focus:border-primary block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-lg py-3 outline-none border transition"
                                    placeholder="••••••••"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link href="/forgot-password" title="Récupérer votre mot de passe" className="font-medium text-primary hover:text-secondary transition text-xs">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </div>

                        <TurnstileWidget
                            onVerify={(token) => {
                                setCaptchaToken(token);
                                setCaptchaError(false);
                            }}
                            onError={() => {
                                setCaptchaToken(null);
                                setCaptchaError(true);
                            }}
                            onExpire={() => {
                                setCaptchaToken(null);
                            }}
                        />

                        {captchaError && (
                            <p className="text-red-500 text-xs mt-1">
                                Erreur CAPTCHA. Veuillez rafraîchir la page.
                            </p>
                        )}

                        {/* Submit button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    }`}
                            >
                                {loading ? "Connexion..." : "Se connecter"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Nouveau sur SweetLook ?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link href="/signup" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                Créer un compte
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
