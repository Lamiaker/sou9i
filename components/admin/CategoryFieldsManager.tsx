"use client";

import { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    GripVertical,
    Type,
    FileText,
    Hash,
    ListOrdered,
    ToggleRight,
    Image as ImageIcon,
    Loader2,
    ChevronDown,
    AlertTriangle,
    Save,
    X
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

// Types
interface DynamicField {
    id: string;
    categoryId: string;
    name: string;
    label: string;
    type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'IMAGE';
    placeholder: string | null;
    required: boolean;
    order: number;
    options: string[] | null;
    minValue: number | null;
    maxValue: number | null;
    minLength: number | null;
    maxLength: number | null;
}

interface CategoryFieldsManagerProps {
    categoryId: string;
    categoryName: string;
}

const FIELD_TYPES = [
    { type: 'TEXT', label: 'Texte', icon: Type, description: 'Champ texte court' },
    { type: 'TEXTAREA', label: 'Texte long', icon: FileText, description: 'Zone de texte multiligne' },
    { type: 'NUMBER', label: 'Nombre', icon: Hash, description: 'Valeur numérique' },
    { type: 'SELECT', label: 'Liste', icon: ListOrdered, description: 'Liste déroulante' },
    { type: 'BOOLEAN', label: 'Case à cocher', icon: ToggleRight, description: 'Oui/Non' },
    { type: 'IMAGE', label: 'Image', icon: ImageIcon, description: 'URL d\'image' },
] as const;

type FieldType = typeof FIELD_TYPES[number]['type'];

interface FieldFormData {
    name: string;
    label: string;
    type: FieldType;
    placeholder: string;
    required: boolean;
    options: string[];
    minValue: string;
    maxValue: string;
    minLength: string;
    maxLength: string;
}

const initialFormData: FieldFormData = {
    name: '',
    label: '',
    type: 'TEXT',
    placeholder: '',
    required: false,
    options: [],
    minValue: '',
    maxValue: '',
    minLength: '',
    maxLength: '',
};

export default function CategoryFieldsManager({ categoryId, categoryName }: CategoryFieldsManagerProps) {
    const toast = useToast();
    const [fields, setFields] = useState<DynamicField[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingField, setEditingField] = useState<DynamicField | null>(null);
    const [formData, setFormData] = useState<FieldFormData>(initialFormData);
    const [optionInput, setOptionInput] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

    // Fetch fields
    useEffect(() => {
        fetchFields();
    }, [categoryId]);

    const fetchFields = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/categories/${categoryId}/fields`);
            const data = await res.json();
            if (data.success) {
                setFields(data.data);
            } else {
                toast.error(data.error || 'Erreur lors du chargement des champs');
            }
        } catch (error) {
            console.error('Error fetching fields:', error);
            toast.error('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    // Generate name from label
    const generateName = (label: string): string => {
        return label
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '');
    };

    // Handle label change (auto-generate name)
    const handleLabelChange = (label: string) => {
        setFormData(prev => ({
            ...prev,
            label,
            name: editingField ? prev.name : generateName(label)
        }));
    };

    // Add option for SELECT type
    const addOption = () => {
        if (optionInput.trim()) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, optionInput.trim()]
            }));
            setOptionInput('');
        }
    };

    // Remove option
    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    // Open edit form
    const openEditForm = (field: DynamicField) => {
        setEditingField(field);
        setFormData({
            name: field.name,
            label: field.label,
            type: field.type,
            placeholder: field.placeholder || '',
            required: field.required,
            options: field.options as string[] || [],
            minValue: field.minValue?.toString() || '',
            maxValue: field.maxValue?.toString() || '',
            minLength: field.minLength?.toString() || '',
            maxLength: field.maxLength?.toString() || '',
        });
        setShowForm(true);
    };

    // Save field (create or update)
    const handleSave = async () => {
        // Validation
        if (!formData.name || !formData.label) {
            toast.error('Le nom et le label sont requis');
            return;
        }

        if (formData.type === 'SELECT' && formData.options.length === 0) {
            toast.error('Au moins une option est requise pour un champ de type liste');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                label: formData.label,
                type: formData.type,
                placeholder: formData.placeholder || null,
                required: formData.required,
                options: formData.type === 'SELECT' ? formData.options : null,
                minValue: formData.minValue ? parseFloat(formData.minValue) : null,
                maxValue: formData.maxValue ? parseFloat(formData.maxValue) : null,
                minLength: formData.minLength ? parseInt(formData.minLength) : null,
                maxLength: formData.maxLength ? parseInt(formData.maxLength) : null,
            };

            let res;
            if (editingField) {
                // Update
                res = await fetch(`/api/categories/${categoryId}/fields/${editingField.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create
                res = await fetch(`/api/categories/${categoryId}/fields`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Erreur lors de la sauvegarde');
                return;
            }

            toast.success(editingField ? 'Champ modifié avec succès' : 'Champ créé avec succès');
            setShowForm(false);
            setEditingField(null);
            setFormData(initialFormData);
            fetchFields();
        } catch (error) {
            console.error('Error saving field:', error);
            toast.error('Erreur réseau');
        } finally {
            setSaving(false);
        }
    };

    // Delete field
    const handleDelete = async () => {
        if (!confirmDelete) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/categories/${categoryId}/fields/${confirmDelete.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Erreur lors de la suppression');
                return;
            }

            toast.success('Champ supprimé avec succès');
            setConfirmDelete(null);
            fetchFields();
        } catch (error) {
            console.error('Error deleting field:', error);
            toast.error('Erreur réseau');
        } finally {
            setSaving(false);
        }
    };

    const getTypeIcon = (type: FieldType) => {
        const config = FIELD_TYPES.find(t => t.type === type);
        return config?.icon || Type;
    };

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-white/40" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <Type className="w-5 h-5 text-purple-400" />
                        Champs Dynamiques
                        <span className="text-sm bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                            {fields.length}
                        </span>
                    </h3>
                    <p className="text-sm text-white/40 mt-1">
                        Champs personnalisés pour les annonces de {categoryName}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingField(null);
                        setFormData(initialFormData);
                        setShowForm(true);
                    }}
                    className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Ajouter un champ
                </button>
            </div>

            {/* Fields List */}
            {fields.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {fields.map((field) => {
                        const IconComponent = getTypeIcon(field.type);
                        return (
                            <div
                                key={field.id}
                                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <GripVertical className="w-5 h-5 text-white/20 cursor-move" />
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <IconComponent className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium flex items-center gap-2">
                                            {field.label}
                                            {field.required && (
                                                <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                                    Requis
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-white/40">
                                            {field.name} • {FIELD_TYPES.find(t => t.type === field.type)?.label}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditForm(field)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete({ id: field.id, name: field.label })}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-12 text-center">
                    <Type className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40">Aucun champ dynamique</p>
                    <p className="text-sm text-white/30 mt-1">
                        Les annonces de cette catégorie utilisent uniquement les champs standards
                    </p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !saving && setShowForm(false)}
                    />
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingField ? 'Modifier le champ' : 'Nouveau champ'}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                disabled={saving}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Type de champ
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                                            className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${formData.type === type
                                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="text-xs">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Label <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => handleLabelChange(e.target.value)}
                                    placeholder="Ex: Kilométrage"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>

                            {/* Name (auto-generated) */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Nom technique
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="kilometrage"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                />
                                <p className="text-xs text-white/40 mt-1">
                                    Généré automatiquement à partir du label
                                </p>
                            </div>

                            {/* Placeholder */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Placeholder
                                </label>
                                <input
                                    type="text"
                                    value={formData.placeholder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                                    placeholder="Ex: Entrez le kilométrage..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>

                            {/* Required checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.required}
                                    onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                                />
                                <span className="text-white/80">Champ obligatoire</span>
                            </label>

                            {/* Options for SELECT type */}
                            {formData.type === 'SELECT' && (
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Options <span className="text-red-400">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={optionInput}
                                            onChange={(e) => setOptionInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                                            placeholder="Ajouter une option..."
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {formData.options.map((option, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg"
                                            >
                                                <span className="text-white/80">{option}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Min/Max for NUMBER type */}
                            {formData.type === 'NUMBER' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Valeur min
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minValue}
                                            onChange={(e) => setFormData(prev => ({ ...prev, minValue: e.target.value }))}
                                            placeholder="0"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Valeur max
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxValue}
                                            onChange={(e) => setFormData(prev => ({ ...prev, maxValue: e.target.value }))}
                                            placeholder="1000000"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Min/Max length for TEXT/TEXTAREA */}
                            {(formData.type === 'TEXT' || formData.type === 'TEXTAREA') && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Longueur min
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minLength}
                                            onChange={(e) => setFormData(prev => ({ ...prev, minLength: e.target.value }))}
                                            placeholder="0"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Longueur max
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxLength}
                                            onChange={(e) => setFormData(prev => ({ ...prev, maxLength: e.target.value }))}
                                            placeholder="500"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                            <button
                                onClick={() => setShowForm(false)}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {editingField ? 'Modifier' : 'Créer'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !saving && setConfirmDelete(null)}
                    />
                    <div className="relative bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Supprimer le champ</h2>
                                <p className="text-red-400 text-sm">Cette action est irréversible</p>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                            <p className="text-white/90">
                                Êtes-vous sûr de vouloir supprimer le champ <strong>&quot;{confirmDelete.name}&quot;</strong> ?
                            </p>
                            <p className="text-white/60 text-sm mt-2">
                                Les valeurs existantes de ce champ seront également supprimées.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Supprimer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
