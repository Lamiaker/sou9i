"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Lock, Bell, Trash2, Smartphone, Mail, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { SettingsSkeleton } from "@/components/layout/DashboardInnerSkeletons";
import { getErrorMessage } from "@/lib/errors";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    // Simuler un chargement court pour la cohérence UX
    const [isPageLoading, setIsPageLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const [notifications, setNotifications] = useState({
        emailMessages: true,
        emailPromos: false,
        smsAlerts: true,
    });

    // État pour le formulaire de mot de passe
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    if (isPageLoading) {
        return <SettingsSkeleton />;
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        setPasswordError(""); // Clear error on change
        setPasswordSuccess(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess(false);

        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError("Tous les champs sont requis");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas");
            return;
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            setPasswordError("Le nouveau mot de passe doit être différent de l'ancien");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setPasswordError(data.error || 'Une erreur est survenue');
                return;
            }

            // Succès
            setPasswordSuccess(true);
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            // Déconnecter l'utilisateur après 3 secondes pour qu'il se reconnecte avec le nouveau mot de passe
            setTimeout(() => {
                signOut({ callbackUrl: '/login?message=password-changed' });
            }, 3000);
        } catch (err) {
            console.error('Erreur:', err);
            setPasswordError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-500">Gérez vos préférences de sécurité et de notifications.</p>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Lock className="text-primary" size={20} />
                        Sécurité
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Mettez à jour votre mot de passe pour sécuriser votre compte.</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                    {/* Messages d'erreur et succès */}
                    {passwordError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-red-800">{passwordError}</p>
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                            <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm font-semibold text-green-800">Mot de passe mis à jour avec succès !</p>
                                <p className="text-xs text-green-700 mt-1">Vous allez être déconnecté pour vous reconnecter avec votre nouveau mot de passe...</p>
                            </div>
                        </div>
                    )}

                    {/* Mot de passe actuel */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Nouveau mot de passe */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordForm.newPassword && (
                                <p className={`text-xs mt-1 ${passwordForm.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                    {passwordForm.newPassword.length >= 8 ? '✓' : '•'} Minimum 8 caractères
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordForm.confirmPassword && (
                                <p className={`text-xs mt-1 ${passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword ? 'text-green-600' : 'text-gray-500'}`}>
                                    {passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword ? '✓ Correspond' : '• Doit correspondre'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:opacity-90 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Mise à jour...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Mettre à jour le mot de passe
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-80">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Bell className="text-primary" size={20} />
                            Notifications
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            Bientôt disponible
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Choisissez comment vous souhaitez être contacté.</p>
                </div>

                <div className="divide-y divide-gray-100 cursor-not-allowed">
                    <div className="p-4 sm:p-6 flex items-center justify-between pointer-events-none opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Messages par email</p>
                                <p className="text-sm text-gray-500">Recevoir un email quand vous avez un nouveau message.</p>
                            </div>
                        </div>
                        <button
                            disabled
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
                        >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 flex items-center justify-between pointer-events-none opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Emails promotionnels</p>
                                <p className="text-sm text-gray-500">Recevoir des conseils pour mieux vendre.</p>
                            </div>
                        </div>
                        <button
                            disabled
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
                        >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 flex items-center justify-between pointer-events-none opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Alertes SMS</p>
                                <p className="text-sm text-gray-500">Recevoir un SMS pour les messages urgents.</p>
                            </div>
                        </div>
                        <button
                            disabled
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
                        >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Zone de danger */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden opacity-80">
                <div className="p-6 border-b border-red-100 bg-red-50/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                            <Trash2 size={20} />
                            Zone de danger
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            Bientôt disponible
                        </span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">Ces actions sont irréversibles.</p>
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none opacity-60">
                    <div>
                        <p className="font-medium text-gray-900">Supprimer le compte</p>
                        <p className="text-sm text-gray-500">Toutes vos annonces et données seront définitivement effacées.</p>
                    </div>
                    <button
                        disabled
                        className="px-4 py-2 bg-white border border-red-200 text-red-300 font-medium rounded-lg whitespace-nowrap cursor-not-allowed"
                    >
                        Supprimer mon compte
                    </button>
                </div>
            </div>
        </div>
    );
}
