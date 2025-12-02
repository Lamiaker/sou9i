import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand & Description */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">MarchéFemme</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            La première marketplace dédiée aux femmes en Algérie. Trouvez tout ce dont vous avez besoin, de la mode à la décoration.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Facebook size={20} />
                            </Link>
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Instagram size={20} />
                            </Link>
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Twitter size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Liens Rapides</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link href="/search" className="hover:text-white transition-colors">
                                    Toutes les annonces
                                </Link>
                            </li>
                            <li>
                                <Link href="/deposer" className="hover:text-white transition-colors">
                                    Déposer une annonce
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">
                                    Mon compte
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Catégories</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/categories/vetements" className="hover:text-white transition-colors">
                                    Vêtements
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/beaute" className="hover:text-white transition-colors">
                                    Beauté & Bien-être
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/maison" className="hover:text-white transition-colors">
                                    Maison & Déco
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/enfants" className="hover:text-white transition-colors">
                                    Bébé & Enfant
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="shrink-0 text-primary" />
                                <span>Alger, Algérie</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="shrink-0 text-primary" />
                                <span>+213 555 123 456</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="shrink-0 text-primary" />
                                <span>contact@marchefemme.dz</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p>&copy; {new Date().getFullYear()} MarchéFemme. Tous droits réservés.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">
                            Mentions légales
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Politique de confidentialité
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            CGU
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
