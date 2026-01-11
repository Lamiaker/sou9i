"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaError, setCaptchaError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (process.env.NODE_ENV === 'production' && !captchaToken) {
            setError("Veuillez vérifier que vous n'êtes pas un robot");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, captchaToken }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Une erreur est survenue");
            }
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    // Affichage après envoi réussi
    if (success) {
        return (
            <div className="w-full">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-3 sm:mx-0">
                        {/* Icône de succès */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
                            Email envoyé !
                        </h2>

                        <p className="text-center text-gray-600 mb-6">
                            Si un compte existe avec l'adresse{" "}
                            <span className="font-medium text-gray-900">{email}</span>, vous
                            recevrez un lien de réinitialisation dans quelques instants.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-blue-900 mb-2">
                                📬 Vérifiez votre boîte email
                            </h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Vérifiez également vos spams</li>
                                <li>• Le lien est valide pendant 1 heure</li>
                                <li>• Ne partagez ce lien avec personne</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail("");
                                }}
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                Renvoyer vers une autre adresse
                            </button>

                            <Link
                                href="/login"
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary transition"
                            >
                                <ArrowLeft size={16} />
                                Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* En-tête */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Mot de passe oublié ?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Pas de panique ! Entrez votre email et nous vous enverrons un lien
                        pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {/* Formulaire */}
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-3 sm:mx-0">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Message d'erreur */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    <p className="ml-3 text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Adresse email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 outline-none border transition"
                                    placeholder="votre@email.com"
                                />
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

                        {/* Bouton d'envoi */}
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition ${loading || !email
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Envoyer le lien
                                </>
                            )}
                        </button>
                    </form>

                    {/* Lien retour */}
                    <div className="mt-6">
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition"
                        >
                            <ArrowLeft size={16} />
                            Retour à la connexion
                        </Link>
                    </div>
                </div>

                {/* Note de sécurité */}
                <p className="mt-4 text-center text-xs text-gray-500 mx-3 sm:mx-0">
                    Pour votre sécurité, le lien de réinitialisation expire après 1 heure
                    et ne peut être utilisé qu'une seule fois.
                </p>
            </div>
        </div>
    );
}
