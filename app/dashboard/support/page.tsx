"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    HelpCircle,
    Bug,
    AlertTriangle,
    Lightbulb,
    User,
    FileText,
    Send,
    CheckCircle,
    ArrowLeft,
    MessageCircle,
    Inbox
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
    { value: 'QUESTION', label: 'Question générale', icon: HelpCircle, description: 'Comment utiliser la plateforme' },
    { value: 'BUG', label: 'Signaler un bug', icon: Bug, description: 'Problème technique rencontré' },
    { value: 'REPORT_CONTENT', label: 'Signaler un contenu', icon: AlertTriangle, description: 'Annonce ou utilisateur suspect' },
    { value: 'SUGGESTION', label: 'Suggestion', icon: Lightbulb, description: "Idée d'amélioration" },
    { value: 'ACCOUNT', label: 'Problème de compte', icon: User, description: 'Connexion, vérification, etc.' },
    { value: 'OTHER', label: 'Autre', icon: FileText, description: 'Autre demande' },
];

export default function DashboardSupportPage() {
    const { user } = useAuth();
    const [step, setStep] = useState<'category' | 'form' | 'success'>('category');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCategorySelect = (categoryValue: string) => {
        setSelectedCategory(categoryValue);
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: formData.subject,
                    message: formData.message,
                    category: selectedCategory,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erreur lors de l\'envoi');
            }

            setStep('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const selectedCategoryData = CATEGORIES.find(c => c.value === selectedCategory);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-primary to-orange-500 rounded-xl">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Aide & Support</h1>
                    </div>
                    <p className="text-gray-500">
                        {step === 'category' && "Comment pouvons-nous vous aider ?"}
                        {step === 'form' && "Décrivez votre demande"}
                        {step === 'success' && "Votre demande a été envoyée !"}
                    </p>
                </div>
                <Link
                    href="/dashboard/support/mes-demandes"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                    <Inbox className="w-5 h-5" />
                    Mes demandes
                </Link>
            </div>

            {/* Category Selection */}
            {step === 'category' && (
                <div className="grid gap-3">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => handleCategorySelect(category.value)}
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 group-hover:bg-primary/10 rounded-xl flex items-center justify-center transition-colors">
                                <category.icon className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                    {category.label}
                                </h3>
                                <p className="text-sm text-gray-500">{category.description}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}

            {/* Form */}
            {step === 'form' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* Back button */}
                    <button
                        onClick={() => setStep('category')}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Changer de catégorie</span>
                    </button>

                    {/* Selected category badge */}
                    {selectedCategoryData && (
                        <div className="flex items-center gap-2 mb-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <selectedCategoryData.icon className="w-5 h-5 text-primary" />
                            <span className="font-medium text-primary">{selectedCategoryData.label}</span>
                        </div>
                    )}

                    {/* Connected user info */}
                    {user && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 mb-5">
                            Connecté en tant que <span className="font-medium text-gray-900">{user.name || user.email}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sujet *
                            </label>
                            <input
                                type="text"
                                required
                                minLength={5}
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Résumez votre demande en quelques mots"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Votre message *
                            </label>
                            <textarea
                                required
                                minLength={20}
                                rows={6}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                placeholder="Décrivez votre problème ou votre question en détail..."
                            />
                            <p className="mt-1 text-xs text-gray-500">Minimum 20 caractères</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Envoi en cours...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Envoyer ma demande</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Success */}
            {step === 'success' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée !</h2>
                    <p className="text-gray-600 mb-6">
                        Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
                        <span className="block mt-2">
                            Vous pouvez suivre votre demande dans <Link href="/dashboard/support/mes-demandes" className="text-primary hover:underline font-medium">Mes demandes</Link>.
                        </span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/dashboard/support/mes-demandes"
                            className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Voir mes demandes
                        </Link>
                        <button
                            onClick={() => {
                                setStep('category');
                                setSelectedCategory(null);
                                setFormData({ subject: '', message: '' });
                            }}
                            className="px-6 py-3 border border-primary text-primary font-medium rounded-xl hover:bg-primary/5 transition-colors"
                        >
                            Nouvelle demande
                        </button>
                    </div>
                </div>
            )}

            {/* FAQ Link */}
            {step !== 'success' && (
                <div className="text-center">
                    <p className="text-gray-500 text-sm">
                        Vous ne trouvez pas votre réponse ?{' '}
                        <Link href="/faq" className="text-primary hover:underline font-medium">
                            Consultez notre FAQ
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
}
