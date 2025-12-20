"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useRouter } from "next/navigation";
import { ProfileSkeleton } from "@/components/layout/DashboardInnerSkeletons";

export default function ProfilePage() {
    const { user: sessionUser, update: updateSession } = useAuth();
    const { uploadImages, uploading } = useImageUpload();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // ... (useEffect reste pareil) ...

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile');
                const data = await response.json();

                if (data.success) {
                    setUserData(data.data);
                } else {
                    console.error("Erreur chargement profil:", data.error);
                }
            } catch {
                console.error("Erreur connexion");
            } finally {
                setIsFetching(false);
            }
        };

        if (sessionUser) {
            fetchProfile();
        }
    }, [sessionUser]);


    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setMessage(null);
            // 1. Upload vers le serveur/cloudinary
            const urls = await uploadImages(Array.from(files));
            const newAvatarUrl = urls[0];

            // 2. Mise à jour du profil utilisateur via API
            // Note: Notre route API attend un patch avec les champs à modifier.
            // On peut envoyer juste l&apos;avatar.

            // Mais attendez, notre route API actuelle ne gère pas 'avatar' dans PATCH ! 
            // Je dois vérifier ou modifier l&apos;API pour accepter 'avatar'.
            // Je vais supposer que je peux modifier l&apos;API rapidement après.

            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: newAvatarUrl })
            });

            if (response.ok) {
                // 3. Update local state
                setUserData((prev: any) => ({ ...prev, avatar: newAvatarUrl }));

                if (updateSession) {
                    await updateSession({ image: newAvatarUrl });
                }
                setMessage({ type: 'success', text: 'Photo de profil mise à jour' });
            }

        } catch {
            console.error("Upload error");
            setMessage({ type: 'error', text: 'Erreur lors du téléchargement de l\'image' });
        }
    };


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.target as HTMLFormElement);
        const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            // Bio n&apos;est pas encore dans le modèle, on l&apos;ignore pour l&apos;instant
        };

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
                // Mettre à jour la session locale si le nom a changé
                if (updateSession) {
                    await updateSession({ name: result.data.name });
                }
                setUserData(result.data);
            } else {
                setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Une erreur est survenue' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <ProfileSkeleton />;
    }

    if (!userData) {
        return <div className="text-center py-10">Impossible de charger le profil.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-gray-500">Gérez vos informations personnelles et votre apparence publique.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Public Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md relative bg-gray-100">
                                <Image
                                    src={userData.avatar || "/user.png"} // Fallback image doit exister dans public
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            {/* Input file caché pour l&apos;upload */}
                            <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer group hover:bg-black/40 transition-colors z-10">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                                    {uploading ? (
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    ) : (
                                        <Camera className="text-white" size={24} />
                                    )}
                                </div>
                            </label>
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-gray-900">{userData.name || "Utilisateur"}</h2>
                        <p className="text-sm text-gray-500">Membre depuis {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-'}</p>

                        <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${userData.isVerified
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                            }`}>
                            <ShieldCheck size={14} />
                            {userData.isVerified ? "Compte vérifié" : "En attente de vérification"}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Annonces publiées</span>
                                <span className="font-medium text-gray-900">{userData._count?.ads || 0}</span>
                            </div>
                            {/* TODO: Implémenter le calcul réel des ventes */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ventes réalisées</span>
                                <span className="font-medium text-gray-900">-</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">
                            Informations Personnelles
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={userData.name || ""}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={userData.email || ""}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-gray-50"
                                    // Email souvent en lecture seule ou demande re-validation
                                    // readOnly 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        defaultValue={userData.phone || ""}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville par défaut</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="city"
                                        defaultValue={userData.city || ""}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Cette ville sera pré-remplie lors de vos dépôts d&apos;annonces.</p>
                            </div>

                            {/* Bio commentée car pas dans le modèle User pour l&apos;instant */}
                            {/* <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optionnel)</label>
                                <textarea
                                    name="bio"
                                    rows={3}
                                    defaultValue={userData.bio || ""}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                                    placeholder="Dites-en un peu plus sur vous..."
                                ></textarea>
                            </div> */}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Enregistrer les modifications
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
