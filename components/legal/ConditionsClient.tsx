"use client";

import {
    FileText,
    Shield,
    Users,
    ShoppingBag,
    AlertTriangle,
    Ban,
    Scale,
    Mail,
    ChevronRight,
    CheckCircle
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
        id: "acceptation",
        title: "Acceptation des conditions",
        icon: CheckCircle,
        content: (
            <div className="space-y-4">
                <p>
                    En accédant et en utilisant notre plateforme, vous acceptez d'être lié par les présentes
                    Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas
                    utiliser notre service.
                </p>
                <p>
                    Notre plateforme se réserve le droit de modifier ces conditions à tout moment. Les modifications
                    prennent effet dès leur publication sur le site. Il est de votre responsabilité de consulter
                    régulièrement cette page.
                </p>
            </div>
        )
    },
    {
        id: "description",
        title: "Description du service",
        icon: ShoppingBag,
        content: (
            <div className="space-y-4">
                <p>
                    Notre plateforme est une marketplace de petites annonces en ligne ouverte à tous en Algérie.
                    Elle permet aux utilisateurs de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Publier des annonces pour vendre des articles ou proposer des services</li>
                    <li>Rechercher et consulter des annonces</li>
                    <li>Contacter d'autres utilisateurs via la messagerie intégrée</li>
                    <li>Gérer leur profil et leurs annonces</li>
                    <li>Sauvegarder des annonces en favoris</li>
                </ul>
                <p>
                    Notre plateforme agit uniquement en tant qu'intermédiaire technique entre vendeurs et acheteurs.
                    Nous ne sommes pas partie prenante aux transactions effectuées entre utilisateurs.
                </p>
            </div>
        )
    },
    {
        id: "inscription",
        title: "Inscription et compte utilisateur",
        icon: Users,
        content: (
            <div className="space-y-4">
                <p>
                    Pour utiliser certaines fonctionnalités (publier des annonces, contacter des vendeurs),
                    vous devez créer un compte. Lors de l'inscription, vous vous engagez à :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Fournir des informations exactes, actuelles et complètes</li>
                    <li>Maintenir vos informations à jour</li>
                    <li>Garder votre mot de passe confidentiel</li>
                    <li>Être responsable de toute activité effectuée depuis votre compte</li>
                    <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                </ul>
                <p>
                    Vous devez être âgé(e) d'au moins 18 ans pour créer un compte. Un seul compte par personne est autorisé.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <p className="text-amber-800 text-sm">
                        <strong>Important :</strong> Notre plateforme se réserve le droit de suspendre ou supprimer tout compte
                        en cas de violation de ces conditions ou d'activité suspecte.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: "annonces",
        title: "Publication d'annonces",
        icon: FileText,
        content: (
            <div className="space-y-4">
                <p>
                    En publiant une annonce sur notre plateforme, vous vous engagez à respecter les règles suivantes :
                </p>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Décrire honnêtement l'article ou le service proposé (caractéristiques, conditions, défauts éventuels)</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Utiliser des photos authentiques représentant réellement l'article ou le service</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Indiquer un prix réaliste et cohérent</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Ne publier que des articles dont vous êtes propriétaire ou des services que vous pouvez réellement fournir</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Répondre aux demandes des acheteurs potentiels dans un délai raisonnable</span>
                    </div>
                </div>
                <p className="mt-4">
                    Toutes les annonces sont soumises à modération avant publication. Notre plateforme se réserve le droit
                    de refuser ou supprimer toute annonce ne respectant pas ces règles.
                </p>
            </div>
        )
    },
    {
        id: "interdits",
        title: "Contenus et comportements interdits",
        icon: Ban,
        content: (
            <div className="space-y-4">
                <p>
                    Les contenus et comportements suivants sont strictement interdits sur notre plateforme :
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-red-800">Articles interdits :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-red-700 text-sm">
                        <li>Produits contrefaits ou imitations</li>
                        <li>Produits volés ou d'origine douteuse</li>
                        <li>Médicaments et produits pharmaceutiques</li>
                        <li>Armes et objets dangereux</li>
                        <li>Produits illégaux ou réglementés</li>
                        <li>Contenus à caractère pornographique ou offensant</li>
                        <li>Services illégaux</li>
                    </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2 mt-4">
                    <p className="font-semibold text-orange-800">Comportements interdits :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-orange-700 text-sm">
                        <li>Harcèlement ou intimidation d'autres utilisateurs</li>
                        <li>Spam ou publicité non sollicitée</li>
                        <li>Création de faux comptes ou usurpation d'identité</li>
                        <li>Manipulation des avis ou évaluations</li>
                        <li>Tentative de fraude ou d'escroquerie</li>
                        <li>Collecte de données personnelles d'autres utilisateurs</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: "transactions",
        title: "Transactions entre utilisateurs",
        icon: Shield,
        content: (
            <div className="space-y-4">
                <p>
                    Notre plateforme facilite la mise en relation entre vendeurs et acheteurs mais n'intervient pas
                    dans les transactions. Les utilisateurs sont seuls responsables de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>La négociation du prix et des conditions de vente</li>
                    <li>Le choix du mode de paiement</li>
                    <li>L'organisation de la remise de l'article</li>
                    <li>La vérification de l'état de l'article avant achat</li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                        <strong>Conseils de sécurité :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700 text-sm mt-2">
                        <li>Privilégiez les remises en main propre dans un lieu public</li>
                        <li>Vérifiez l'article avant de payer</li>
                        <li>Méfiez-vous des prix anormalement bas</li>
                        <li>Ne partagez jamais vos informations bancaires par message</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: "responsabilite",
        title: "Limitation de responsabilité",
        icon: AlertTriangle,
        content: (
            <div className="space-y-4">
                <p>
                    Notre plateforme met tout en œuvre pour assurer le bon fonctionnement du service, mais ne peut
                    garantir :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Un fonctionnement continu et sans interruption du service</li>
                    <li>L'exactitude ou la véracité des informations publiées par les utilisateurs</li>
                    <li>La qualité ou la conformité des articles proposés à la vente</li>
                    <li>Le comportement des utilisateurs</li>
                </ul>
                <p>
                    Notre plateforme décline toute responsabilité en cas de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Litiges entre utilisateurs</li>
                    <li>Pertes financières liées à une transaction</li>
                    <li>Dommages directs ou indirects résultant de l'utilisation du service</li>
                    <li>Perte de données ou d'accès au compte</li>
                </ul>
            </div>
        )
    },
    {
        id: "propriete",
        title: "Propriété intellectuelle",
        icon: Scale,
        content: (
            <div className="space-y-4">
                <p>
                    L'ensemble des éléments constituant notre plateforme (design, logo, textes,
                    fonctionnalités, code source) sont protégés par le droit de la propriété intellectuelle.
                </p>
                <p>
                    En publiant du contenu sur notre plateforme (photos, descriptions), vous conservez vos droits
                    sur ce contenu mais nous accordez une licence non exclusive pour l'afficher et
                    le promouvoir sur la plateforme.
                </p>
                <p>
                    Toute reproduction, distribution ou utilisation non autorisée des éléments de la plateforme
                    est strictement interdite.
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
                    Pour toute question concernant ces Conditions Générales d'Utilisation ou pour signaler un problème,
                    connectez-vous à votre compte puis rendez-vous sur la page Aide & Support.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 mb-3">Pour nous contacter :</p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Connectez-vous à votre compte</li>
                        <li>Accédez à votre tableau de bord</li>
                        <li>Cliquez sur "Aide & Support"</li>
                        <li>Soumettez votre question ou problème</li>
                    </ol>
                </div>
            </div>
        )
    }
];

export default function ConditionsClient() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl mb-4 shadow-lg">
                        <Scale className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Conditions Générales d'Utilisation
                    </h1>
                    <p className="text-gray-600">
                        Dernière mise à jour : {LAST_UPDATE}
                    </p>
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
                                            Article {index + 1}
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
                        <Link href="/confidentialite" className="text-primary hover:underline">
                            Politique de confidentialité
                        </Link>
                        {' • '}
                        <Link href="/faq" className="text-primary hover:underline">
                            FAQ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
