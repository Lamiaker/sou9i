import { prisma } from '@/lib/prisma'
import { FieldType } from '@prisma/client'

// Types pour les entrées
export interface CreateFieldInput {
    categoryId: string
    name: string
    label: string
    type: FieldType
    placeholder?: string
    required?: boolean
    order?: number
    options?: string[]
    minValue?: number
    maxValue?: number
    minLength?: number
    maxLength?: number
}

export interface UpdateFieldInput {
    name?: string
    label?: string
    type?: FieldType
    placeholder?: string
    required?: boolean
    order?: number
    options?: string[]
    minValue?: number
    maxValue?: number
    minLength?: number
    maxLength?: number
}

export interface FieldValueInput {
    fieldId: string
    value: string
}

export class SubcategoryFieldService {
    /**
     * Récupérer tous les champs d'une catégorie (sous-catégorie)
     */
    static async getFieldsByCategory(categoryId: string) {
        return prisma.subcategoryField.findMany({
            where: { categoryId },
            orderBy: { order: 'asc' },
        })
    }

    /**
     * Récupérer un champ par son ID
     */
    static async getFieldById(id: string) {
        const field = await prisma.subcategoryField.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        })

        if (!field) {
            throw new Error('Champ non trouvé')
        }

        return field
    }

    /**
     * Créer un nouveau champ pour une sous-catégorie
     */
    static async createField(data: CreateFieldInput) {
        // Vérifier que la catégorie existe
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        })

        if (!category) {
            throw new Error('Catégorie non trouvée')
        }

        // Vérifier que le nom technique n'existe pas déjà pour cette catégorie
        const existing = await prisma.subcategoryField.findUnique({
            where: {
                categoryId_name: {
                    categoryId: data.categoryId,
                    name: data.name,
                },
            },
        })

        if (existing) {
            throw new Error('Un champ avec ce nom existe déjà pour cette catégorie')
        }

        // Calculer l'ordre si non fourni
        let order = data.order
        if (order === undefined) {
            const lastField = await prisma.subcategoryField.findFirst({
                where: { categoryId: data.categoryId },
                orderBy: { order: 'desc' },
            })
            order = lastField ? lastField.order + 1 : 0
        }

        return prisma.subcategoryField.create({
            data: {
                categoryId: data.categoryId,
                name: data.name,
                label: data.label,
                type: data.type,
                placeholder: data.placeholder,
                required: data.required ?? false,
                order,
                options: data.options ? JSON.parse(JSON.stringify(data.options)) : null,
                minValue: data.minValue,
                maxValue: data.maxValue,
                minLength: data.minLength,
                maxLength: data.maxLength,
            },
        })
    }

    /**
     * Mettre à jour un champ
     */
    static async updateField(id: string, data: UpdateFieldInput) {
        // Vérifier que le champ existe
        const field = await prisma.subcategoryField.findUnique({
            where: { id },
        })

        if (!field) {
            throw new Error('Champ non trouvé')
        }

        // Si on change le nom, vérifier qu'il n'existe pas déjà
        if (data.name && data.name !== field.name) {
            const existing = await prisma.subcategoryField.findUnique({
                where: {
                    categoryId_name: {
                        categoryId: field.categoryId,
                        name: data.name,
                    },
                },
            })

            if (existing) {
                throw new Error('Un champ avec ce nom existe déjà pour cette catégorie')
            }
        }

        return prisma.subcategoryField.update({
            where: { id },
            data: {
                ...data,
                options: data.options ? JSON.parse(JSON.stringify(data.options)) : undefined,
            },
        })
    }

    /**
     * Supprimer un champ
     */
    static async deleteField(id: string) {
        // Vérifier que le champ existe
        const field = await prisma.subcategoryField.findUnique({
            where: { id },
        })

        if (!field) {
            throw new Error('Champ non trouvé')
        }

        // Supprimer le champ (les valeurs associées seront supprimées en cascade)
        return prisma.subcategoryField.delete({
            where: { id },
        })
    }

    /**
     * Réordonner les champs d'une catégorie
     */
    static async reorderFields(categoryId: string, fieldIds: string[]) {
        // Mettre à jour l'ordre de chaque champ
        const updates = fieldIds.map((id, index) =>
            prisma.subcategoryField.update({
                where: { id },
                data: { order: index },
            })
        )

        return prisma.$transaction(updates)
    }

    /**
     * Sauvegarder les valeurs des champs dynamiques pour une annonce
     */
    static async saveAdFieldValues(adId: string, fieldValues: FieldValueInput[]) {
        // Supprimer les anciennes valeurs
        await prisma.adFieldValue.deleteMany({
            where: { adId },
        })

        // Créer les nouvelles valeurs
        if (fieldValues.length > 0) {
            await prisma.adFieldValue.createMany({
                data: fieldValues.map(fv => ({
                    adId,
                    fieldId: fv.fieldId,
                    value: fv.value,
                })),
            })
        }

        // Retourner les valeurs avec leurs définitions
        return prisma.adFieldValue.findMany({
            where: { adId },
            include: {
                field: true,
            },
            orderBy: {
                field: {
                    order: 'asc',
                },
            },
        })
    }

    /**
     * Récupérer les valeurs des champs dynamiques d'une annonce
     */
    static async getAdFieldValues(adId: string) {
        return prisma.adFieldValue.findMany({
            where: { adId },
            include: {
                field: true,
            },
            orderBy: {
                field: {
                    order: 'asc',
                },
            },
        })
    }

    /**
     * Valider les valeurs des champs selon leurs contraintes
     */
    static async validateFieldValues(categoryId: string, fieldValues: FieldValueInput[]) {
        const fields = await this.getFieldsByCategory(categoryId)
        const errors: { fieldId: string; fieldName: string; message: string }[] = []

        // Créer un map des valeurs pour accès rapide
        const valuesMap = new Map(fieldValues.map(fv => [fv.fieldId, fv.value]))

        for (const field of fields) {
            const value = valuesMap.get(field.id)

            // Vérifier si le champ requis est rempli
            if (field.required && (!value || value.trim() === '')) {
                errors.push({
                    fieldId: field.id,
                    fieldName: field.name,
                    message: `Le champ "${field.label}" est requis`,
                })
                continue
            }

            // Si pas de valeur et non requis, passer
            if (!value || value.trim() === '') continue

            // Validation selon le type
            switch (field.type) {
                case 'NUMBER': {
                    const numValue = parseFloat(value)
                    if (isNaN(numValue)) {
                        errors.push({
                            fieldId: field.id,
                            fieldName: field.name,
                            message: `Le champ "${field.label}" doit être un nombre`,
                        })
                    } else {
                        if (field.minValue !== null && numValue < field.minValue) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: `Le champ "${field.label}" doit être au minimum ${field.minValue}`,
                            })
                        }
                        if (field.maxValue !== null && numValue > field.maxValue) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: `Le champ "${field.label}" doit être au maximum ${field.maxValue}`,
                            })
                        }
                    }
                    break
                }

                case 'TEXT':
                case 'TEXTAREA': {
                    if (field.minLength !== null && value.length < field.minLength) {
                        errors.push({
                            fieldId: field.id,
                            fieldName: field.name,
                            message: `Le champ "${field.label}" doit contenir au moins ${field.minLength} caractères`,
                        })
                    }
                    if (field.maxLength !== null && value.length > field.maxLength) {
                        errors.push({
                            fieldId: field.id,
                            fieldName: field.name,
                            message: `Le champ "${field.label}" doit contenir au maximum ${field.maxLength} caractères`,
                        })
                    }
                    break
                }

                case 'SELECT': {
                    const options = field.options as string[] | null
                    if (options && !options.includes(value)) {
                        errors.push({
                            fieldId: field.id,
                            fieldName: field.name,
                            message: `La valeur "${value}" n'est pas valide pour le champ "${field.label}"`,
                        })
                    }
                    break
                }

                case 'BOOLEAN': {
                    if (value !== 'true' && value !== 'false') {
                        errors.push({
                            fieldId: field.id,
                            fieldName: field.name,
                            message: `Le champ "${field.label}" doit être vrai ou faux`,
                        })
                    }
                    break
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        }
    }

    /**
     * Copier les champs d'une catégorie vers une autre
     */
    static async copyFieldsToCategory(fromCategoryId: string, toCategoryId: string) {
        const sourceFields = await this.getFieldsByCategory(fromCategoryId)

        const createdFields = []
        for (const field of sourceFields) {
            const created = await prisma.subcategoryField.create({
                data: {
                    categoryId: toCategoryId,
                    name: field.name,
                    label: field.label,
                    type: field.type,
                    placeholder: field.placeholder,
                    required: field.required,
                    order: field.order,
                    options: field.options ?? undefined,
                    minValue: field.minValue,
                    maxValue: field.maxValue,
                    minLength: field.minLength,
                    maxLength: field.maxLength,
                },
            })
            createdFields.push(created)
        }

        return createdFields
    }
}
