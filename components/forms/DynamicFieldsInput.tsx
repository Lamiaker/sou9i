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

        case 'MULTISELECT': {
            // Parse les valeurs sélectionnées (stockées en JSON)
            const selectedValues: string[] = value ? JSON.parse(value) : [];

            const handleCheckboxChange = (option: string, checked: boolean) => {
                let newValues: string[];
                if (checked) {
                    newValues = [...selectedValues, option];
                } else {
                    newValues = selectedValues.filter(v => v !== option);
                }
                onChange(JSON.stringify(newValues));
            };

            return (
                <div className="sm:col-span-2">
                    {label}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {(field.options || []).map((option) => (
                            <label
                                key={option}
                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedValues.includes(option)
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 hover:border-gray-300'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option)}
                                    onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                                    disabled={disabled}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm">{option}</span>
                            </label>
                        ))}
                    </div>
                    {errorMessage}
                </div>
            );
        }

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
            type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN' | 'IMAGE';
        };
    }>;
}

import { CheckCircle2, XCircle, Info } from 'lucide-react';

/**
 * Composant pour afficher les valeurs des champs dynamiques (lecture seule)
 * Version Premium avec gestion des tags et icônes
 */
interface DynamicFieldsDisplayProps {
    fields: Array<{
        id: string;
        value: string;
        field: {
            id: string;
            name: string;
            label: string;
            type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN' | 'IMAGE';
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

                // 1. Cas Spécial: MULTISELECT (Affichage sous forme de tags)
                if (field.type === 'MULTISELECT') {
                    try {
                        const options = JSON.parse(value);
                        if (Array.isArray(options) && options.length > 0) {
                            return (
                                <div key={field.id} className="col-span-1 sm:col-span-2 space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Info size={14} className="text-primary/40" />
                                        {field.label}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {options.map((opt, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 bg-white text-primary text-xs font-bold rounded-xl border border-primary/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-default"
                                            >
                                                {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                    } catch (e) {
                        console.error("Error parsing multiselect value:", e);
                    }
                }

                // 2. Cas Spécial: BOOLEAN (Affichage avec icône)
                if (field.type === 'BOOLEAN') {
                    const isTrue = value === 'true';
                    return (
                        <div
                            key={field.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isTrue
                                    ? 'bg-green-50/30 border-green-100 text-green-900'
                                    : 'bg-gray-50/50 border-gray-100 text-gray-500'
                                }`}
                        >
                            <span className="text-sm font-semibold">{field.label}</span>
                            {isTrue ? (
                                <div className="flex items-center gap-1.5 text-green-600 bg-white px-2 py-1 rounded-lg shadow-sm border border-green-100">
                                    <CheckCircle2 size={16} />
                                    <span className="text-[10px] font-bold uppercase">Oui</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-gray-400 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                                    <XCircle size={16} />
                                    <span className="text-[10px] font-bold uppercase">Non</span>
                                </div>
                            )}
                        </div>
                    );
                }

                // 3. Cas par défaut: TEXT, NUMBER, SELECT
                return (
                    <div
                        key={field.id}
                        className="group p-4 bg-white hover:bg-gray-50/50 hover:shadow-sm transition-all rounded-2xl border border-gray-100 flex flex-col gap-1"
                    >
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary/50 transition-colors">
                            {field.label}
                        </span>
                        <span className="text-gray-900 font-bold truncate" title={value}>
                            {value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

