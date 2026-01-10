"use client";

import { useState } from 'react';
import {
    Globe,
    Smartphone,
    ShoppingCart,
    Palette,
    Code,
    Rocket,
    CheckCircle,
    ArrowRight,
    Mail,
    Send,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import SimpleSelect from '@/components/ui/SimpleSelect';

interface Service {
    id: string;
    value: string;
    title: string;
    description: string;
    icon: React.ElementType;
    features: string[];
    color: string;
}

const SERVICES: Service[] = [
    {
        id: 'site-vitrine',
        value: 'SITE_VITRINE',
        title: 'Site Vitrine',
        description: 'Présentez votre activité avec un site web professionnel et moderne qui inspire confiance.',
        icon: Globe,
        features: [
            'Design personnalisé et responsive',
            'Optimisation SEO de base',
            'Formulaire de contact',
            'Hébergement inclus 1 an'
        ],
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 'e-commerce',
        value: 'ECOMMERCE',
        title: 'Site E-commerce',
        description: 'Vendez vos produits en ligne avec une boutique complète et sécurisée.',
        icon: ShoppingCart,
        features: [
            'Catalogue produits illimité',
            'Paiement sécurisé',
            'Gestion des stocks',
            'Tableau de bord vendeur'
        ],
        color: 'from-green-500 to-green-600'
    },
    {
        id: 'application-web',
        value: 'APP_WEB',
        title: 'Application Web',
        description: 'Développez une application web sur mesure pour automatiser vos processus.',
        icon: Code,
        features: [
            'Développement sur mesure',
            'Interface utilisateur intuitive',
            'Base de données sécurisée',
            'API et intégrations'
        ],
        color: 'from-purple-500 to-purple-600'
    },
    {
        id: 'application-mobile',
        value: 'APP_MOBILE',
        title: 'Application Mobile',
        description: 'Touchez vos clients sur mobile avec une application iOS et Android.',
        icon: Smartphone,
        features: [
            'Compatible iOS et Android',
            'Notifications push',
            'Mode hors ligne',
            'Publication sur les stores'
        ],
        color: 'from-orange-500 to-orange-600'
    },
    {
        id: 'design-ux',
        value: 'DESIGN_UX',
        title: 'Design & UX',
        description: 'Améliorez l\'expérience utilisateur avec un design moderne et ergonomique.',
        icon: Palette,
        features: [
            'Maquettes interactives',
            'Charte graphique',
            'Tests utilisateurs',
            'Design System complet'
        ],
        color: 'from-pink-500 to-pink-600'
    },
    {
        id: 'consulting',
        value: 'CONSULTING',
        title: 'Conseil & Stratégie',
        description: 'Bénéficiez de notre expertise pour définir votre stratégie digitale.',
        icon: Rocket,
        features: [
            'Audit de l\'existant',
            'Recommandations techniques',
            'Roadmap de développement',
            'Accompagnement projet'
        ],
        color: 'from-cyan-500 to-cyan-600'
    }
];

function ServiceCard({ service, isSelected, onSelect }: {
    service: Service;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const Icon = service.icon;

    return (
        <button
            onClick={onSelect}
            className={`text-left bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                }`}
        >
            <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isSelected && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    {service.description}
                </p>
                <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </button>
    );
}

export default function ServicesClient() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        budget: '',
        deadline: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedService) {
            setError("Veuillez sélectionner un service");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    serviceType: selectedService.value,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de l'envoi");
            }

            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Demande envoyée !
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Merci pour votre demande. Notre équipe vous contactera dans les plus brefs délais
                        pour discuter de votre projet.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                        <span>Retour à l'accueil</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl mb-4 shadow-lg">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Nos Services
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Nous créons des solutions digitales sur mesure pour développer votre activité en ligne.
                        Sites web, applications, e-commerce - nous transformons vos idées en réalité.
                    </p>
                </div>

                {/* Guide Section */}
                {!showForm && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">?</span>
                            Comment ça marche ?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">1</span>
                                <div>
                                    <p className="font-medium text-gray-900">Choisissez votre service</p>
                                    <p className="text-sm text-gray-500">Cliquez sur le service qui correspond le mieux à votre projet.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">2</span>
                                <div>
                                    <p className="font-medium text-gray-900">Remplissez le formulaire</p>
                                    <p className="text-sm text-gray-500">Décrivez votre projet et vos besoins en quelques minutes.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">3</span>
                                <div>
                                    <p className="font-medium text-gray-900">Recevez votre devis</p>
                                    <p className="text-sm text-gray-500">Notre équipe vous contacte sous 48h avec une proposition adaptée.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!showForm ? (
                    <>
                        {/* Services Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {SERVICES.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    isSelected={selectedService?.id === service.id}
                                    onSelect={() => setSelectedService(service)}
                                />
                            ))}
                        </div>

                        {/* CTA Section */}
                        <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-2xl border border-primary/10 p-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                {selectedService ? `Vous avez choisi : ${selectedService.title}` : 'Sélectionnez un service'}
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                                {selectedService
                                    ? "Cliquez sur le bouton ci-dessous pour nous envoyer votre demande."
                                    : "Choisissez le service qui correspond à votre projet en cliquant dessus."
                                }
                            </p>
                            <button
                                onClick={() => selectedService && setShowForm(true)}
                                disabled={!selectedService}
                                className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${selectedService
                                    ? 'bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-lg hover:scale-[1.02]'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Mail className="w-5 h-5" />
                                <span>Demander un devis</span>
                            </button>
                        </div>
                    </>
                ) : (
                    /* Contact Form */
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={() => setShowForm(false)}
                            className="mb-6 text-gray-600 hover:text-primary flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Retour aux services
                        </button>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                {selectedService && (
                                    <>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedService.color} flex items-center justify-center`}>
                                            <selectedService.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Service sélectionné</p>
                                            <h3 className="text-xl font-bold text-gray-900">{selectedService.title}</h3>
                                        </div>
                                    </>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="+213 XXX XXX XXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Vous êtes
                                        </label>
                                        <SimpleSelect
                                            value={formData.company}
                                            onChange={(value) => setFormData({ ...formData, company: value })}
                                            placeholder="Sélectionner"
                                            options={[
                                                { value: 'Particulier', label: 'Particulier' },
                                                { value: 'Auto-entrepreneur', label: 'Auto-entrepreneur' },
                                                { value: 'Startup', label: 'Startup' },
                                                { value: 'PME', label: 'PME / TPE' },
                                                { value: 'Grande entreprise', label: 'Grande entreprise' },
                                                { value: 'Association', label: 'Association' },
                                                { value: 'Autre', label: 'Autre' },
                                            ]}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Budget estimé
                                        </label>
                                        <SimpleSelect
                                            value={formData.budget}
                                            onChange={(value) => setFormData({ ...formData, budget: value })}
                                            placeholder="Sélectionner"
                                            options={[
                                                { value: '< 50 000 DZD', label: 'Moins de 50 000 DZD' },
                                                { value: '50 000 - 150 000 DZD', label: '50 000 - 150 000 DZD' },
                                                { value: '150 000 - 300 000 DZD', label: '150 000 - 300 000 DZD' },
                                                { value: '300 000 - 500 000 DZD', label: '300 000 - 500 000 DZD' },
                                                { value: '> 500 000 DZD', label: 'Plus de 500 000 DZD' },
                                            ]}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Délai souhaité
                                        </label>
                                        <SimpleSelect
                                            value={formData.deadline}
                                            onChange={(value) => setFormData({ ...formData, deadline: value })}
                                            placeholder="Sélectionner"
                                            options={[
                                                { value: '< 1 mois', label: "Moins d'1 mois" },
                                                { value: '1-2 mois', label: '1 à 2 mois' },
                                                { value: '2-3 mois', label: '2 à 3 mois' },
                                                { value: '3-6 mois', label: '3 à 6 mois' },
                                                { value: '> 6 mois', label: 'Plus de 6 mois' },
                                            ]}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description du projet *
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        placeholder="Décrivez votre projet, vos besoins et vos attentes..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
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
                    </div>
                )}

                {/* Trust Section */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm">
                        Des questions ?{' '}
                        <Link href="/faq" className="text-primary hover:underline">
                            Consultez notre FAQ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
