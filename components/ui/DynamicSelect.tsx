"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, List } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface DynamicSelectProps {
    id?: string;
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export default function DynamicSelect({
    id,
    label,
    required = false,
    value,
    onChange,
    options,
    placeholder = "Sélectionner...",
    disabled = false,
    error,
}: DynamicSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleOpen = () => {
        if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

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
                    "w-full px-4 py-3 bg-white border-2 rounded-xl text-left transition-all duration-200 flex items-center gap-3",
                    "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    isOpen && "border-primary ring-2 ring-primary/20",
                    !isOpen && !value && "border-gray-200",
                    !isOpen && value && "border-gray-300",
                    error && "border-red-300 bg-red-50",
                    disabled && "opacity-60 cursor-not-allowed bg-gray-50"
                )}
            >
                <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                    value
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-400"
                )}>
                    <List size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    {value ? (
                        <p className="text-gray-900 font-medium truncate">{value}</p>
                    ) : (
                        <p className="text-gray-400">{placeholder}</p>
                    )}
                </div>

                <ChevronDown
                    size={18}
                    className={cn(
                        "text-gray-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-primary"
                    )}
                />
            </button>

            {/* Message d'erreur */}
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Recherche (seulement si plus de 5 options) */}
                    {options.length > 5 && (
                        <div className="p-3 border-b border-gray-100">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
                            />
                        </div>
                    )}

                    {/* Liste des options */}
                    <div className="max-h-56 overflow-y-auto">
                        {/* Option vide */}
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
                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
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
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                                        "hover:bg-gray-50",
                                        value === option && "bg-primary/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center",
                                        value === option
                                            ? "bg-primary/10"
                                            : "bg-gray-100"
                                    )}>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            value === option ? "bg-primary" : "bg-gray-300"
                                        )} />
                                    </div>
                                    <span className={cn(
                                        "flex-1 text-sm",
                                        value === option
                                            ? "text-primary font-medium"
                                            : "text-gray-700"
                                    )}>
                                        {option}
                                    </span>
                                    {value === option && (
                                        <Check size={16} className="text-primary" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                Aucun résultat trouvé
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
