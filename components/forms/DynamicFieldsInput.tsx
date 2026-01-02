"use client";

import { Loader2, AlertCircle } from 'lucide-react';
import { useDynamicFields, type DynamicField } from '@/hooks/useDynamicFields';
import DynamicSelect from '@/components/ui/DynamicSelect';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

interface DynamicFieldsInputProps {
    categoryId: string | null | undefined;
    values: Record<string, string>;
    onChange: (fieldId: string, value: string) => void;
    errors?: Record<string, string>;
    disabled?: boolean;
}

/**
 * Composant pour afficher dynamiquement les champs d'une catégorie
 */
export default function DynamicFieldsInput({
    categoryId,
    values,
    onChange,
    errors = {},
    disabled = false,
}: DynamicFieldsInputProps) {
    const { fields, loading, error } = useDynamicFields(categoryId);

    if (!categoryId) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6 text-gray-500">
                <Loader2 className="animate-spin mr-2" size={20} />
                Chargement des champs...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 py-4 text-red-500 text-sm">
                <AlertCircle size={18} />
                {error}
            </div>
        );
    }

    if (fields.length === 0) {
        return null; // Pas de champs dynamiques pour cette catégorie
    }

    return (
        <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
                Informations supplémentaires
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <FieldInput
                        key={field.id}
                        field={field}
                        value={values[field.id] || ''}
                        onChange={(value) => onChange(field.id, value)}
                        error={errors[field.id]}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
}

interface FieldInputProps {
    field: DynamicField;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

function FieldInput({ field, value, onChange, error, disabled }: FieldInputProps) {
    const baseClasses = `w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

    const label = (
        <label
            htmlFor={`field-${field.id}`}
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );

    const errorMessage = error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
    );

    switch (field.type) {
        case 'TEXT':
            return (
                <div>
                    {label}
                    <input
                        type="text"
                        id={`field-${field.id}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || ''}
                        disabled={disabled}
                        className={baseClasses}
                        minLength={field.minLength || undefined}
                        maxLength={field.maxLength || undefined}
                    />
                    {errorMessage}
                </div>
            );

        case 'TEXTAREA':
            return (
                <div className="sm:col-span-2">
                    {label}
                    <textarea
                        id={`field-${field.id}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || ''}
                        disabled={disabled}
                        rows={4}
                        className={`${baseClasses} resize-none`}
                        minLength={field.minLength || undefined}
                        maxLength={field.maxLength || undefined}
                    />
                    {errorMessage}
                </div>
            );

        case 'NUMBER':
            return (
                <div>
                    {label}
                    <input
                        type="number"
                        id={`field-${field.id}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || ''}
                        disabled={disabled}
                        className={baseClasses}
                        min={field.minValue ?? undefined}
                        max={field.maxValue ?? undefined}
                        step="any"
                    />
                    {errorMessage}
                </div>
            );

        case 'SELECT':
            return (
                <DynamicSelect
                    id={`field-${field.id}`}
                    label={field.label}
                    required={field.required}
                    value={value}
                    onChange={onChange}
                    options={field.options || []}
                    placeholder={field.placeholder || 'Sélectionner...'}
                    disabled={disabled}
                    error={error}
                />
            );

        case 'BOOLEAN':
            return (
                <div className="sm:col-span-2">
                    <ToggleSwitch
                        id={`field-${field.id}`}
                        label={field.label}
                        required={field.required}
                        checked={value === 'true'}
                        onChange={(checked) => onChange(checked ? 'true' : 'false')}
                        disabled={disabled}
                        error={error}
                    />
                </div>
            );

        case 'IMAGE':
            // Pour l'instant, on traite comme un champ texte (URL)
            // Plus tard, on pourra ajouter un upload
            return (
                <div>
                    {label}
                    <input
                        type="url"
                        id={`field-${field.id}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || "URL de l'image"}
                        disabled={disabled}
                        className={baseClasses}
                    />
                    {errorMessage}
                </div>
            );

        default:
            return null;
    }
}

/**
 * Composant pour afficher les valeurs des champs dynamiques (lecture seule)
 */
interface DynamicFieldsDisplayProps {
    fields: Array<{
        id: string;
        value: string;
        field: {
            id: string;
            name: string;
            label: string;
            type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'IMAGE';
        };
    }>;
}

export function DynamicFieldsDisplay({ fields }: DynamicFieldsDisplayProps) {
    if (!fields || fields.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((fieldValue) => {
                const { field, value } = fieldValue;

                // Formater la valeur selon le type
                let displayValue = value;

                if (field.type === 'BOOLEAN') {
                    displayValue = value === 'true' ? 'Oui' : 'Non';
                }

                return (
                    <div
                        key={fieldValue.id}
                        className="flex justify-between items-center gap-4 border-b border-gray-100 pb-2 overflow-hidden"
                    >
                        <span className="text-gray-500 flex-shrink-0">{field.label}</span>
                        <span
                            className="font-medium text-gray-900 truncate max-w-[200px] text-right"
                            title={displayValue}
                        >
                            {displayValue}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

