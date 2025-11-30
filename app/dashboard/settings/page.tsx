"use client";

import { useState } from "react";
import { Lock, Bell, Trash2, Save, Smartphone, Mail } from "lucide-react";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        emailMessages: true,
        emailPromos: false,
        smsAlerts: true,
    });

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
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

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-70"
                        >
                            {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Bell className="text-primary" size={20} />
                        Notifications
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Choisissez comment vous souhaitez être contacté.</p>
                </div>

                <div className="divide-y divide-gray-100">
                    <div className="p-4 sm:p-6 flex items-center justify-between">
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
                            onClick={() => toggleNotification('emailMessages')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.emailMessages ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.emailMessages ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 flex items-center justify-between">
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
                            onClick={() => toggleNotification('emailPromos')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.emailPromos ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.emailPromos ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 flex items-center justify-between">
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
                            onClick={() => toggleNotification('smsAlerts')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.smsAlerts ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.smsAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Zone de danger */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                <div className="p-6 border-b border-red-100 bg-red-50/50">
                    <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                        <Trash2 size={20} />
                        Zone de danger
                    </h2>
                    <p className="text-sm text-red-600 mt-1">Ces actions sont irréversibles.</p>
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-gray-900">Supprimer le compte</p>
                        <p className="text-sm text-gray-500">Toutes vos annonces et données seront définitivement effacées.</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition whitespace-nowrap">
                        Supprimer mon compte
                    </button>
                </div>
            </div>
        </div>
    );
}
