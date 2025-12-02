// ============================================
// Fonctions utilitaires générales
// ============================================

/**
 * Formate un prix en DZD
 */
export const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
        return price;
    }
    return `${price.toLocaleString('fr-DZ')} DZD`;
};

/**
 * Formate une date relative (ex: "Il y a 2 jours")
 */
export const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const past = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
    return `Il y a ${Math.floor(diffInDays / 365)} an${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`;
};

/**
 * Tronque un texte à une longueur maximale
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Génère un slug à partir d'un titre
 */
export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .normalize('NFD') // Décompose les caractères accentués
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères non-alphanumériques par des tirets
        .replace(/^-+|-+$/g, ''); // Supprime les tirets en début/fin
};

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone algérien
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    // Format: 05 XX XX XX XX ou 06 XX XX XX XX ou 07 XX XX XX XX
    const phoneRegex = /^(05|06|07)\d{8}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length === 10) {
        return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 4)} ${cleanPhone.substring(4, 6)} ${cleanPhone.substring(6, 8)} ${cleanPhone.substring(8, 10)}`;
    }
    return phone;
};

/**
 * Génère un ID aléatoire
 */
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

/**
 * Classe CSS conditionnelle (comme classnames)
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
    return classes.filter(Boolean).join(' ');
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Copie du texte dans le presse-papier
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/**
 * Vérifie si l'utilisateur est sur mobile
 */
export const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
};
