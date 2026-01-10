import { Megaphone, Rocket, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Publicité & Boost | SweetLook',
    description: 'Boostez la visibilité de vos annonces sur SweetLook.',
};

export default function PublicitePage() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                {/* Header avec Dégradé */}
                <div className="bg-gradient-to-r from-primary to-orange-400 p-8 sm:p-12 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <Sparkles className="absolute top-10 left-10 animate-pulse" size={40} />
                        <Rocket className="absolute bottom-10 right-10 animate-bounce" size={60} />
                    </div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Megaphone size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Espace Publicitaire</h1>
                        <p className="text-orange-50 font-medium max-w-lg mx-auto leading-relaxed">
                            Boostez vos ventes et donnez une visibilité maximale à vos articles auprès de milliers d'acheteurs.
                        </p>
                    </div>
                </div>

                {/* Contenu "Bientôt disponible" */}
                <div className="p-8 sm:p-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-bold mb-8 border border-orange-100 uppercase tracking-wider">
                        <Clock size={16} />
                        Bientôt disponible
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Le système de publicité est en cours de préparation
                    </h2>

                    <p className="text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
                        Notre équipe travaille sur des solutions innovantes pour vous aider à vendre plus rapidement.
                        Bientôt, vous pourrez mettre vos annonces en avant, les faire apparaître en tête de liste et attirer plus de clients potentiels.
                    </p>

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                <Rocket className="text-primary" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Boost Instantané</h3>
                            <p className="text-xs text-gray-500">Remontez votre annonce en tête de liste chaque jour.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="text-orange-500" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Annonces à la Une</h3>
                            <p className="text-xs text-gray-500">Affichez votre article dans des emplacements privilégiés.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                <Megaphone className="text-blue-500" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Diffusion Ciblée</h3>
                            <p className="text-xs text-gray-500">Atteignez directement les utilisateurs intéressés.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl"
                        >
                            Retour au tableau de bord
                        </Link>
                        <Link
                            href="/faq"
                            className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                        >
                            En savoir plus
                        </Link>
                    </div>
                </div>

                {/* Footer simple */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        Vous avez des besoins spécifiques ? <Link href="/dashboard/support" className="text-primary font-semibold hover:underline">Contactez le support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
