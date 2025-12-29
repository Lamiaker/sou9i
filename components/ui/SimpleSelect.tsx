"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface SimpleSelectOption {
    value: string;
    label: string;
}

interface SimpleSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SimpleSelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Composant Select simple et compact pour les filtres/tris
 * Style moderne sans icône de catégorie
 */
export default function SimpleSelect({
    value,
    onChange,
    options,
    placeholder = "Sélectionner...",
    disabled = false,
    className = "",
}: SimpleSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Fermer le dropdown quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Bouton de sélection */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full px-4 py-2.5 bg-white border-2 rounded-xl text-left transition-all duration-200 flex items-center gap-2",
                    "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    isOpen && "border-primary ring-2 ring-primary/20",
                    !isOpen && "border-gray-200",
                    disabled && "opacity-60 cursor-not-allowed bg-gray-50"
                )}
            >
                <span className={cn(
                    "flex-1 text-sm font-medium truncate",
                    selectedOption ? "text-gray-800" : "text-gray-400"
                )}>
                    {selectedOption?.label || placeholder}
                </span>

                <ChevronDown
                    size={16}
                    className={cn(
                        "text-gray-400 transition-transform duration-200 shrink-0",
                        isOpen && "rotate-180 text-primary"
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="max-h-48 overflow-y-auto py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors",
                                    "hover:bg-gray-50",
                                    value === option.value && "bg-primary/5"
                                )}
                            >
                                <span className={cn(
                                    "text-sm",
                                    value === option.value
                                        ? "text-primary font-medium"
                                        : "text-gray-700"
                                )}>
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <Check size={14} className="text-primary shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
