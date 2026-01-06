import useSWR from 'swr'

export interface DynamicField {
    id: string
    categoryId: string
    name: string
    label: string
    type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN' | 'IMAGE'
    placeholder: string | null
    required: boolean
    order: number
    options: string[] | null
    minValue: number | null
    maxValue: number | null
    minLength: number | null
    maxLength: number | null
}

interface UseDynamicFieldsOptions {
    enabled?: boolean
}

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Erreur lors du chargement des champs')
    }
    const data = await res.json()
    return data.success ? data.data : []
}

/**
 * Hook pour récupérer les champs dynamiques d'une catégorie
 */
export function useDynamicFields(categoryId: string | null | undefined, options: UseDynamicFieldsOptions = {}) {
    const { enabled = true } = options

    const shouldFetch = enabled && categoryId

    const { data, error, isLoading, mutate } = useSWR<DynamicField[]>(
        shouldFetch ? `/api/categories/${categoryId}/fields` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // Cache pendant 1 minute
        }
    )

    return {
        fields: data || [],
        loading: isLoading,
        error: error?.message || null,
        refresh: mutate,
    }
}

/**
 * Fonctions utilitaires pour la validation des champs
 */
export function validateFieldValue(
    field: DynamicField,
    value: string
): { valid: boolean; error: string | null } {
    // Champ requis non rempli
    if (field.required && (!value || value.trim() === '')) {
        return { valid: false, error: `Le champ "${field.label}" est requis` }
    }

    // Si pas de valeur et non requis, c'est OK
    if (!value || value.trim() === '') {
        return { valid: true, error: null }
    }

    switch (field.type) {
        case 'NUMBER': {
            const numValue = parseFloat(value)
            if (isNaN(numValue)) {
                return { valid: false, error: `"${field.label}" doit être un nombre` }
            }
            if (field.minValue !== null && numValue < field.minValue) {
                return { valid: false, error: `"${field.label}" doit être au minimum ${field.minValue}` }
            }
            if (field.maxValue !== null && numValue > field.maxValue) {
                return { valid: false, error: `"${field.label}" doit être au maximum ${field.maxValue}` }
            }
            break
        }

        case 'TEXT':
        case 'TEXTAREA': {
            if (field.minLength !== null && value.length < field.minLength) {
                return { valid: false, error: `"${field.label}" doit contenir au moins ${field.minLength} caractères` }
            }
            if (field.maxLength !== null && value.length > field.maxLength) {
                return { valid: false, error: `"${field.label}" doit contenir au maximum ${field.maxLength} caractères` }
            }
            break
        }

        case 'SELECT': {
            if (field.options && !field.options.includes(value)) {
                return { valid: false, error: `Valeur invalide pour "${field.label}"` }
            }
            break
        }

        case 'MULTISELECT': {
            try {
                const selectedValues = JSON.parse(value)
                if (!Array.isArray(selectedValues)) {
                    return { valid: false, error: `Format invalide pour "${field.label}"` }
                }
                // Vérifier que toutes les valeurs sont dans les options
                if (field.options) {
                    for (const v of selectedValues) {
                        if (!field.options.includes(v)) {
                            return { valid: false, error: `Valeur invalide pour "${field.label}"` }
                        }
                    }
                }
            } catch {
                return { valid: false, error: `Format invalide pour "${field.label}"` }
            }
            break
        }

        case 'BOOLEAN': {
            if (value !== 'true' && value !== 'false') {
                return { valid: false, error: `"${field.label}" doit être vrai ou faux` }
            }
            break
        }
    }

    return { valid: true, error: null }
}

/**
 * Valider tous les champs dynamiques
 */
export function validateAllFields(
    fields: DynamicField[],
    values: Record<string, string>
): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    for (const field of fields) {
        const value = values[field.id] || ''
        const result = validateFieldValue(field, value)
        if (!result.valid && result.error) {
            errors[field.id] = result.error
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    }
}
