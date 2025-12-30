"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    XCircle,
    Loader2,
} from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Critères de validation du mot de passe
    const passwordCriteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
    };

    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
    const passwordsMatch = password === confirmPassword && confirmPassword !== "";

    // Vérifier le token au chargement
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerifying(false);
                setTokenValid(false);
                return;
            }

            try {
                const response = await fetch(
                    `/api/auth/reset-password?token=${encodeURIComponent(token)}`
                );
                const data = await response.json();
                setTokenValid(data.valid);
            } catch {
                setTokenValid(false);
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isPasswordValid) {
            setError("Le mot de passe ne respecte pas les critères de sécurité");
            return;
        }

        if (!passwordsMatch) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(true);
                // Redirection automatique après 3 secondes
                setTimeout(() => {
                    router.push("/login?message=password-changed");
                }, 3000);
            } else {
                setError(data.error || "Une erreur est survenue");
            }
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    // État de chargement initial
    if (verifying) {
        return (
            <div className="w-full">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-12 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-3 sm:mx-0 text-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Vérification du lien...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Token invalide ou expiré
    if (!tokenValid) {
        return (
            <div className="w-full">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-3 sm:mx-0">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                        </div>

                        <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
                            Lien invalide ou expiré
                        </h2>

                        <p className="text-center text-gray-600 mb-6">
                            Ce lien de réinitialisation n&apos;est plus valide. Il a peut-être
                            expiré ou a déjà été utilisé.
                        </p>

                        <div className="space-y-4">
                            <Link
                                href="/forgot-password"
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary transition"
                            >
                                Demander un nouveau lien
                            </Link>

                            <Link
                                href="/login"
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
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

    // Succès
    if (success) {
        return (
            <div className="w-full">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-3 sm:mx-0">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
                            Mot de passe modifié !
                        </h2>

                        <p className="text-center text-gray-600 mb-6">
                            Votre mot de passe a été réinitialisé avec succès. Vous allez être
                            redirigé vers la page de connexion...
                        </p>

                        <div className="flex justify-center mb-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                        </div>

                        <Link
                            href="/login"
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary transition"
                        >
                            Se connecter maintenant
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Formulaire de réinitialisation
    return (
        <div className="w-full">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* En-tête */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Nouveau mot de passe
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Choisissez un mot de passe sécurisé pour votre compte.
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

                        {/* Nouveau mot de passe */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nouveau mot de passe
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className="focus:ring-primary focus:border-primary block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-lg py-3 outline-none border transition"
                                    placeholder="••••••••"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Critères de mot de passe */}
                        {password && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                    Critères de sécurité :
                                </p>
                                <PasswordCriterion
                                    met={passwordCriteria.length}
                                    text="Au moins 8 caractères"
                                />
                                <PasswordCriterion
                                    met={passwordCriteria.uppercase}
                                    text="Une lettre majuscule"
                                />
                                <PasswordCriterion
                                    met={passwordCriteria.lowercase}
                                    text="Une lettre minuscule"
                                />
                                <PasswordCriterion
                                    met={passwordCriteria.number}
                                    text="Un chiffre"
                                />
                            </div>
                        )}

                        {/* Confirmation du mot de passe */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirmer le mot de passe
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className={`focus:ring-primary focus:border-primary block w-full pl-10 pr-10 sm:text-sm rounded-lg py-3 outline-none border transition ${confirmPassword && !passwordsMatch
                                            ? "border-red-300 bg-red-50"
                                            : confirmPassword && passwordsMatch
                                                ? "border-green-300 bg-green-50"
                                                : "border-gray-300"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </div>
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="mt-1 text-xs text-red-600">
                                    Les mots de passe ne correspondent pas
                                </p>
                            )}
                            {passwordsMatch && (
                                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle size={12} /> Les mots de passe correspondent
                                </p>
                            )}
                        </div>

                        {/* Bouton de soumission */}
                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                            className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition ${loading || !isPasswordValid || !passwordsMatch
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Modification en cours...
                                </>
                            ) : (
                                "Modifier mon mot de passe"
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
            </div>
        </div>
    );
}

// Composant pour afficher un critère de mot de passe
function PasswordCriterion({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {met ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
                <XCircle className="h-4 w-4 text-gray-300" />
            )}
            <span className={met ? "text-green-700" : "text-gray-500"}>{text}</span>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
