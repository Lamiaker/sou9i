export default function ProfilePage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Informations personnelles</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Détails de votre compte et annonces.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <div className="p-4 text-center text-gray-500">
                        Contenu du profil à venir...
                    </div>
                </div>
            </div>
        </div>
    );
}
