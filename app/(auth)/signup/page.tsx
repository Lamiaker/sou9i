"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { getErrorMessage } from "@/lib/errors";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

export default function SignupPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push("/");
        }
    }, [status, router]);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaError, setCaptchaError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Nom
        if (!formData.name.trim()) {
            newErrors.name = "Le nom est requis";
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = "l'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email invalide";
        }

        // Téléphone
        if (!formData.phone.trim()) {
            newErrors.phone = "Le téléphone est requis";
        } else if (!/^(05|06|07)[0-9]{8}$/.test(formData.phone.replace(/\s/g, ""))) {
            newErrors.phone = "Numéro invalide (ex: 0555123456)";
        }

        // Ville
        if (!formData.city.trim()) {
            newErrors.city = "La ville est requise";
        }

        // Mot de passe
        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis";
        } else if (formData.password.length < 8) {
            newErrors.password = "Minimum 8 caractères";
        }

        // Confirmation mot de passe
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (process.env.NODE_ENV === 'production' && !captchaToken) {
            setErrors({ general: "Veuillez vérifier que vous n'êtes pas un robot" });
            return;
        }

        setLoading(true);
        setErrors({}); // Clear previous errors

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    city: formData.city,
                    password: formData.password,
                    captchaToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.error || 'Une erreur est survenue' });
                return;
            }

            // Succès ! Redirection vers login
            // alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
            window.location.href = '/login';
            window.location.href = '/login';
        } catch (err) {
            console.error('Erreur d\'inscription:', err);
            setErrors({ general: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Créer un compte
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Rejoignez notre communauté et commencez à vendre ou acheter.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="m-3 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Erreur générale */}
                        {errors.general && (
                            <div className="rounded-md bg-red-50 p-3">
                                <p className="text-sm text-red-800">{errors.general}</p>
                            </div>
                        )}

                        {/* Nom complet */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nom complet
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm rounded-lg py-3 outline-none border transition ${errors.name ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="Votre nom complet"
                                />
                            </div>
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

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
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm rounded-lg py-3 outline-none border transition ${errors.email ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="votre@email.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Téléphone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Numéro de téléphone
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm rounded-lg py-3 outline-none border transition ${errors.phone ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="0555 12 34 56"
                                />
                            </div>
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        {/* Ville */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                Ville
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    autoComplete="address-level2"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className={`focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm rounded-lg py-3 outline-none border transition ${errors.city ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="Alger, Oran, Constantine..."
                                />
                            </div>
                            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
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
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`focus:ring-primary focus:border-primary block w-full pl-10 pr-10 sm:text-sm rounded-lg py-3 outline-none border transition ${errors.password ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                                    )}
                                </div>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Confirmer mot de passe */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm rounded-lg py-3 outline-none border transition ${errors.confirmPassword ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
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

                        {/* Bouton submit */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    }`}
                            >
                                {loading ? "Inscription en cours..." : "S'inscrire"}
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
                                    Déjà un compte ?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link href="/login" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                Se connecter
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
