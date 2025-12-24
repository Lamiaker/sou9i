"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Grid3X3, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface CategoryOption {
    id: string;
    name: string;
    icon?: string | null;
}

interface CategorySelectProps {
    id?: string;
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    options: CategoryOption[];
    placeholder?: string;
    disabled?: boolean;
    emptyMessage?: string;
    variant?: "category" | "subcategory";
}

export default function CategorySelect({
    id,
    label,
    required = false,
    value,
    onChange,
    options,
    placeholder = "Sélectionner...",
    disabled = false,
    emptyMessage = "Aucune option disponible",
    variant = "category",
}: CategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    // Fermer le dropdown quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrer les options
    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleOpen = () => {
        if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const Icon = variant === "category" ? Grid3X3 : FolderOpen;

    return (
        <div ref={containerRef} className="relative">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {/* Bouton de sélection */}
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className={cn(
                    "w-full px-4 py-3.5 bg-white border-2 rounded-xl text-left transition-all duration-200 flex items-center gap-3",
                    "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    isOpen && "border-primary ring-2 ring-primary/20",
                    !isOpen && !value && "border-gray-200",
                    !isOpen && value && "border-gray-300",
                    disabled && "opacity-60 cursor-not-allowed bg-gray-50"
                )}
            >
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    value
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-400"
                )}>
                    <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    {selectedOption ? (
                        <>
                            <p className="text-gray-900 font-medium truncate">
                                {selectedOption.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {variant === "category" ? "Catégorie sélectionnée" : "Sous-catégorie sélectionnée"}
                            </p>
                        </>
                    ) : (
                        <p className="text-gray-400">{placeholder}</p>
                    )}
                </div>

                <ChevronDown
                    size={20}
                    className={cn(
                        "text-gray-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-primary"
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Recherche */}
                    <div className="p-3 border-b border-gray-100">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Rechercher une ${variant === "category" ? "catégorie" : "sous-catégorie"}...`}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
                        />
                    </div>

                    {/* Liste des options */}
                    <div className="max-h-64 overflow-y-auto">
                        {/* Option vide (optionnel) */}
                        {!required && (
                            <button
                                type="button"
                                onClick={() => handleSelect("")}
                                className={cn(
                                    "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                                    "hover:bg-gray-50",
                                    !value && "bg-primary/5"
                                )}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">—</span>
                                </div>
                                <span className="text-gray-500 text-sm">Aucune sélection</span>
                                {!value && (
                                    <Check size={16} className="ml-auto text-primary" />
                                )}
                            </button>
                        )}

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option.id)}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                                        "hover:bg-gray-50",
                                        value === option.id && "bg-primary/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                                        value === option.id
                                            ? "bg-primary/10"
                                            : "bg-gray-100"
                                    )}>
                                        {option.icon || (
                                            <Icon size={16} className={cn(
                                                value === option.id ? "text-primary" : "text-gray-400"
                                            )} />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "flex-1 text-sm",
                                        value === option.id
                                            ? "text-primary font-medium"
                                            : "text-gray-700"
                                    )}>
                                        {option.name}
                                    </span>
                                    {value === option.id && (
                                        <Check size={16} className="text-primary" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                {searchTerm ? "Aucun résultat trouvé" : emptyMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
