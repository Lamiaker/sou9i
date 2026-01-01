/**
 * Utilitaire d'export CSV pour les statistiques admin
 */

type CSVData = Record<string, string | number | boolean | null | undefined>;

/**
 * Convertit un tableau d'objets en chaîne CSV
 */
export function convertToCSV(data: CSVData[], headers?: { key: string; label: string }[]): string {
    if (data.length === 0) return '';

    // Si pas de headers spécifiés, utiliser les clés du premier objet
    const keys = headers ? headers.map(h => h.key) : Object.keys(data[0]);
    const labels = headers ? headers.map(h => h.label) : keys;

    // Ligne d'en-tête
    const headerLine = labels.map(escapeCSVValue).join(',');

    // Lignes de données
    const dataLines = data.map(row => {
        return keys.map(key => {
            const value = row[key];
            return escapeCSVValue(value);
        }).join(',');
    });

    return [headerLine, ...dataLines].join('\n');
}

/**
 * Échappe une valeur pour le format CSV
 */
function escapeCSVValue(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // Échapper les guillemets et entourer de guillemets si nécessaire
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

/**
 * Déclenche le téléchargement d'un fichier CSV
 */
export function downloadCSV(data: CSVData[], filename: string, headers?: { key: string; label: string }[]): void {
    const csv = convertToCSV(data, headers);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM UTF-8 pour Excel
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Formatte une date pour l'export
 */
export function formatDateForExport(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Headers prédéfinis pour différents exports
 */
export const EXPORT_HEADERS = {
    users: [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'Ville' },
        { key: 'verificationStatus', label: 'Statut' },
        { key: 'adsCount', label: 'Nombre d\'annonces' },
        { key: 'createdAt', label: 'Date d\'inscription' },
    ],
    ads: [
        { key: 'title', label: 'Titre' },
        { key: 'price', label: 'Prix (DA)' },
        { key: 'category', label: 'Catégorie' },
        { key: 'location', label: 'Ville' },
        { key: 'views', label: 'Vues' },
        { key: 'status', label: 'Statut' },
        { key: 'moderationStatus', label: 'Modération' },
        { key: 'createdAt', label: 'Date de création' },
    ],
    timeline: [
        { key: 'date', label: 'Date' },
        { key: 'label', label: 'Jour' },
        { key: 'count', label: 'Nombre' },
    ],
    categories: [
        { key: 'categoryName', label: 'Catégorie' },
        { key: 'count', label: 'Nombre d\'annonces' },
    ],
    locations: [
        { key: 'location', label: 'Ville' },
        { key: 'count', label: 'Nombre d\'annonces' },
    ],
};
