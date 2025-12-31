"use client";

import { useState } from 'react';
import {
    ChevronDown,
    HelpCircle,
    Search,
    ShoppingBag,
    UserCircle,
    Shield,
    MessageCircle,
    Smartphone,
    FileText,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Types
interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
    items: FAQItem[];
}

// FAQ Data
const FAQ_CATEGORIES: FAQCategory[] = [
    {
        id: 'general',
        name: 'Questions générales',
        icon: HelpCircle,
        color: 'from-blue-500 to-blue-600',
        items: [
            {
                question: "Qu'est-ce que cette plateforme ?",
                answer: "Notre plateforme est une marketplace de petites annonces ouverte à tous en Algérie. Elle permet de publier et de découvrir des annonces dans plusieurs catégories telles que les services, le lifestyle, la beauté, la maison, l'artisanat, l'événementiel et d'autres prestations du quotidien, dans un environnement sécurisé et convivial."
            },
            {
                question: "L'inscription est-elle gratuite ?",
                answer: "Oui, l'inscription est entièrement gratuite ! Vous pouvez créer un compte, publier des annonces et contacter les vendeurs sans aucun frais."
            },
            {
                question: "Comment puis-je contacter le support ?",
                answer: "Connectez-vous d'abord à votre compte, puis accédez à notre page de support depuis votre tableau de bord ou via le menu principal. Nous répondons généralement sous 24 à 48 heures."
            },
            {
                question: "La plateforme est-elle disponible partout en Algérie ?",
                answer: "Oui, notre plateforme est 100% en ligne et accessible depuis toute l'Algérie. Peu importe où vous vous trouvez, vous pouvez publier et consulter des annonces à tout moment."
            }
        ]
    },
    {
        id: 'annonces',
        name: 'Publier une annonce',
        icon: FileText,
        color: 'from-green-500 to-green-600',
        items: [
            {
                question: "Comment publier une annonce ?",
                answer: "Pour publier une annonce, connectez-vous à votre compte, cliquez sur le bouton 'Déposer une annonce', remplissez le formulaire avec les détails de votre article, ajoutez des photos de qualité et validez. Votre annonce sera examinée avant publication."
            },
            {
                question: "Combien d'annonces puis-je publier ?",
                answer: "Vous pouvez publier autant d'annonces que vous le souhaitez, sans aucune limite. Cependant, chaque annonce doit respecter nos conditions d'utilisation."
            },
            {
                question: "Combien de temps reste une annonce en ligne ?",
                answer: "Vos annonces restent actives sans limite de durée ! Elles resteront visibles tant que vous ne les supprimez pas ou ne les marquez pas comme vendues depuis votre espace personnel."
            },
            {
                question: "Pourquoi mon annonce est-elle en attente de modération ?",
                answer: "Toutes les nouvelles annonces passent par une vérification pour garantir la qualité et la sécurité de la plateforme. Cette modération prend généralement moins de 24 heures."
            },
            {
                question: "Comment ajouter de bonnes photos ?",
                answer: "Privilégiez la lumière naturelle, un fond neutre et montrez l'article sous plusieurs angles. Des photos de qualité augmentent significativement vos chances de vendre rapidement."
            }
        ]
    },
    {
        id: 'achat',
        name: 'Acheter',
        icon: ShoppingBag,
        color: 'from-purple-500 to-purple-600',
        items: [
            {
                question: "Comment contacter un vendeur ?",
                answer: "Pour contacter un vendeur, cliquez sur le bouton 'Contacter' sur la page de l'annonce. Vous pouvez envoyer un message directement via notre système de messagerie intégré."
            },
            {
                question: "Les paiements sont-ils sécurisés ?",
                answer: "Notre plateforme facilite la mise en relation entre acheteurs et vendeurs. Les transactions se font directement entre les parties. Nous recommandons de privilégier les remises en main propre ou les méthodes de paiement sécurisées."
            },
            {
                question: "Comment signaler une annonce suspecte ?",
                answer: "Si vous voyez une annonce qui vous semble frauduleuse ou inappropriée, cliquez sur le bouton 'Signaler' présent sur chaque annonce. Notre équipe examinera le signalement rapidement."
            },
            {
                question: "Puis-je négocier les prix ?",
                answer: "Oui, la négociation fait partie de l'expérience ! Vous pouvez proposer un prix au vendeur via la messagerie. Restez respectueux et raisonnable dans vos propositions."
            }
        ]
    },
    {
        id: 'compte',
        name: 'Mon compte',
        icon: UserCircle,
        color: 'from-orange-500 to-orange-600',
        items: [
            {
                question: "Comment modifier mes informations personnelles ?",
                answer: "Connectez-vous à votre compte, accédez à votre tableau de bord puis à la section 'Profil'. Vous pourrez y modifier votre nom, email, téléphone et photo de profil."
            },
            {
                question: "J'ai oublié mon mot de passe, que faire ?",
                answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe."
            },
            {
                question: "Comment supprimer mon compte ?",
                answer: "Pour supprimer votre compte, rendez-vous dans votre espace personnel, puis accédez à la section « Paramètres ». Vous y trouverez l'option de suppression de compte. Notez que cette action est irréversible et supprimera toutes vos annonces et données."
            },
            {
                question: "Comment vérifier mon compte ?",
                answer: "La vérification de compte se fait automatiquement après confirmation de votre email. Vous pouvez également ajouter et vérifier votre numéro de téléphone pour plus de crédibilité."
            }
        ]
    },
    {
        id: 'securite',
        name: 'Sécurité',
        icon: Shield,
        color: 'from-red-500 to-red-600',
        items: [
            {
                question: "Comment éviter les arnaques ?",
                answer: "Voici nos conseils pour des transactions sécurisées : • Privilégiez les remises en main propre • Ne payez jamais avant d'avoir vu l'article • Méfiez-vous des prix trop bas • Vérifiez le profil du vendeur et ses évaluations • N'envoyez jamais vos informations bancaires par message."
            },
            {
                question: "Que faire si je suis victime d'une arnaque ?",
                answer: "Contactez immédiatement notre support avec tous les détails de la transaction. Signalez également le vendeur via notre système de signalement. Si nécessaire, déposez une plainte auprès des autorités compétentes."
            },
            {
                question: "Mes données personnelles sont-elles protégées ?",
                answer: "Oui, nous prenons la protection de vos données très au sérieux. Vos informations sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement."
            },
            {
                question: "Conseils pour une transaction en personne",
                answer: "Rencontrez-vous dans un lieu public et fréquenté, de préférence en journée. Informez un proche de votre rendez-vous. Vérifiez l'article avant de payer et privilégiez le paiement en espèces."
            }
        ]
    },
    {
        id: 'mobile',
        name: 'Application mobile',
        icon: Smartphone,
        color: 'from-cyan-500 to-cyan-600',
        items: [
            {
                question: "Y a-t-il une application mobile ?",
                answer: "Notre site est entièrement optimisé pour mobile et fonctionne parfaitement sur tous les smartphones. Une application native est en cours de développement et sera bientôt disponible !"
            },
            {
                question: "Comment ajouter le site à mon écran d'accueil ?",
                answer: "Sur Android : ouvrez le site dans Chrome, appuyez sur les 3 points en haut à droite et sélectionnez 'Ajouter à l'écran d'accueil'. Sur iPhone : ouvrez Safari, appuyez sur le bouton partage et sélectionnez 'Sur l'écran d'accueil'."
            },
            {
                question: "Les notifications sont-elles disponibles ?",
                answer: "Oui, vous recevez des notifications par email pour les nouveaux messages et les mises à jour importantes concernant vos annonces. Les notifications push seront disponibles avec l'application mobile."
            }
        ]
    }
];

// Accordion Item Component
function AccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors group"
            >
                <span className="font-medium text-gray-900 group-hover:text-primary pr-4">
                    {item.question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 group-hover:text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'
                    }`}
            >
                <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

// Category Card Component
function CategoryCard({ category, isActive, onClick }: { category: FAQCategory; isActive: boolean; onClick: () => void }) {
    const Icon = category.icon;
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left w-full ${isActive
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
        >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                    {category.name}
                </h3>
                <p className="text-xs text-gray-500">{category.items.length} questions</p>
            </div>
        </button>
    );
}

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState<string>(FAQ_CATEGORIES[0].id);
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (question: string) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(question)) {
            newOpenItems.delete(question);
        } else {
            newOpenItems.add(question);
        }
        setOpenItems(newOpenItems);
    };

    // Filter items based on search
    const filteredCategories = searchQuery
        ? FAQ_CATEGORIES.map(category => ({
            ...category,
            items: category.items.filter(
                item =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(category => category.items.length > 0)
        : FAQ_CATEGORIES;

    const activeCategoryData = filteredCategories.find(c => c.id === activeCategory) || filteredCategories[0];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl mb-4 shadow-lg">
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Foire Aux Questions
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Trouvez rapidement les réponses à vos questions. Si vous ne trouvez pas ce que vous cherchez,
                        n'hésitez pas à nous contacter.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une question..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-gray-900 placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="mt-2 text-sm text-gray-500 text-center">
                            {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} résultat(s) trouvé(s)
                        </p>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">
                                Catégories
                            </h2>
                            {(searchQuery ? filteredCategories : FAQ_CATEGORIES).map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    isActive={activeCategory === category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* FAQ Items */}
                    <div className="lg:col-span-2">
                        {activeCategoryData ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeCategoryData.color} flex items-center justify-center`}>
                                        <activeCategoryData.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{activeCategoryData.name}</h2>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {activeCategoryData.items.map((item, index) => (
                                        <AccordionItem
                                            key={index}
                                            item={item}
                                            isOpen={openItems.has(item.question)}
                                            onClick={() => toggleItem(item.question)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
                                <p className="text-gray-500">
                                    Essayez avec d'autres mots-clés ou{' '}
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-primary hover:underline"
                                    >
                                        effacez la recherche
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-12 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-2xl border border-primary/10 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm mb-4">
                        <MessageCircle className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Vous n'avez pas trouvé votre réponse ?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Notre équipe de support est là pour vous aider. Envoyez-nous votre question et nous vous répondrons rapidement.
                    </p>
                    <Link
                        href="/dashboard/support"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        <span>Contacter le support</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Liens utiles :{' '}
                        <Link href="/conditions" className="text-primary hover:underline">
                            Conditions d'utilisation
                        </Link>
                        {' • '}
                        <Link href="/confidentialite" className="text-primary hover:underline">
                            Politique de confidentialité
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
