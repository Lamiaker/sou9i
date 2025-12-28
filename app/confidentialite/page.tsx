"use client";

import {
    Shield,
    Eye,
    Database,
    Lock,
    Share2,
    Clock,
    UserCheck,
    Cookie,
    Mail,
    ChevronRight,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Section {
    id: string;
    title: string;
    icon: React.ElementType;
    content: React.ReactNode;
}

const LAST_UPDATE = "28 décembre 2024";

const SECTIONS: Section[] = [
    {
        id: "introduction",
        title: "Introduction",
        icon: Shield,
        content: (
            <div className="space-y-4">
                <p>
                    Chez MarchéFemme, nous prenons très au sérieux la protection de vos données personnelles.
                    Cette politique de confidentialité explique comment nous collectons, utilisons, stockons
                    et protégeons vos informations lorsque vous utilisez notre plateforme.
                </p>
                <p>
                    En utilisant MarchéFemme, vous acceptez les pratiques décrites dans cette politique.
                    Nous vous encourageons à la lire attentivement et à nous contacter pour toute question.
                </p>
            </div>
        )
    },
    {
        id: "collecte",
        title: "Données collectées",
        icon: Database,
        content: (
            <div className="space-y-4">
                <p>Nous collectons différents types de données pour vous fournir nos services :</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">Données que vous nous fournissez :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700 text-sm">
                        <li>Nom et prénom</li>
                        <li>Adresse email</li>
                        <li>Numéro de téléphone</li>
                        <li>Ville / Localisation</li>
                        <li>Photo de profil (optionnel)</li>
                        <li>Contenu de vos annonces (descriptions, photos)</li>
                        <li>Messages échangés avec d'autres utilisateurs</li>
                    </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                    <p className="font-semibold text-purple-800 mb-2">Données collectées automatiquement :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-purple-700 text-sm">
                        <li>Adresse IP</li>
                        <li>Type de navigateur et d'appareil</li>
                        <li>Pages visitées et durée des visites</li>
                        <li>Date et heure de connexion</li>
                        <li>Données de navigation (cookies)</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: "utilisation",
        title: "Utilisation des données",
        icon: Eye,
        content: (
            <div className="space-y-4">
                <p>Vos données personnelles sont utilisées pour :</p>

                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium">Fournir nos services</span>
                            <p className="text-sm text-gray-500">Création de compte, publication d'annonces, messagerie</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium">Améliorer l'expérience utilisateur</span>
                            <p className="text-sm text-gray-500">Personnalisation, recommandations, optimisation du site</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium">Assurer la sécurité</span>
                            <p className="text-sm text-gray-500">Prévention des fraudes, modération, protection des comptes</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium">Communiquer avec vous</span>
                            <p className="text-sm text-gray-500">Notifications, support, mises à jour importantes</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium">Respecter nos obligations légales</span>
                            <p className="text-sm text-gray-500">Conformité réglementaire, réponse aux demandes légales</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "partage",
        title: "Partage des données",
        icon: Share2,
        content: (
            <div className="space-y-4">
                <p>
                    Nous ne vendons jamais vos données personnelles à des tiers. Cependant, certaines informations
                    peuvent être partagées dans les cas suivants :
                </p>

                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Avec d'autres utilisateurs</h4>
                        <p className="text-sm text-gray-600">
                            Votre nom, ville et annonces sont visibles publiquement. Votre numéro de téléphone
                            est visible si vous choisissez de l'afficher sur vos annonces.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Avec nos prestataires</h4>
                        <p className="text-sm text-gray-600">
                            Nous travaillons avec des prestataires techniques (hébergement, envoi d'emails)
                            qui peuvent accéder à vos données uniquement pour fournir leurs services.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">En cas d'obligation légale</h4>
                        <p className="text-sm text-gray-600">
                            Nous pouvons être amenés à divulguer vos données en réponse à une demande
                            légale (ordonnance judiciaire, enquête).
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "securite",
        title: "Sécurité des données",
        icon: Lock,
        content: (
            <div className="space-y-4">
                <p>
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour
                    protéger vos données personnelles :
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <Lock className="w-6 h-6 text-green-600 mb-2" />
                        <h4 className="font-semibold text-green-800">Chiffrement</h4>
                        <p className="text-sm text-green-700 mt-1">
                            Connexion sécurisée HTTPS et mots de passe hashés
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <Shield className="w-6 h-6 text-green-600 mb-2" />
                        <h4 className="font-semibold text-green-800">Protection des accès</h4>
                        <p className="text-sm text-green-700 mt-1">
                            Authentification sécurisée et contrôle d'accès strict
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <Database className="w-6 h-6 text-green-600 mb-2" />
                        <h4 className="font-semibold text-green-800">Sauvegarde</h4>
                        <p className="text-sm text-green-700 mt-1">
                            Sauvegardes régulières et stockage sécurisé
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <Eye className="w-6 h-6 text-green-600 mb-2" />
                        <h4 className="font-semibold text-green-800">Surveillance</h4>
                        <p className="text-sm text-green-700 mt-1">
                            Monitoring et détection des activités suspectes
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Malgré nos efforts, aucun système n'est totalement infaillible. Nous vous encourageons
                            à utiliser un mot de passe fort et unique, et à nous signaler toute activité suspecte.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "conservation",
        title: "Conservation des données",
        icon: Clock,
        content: (
            <div className="space-y-4">
                <p>
                    Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir
                    nos services et respecter nos obligations légales :
                </p>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 font-semibold text-gray-900">Type de données</th>
                            <th className="text-left py-3 font-semibold text-gray-900">Durée de conservation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-3 text-gray-600">Données de compte</td>
                            <td className="py-3 text-gray-600">Jusqu'à suppression du compte + 1 an</td>
                        </tr>
                        <tr>
                            <td className="py-3 text-gray-600">Annonces</td>
                            <td className="py-3 text-gray-600">Jusqu'à suppression + 6 mois</td>
                        </tr>
                        <tr>
                            <td className="py-3 text-gray-600">Messages</td>
                            <td className="py-3 text-gray-600">2 ans après le dernier message</td>
                        </tr>
                        <tr>
                            <td className="py-3 text-gray-600">Logs de connexion</td>
                            <td className="py-3 text-gray-600">1 an</td>
                        </tr>
                        <tr>
                            <td className="py-3 text-gray-600">Données de facturation</td>
                            <td className="py-3 text-gray-600">10 ans (obligation légale)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: "droits",
        title: "Vos droits",
        icon: UserCheck,
        content: (
            <div className="space-y-4">
                <p>
                    Conformément à la réglementation en vigueur, vous disposez des droits suivants concernant
                    vos données personnelles :
                </p>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">1</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Droit d'accès</span>
                            <p className="text-sm text-gray-500">Obtenir une copie de vos données personnelles</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">2</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Droit de rectification</span>
                            <p className="text-sm text-gray-500">Corriger des données inexactes ou incomplètes</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">3</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Droit à l'effacement</span>
                            <p className="text-sm text-gray-500">Demander la suppression de vos données</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">4</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Droit à la portabilité</span>
                            <p className="text-sm text-gray-500">Recevoir vos données dans un format lisible</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">5</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Droit d'opposition</span>
                            <p className="text-sm text-gray-500">Vous opposer au traitement de vos données</p>
                        </div>
                    </div>
                </div>

                <p className="mt-4">
                    Pour exercer ces droits, contactez-nous via notre formulaire de support ou par email.
                    Nous répondrons dans un délai de 30 jours.
                </p>
            </div>
        )
    },
    {
        id: "cookies",
        title: "Cookies",
        icon: Cookie,
        content: (
            <div className="space-y-4">
                <p>
                    MarchéFemme utilise des cookies pour améliorer votre expérience sur notre plateforme.
                    Les cookies sont de petits fichiers stockés sur votre appareil.
                </p>

                <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Cookies essentiels</h4>
                        <p className="text-sm text-gray-600">
                            Nécessaires au fonctionnement du site (connexion, panier, préférences)
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Cookies analytiques</h4>
                        <p className="text-sm text-gray-600">
                            Nous aident à comprendre comment les visiteurs utilisent le site
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Cookies de préférences</h4>
                        <p className="text-sm text-gray-600">
                            Mémorisent vos choix (langue, affichage) pour personnaliser votre expérience
                        </p>
                    </div>
                </div>

                <p>
                    Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                    Notez que la désactivation de certains cookies peut affecter le fonctionnement du site.
                </p>
            </div>
        )
    },
    {
        id: "contact",
        title: "Contact",
        icon: Mail,
        content: (
            <div className="space-y-4">
                <p>
                    Pour toute question concernant cette politique de confidentialité ou pour exercer
                    vos droits, vous pouvez nous contacter :
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <span>Email : privacy@marchefemme.dz</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <Link href="/dashboard/support" className="text-primary hover:underline">
                                Formulaire de support (demande RGPD)
                            </Link>
                        </li>
                    </ul>
                </div>
                <p className="text-sm text-gray-500">
                    Nous nous engageons à répondre à toute demande dans un délai maximum de 30 jours.
                </p>
            </div>
        )
    }
];

export default function ConfidentialitePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Politique de Confidentialité
                    </h1>
                    <p className="text-gray-600">
                        Dernière mise à jour : {LAST_UPDATE}
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <Lock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-700">Données chiffrées</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-700">Conforme RGPD</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <UserCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-700">Vos droits respectés</p>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 mb-4">Sommaire</h2>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {SECTIONS.map((section, index) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 hover:text-primary"
                            >
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                </span>
                                <span>{section.title}</span>
                                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {SECTIONS.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <section
                                key={section.id}
                                id={section.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 scroll-mt-4"
                            >
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                                            Section {index + 1}
                                        </span>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>
                                <div className="text-gray-600 leading-relaxed">
                                    {section.content}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Footer Links */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm">
                        Voir aussi :{' '}
                        <Link href="/conditions" className="text-primary hover:underline">
                            Conditions d&apos;utilisation
                        </Link>
                        {' • '}
                        <Link href="/faq" className="text-primary hover:underline">
                            FAQ
                        </Link>
                        {' • '}
                        <Link href="/dashboard/support" className="text-primary hover:underline">
                            Contact
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
