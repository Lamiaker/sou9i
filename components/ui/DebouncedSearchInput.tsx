"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface DebouncedSearchInputProps {
    /** Valeur initiale ou contrôlée */
    value?: string;
    /** Callback appelé après le délai de debounce */
    onSearch: (value: string) => void;
    /** Délai de debounce en ms (par défaut: 400ms) */
    debounceMs?: number;
    /** Placeholder du champ */
    placeholder?: string;
    /** Classes CSS additionnelles */
    className?: string;
    /** Label pour l'accessibilité */
    ariaLabel?: string;
    /** Afficher l'indicateur de chargement pendant le debounce */
    showLoadingIndicator?: boolean;
    /** Désactiver le champ */
    disabled?: boolean;
    /** Taille du composant */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Champ de recherche avec debounce intégré
 * Évite les requêtes API excessives lors de la saisie rapide
 * 
 * @example
 * <DebouncedSearchInput
 *   onSearch={(query) => fetchResults(query)}
 *   placeholder="Rechercher..."
 *   debounceMs={500}
 * />
 */
export default function DebouncedSearchInput({
    value: controlledValue,
    onSearch,
    debounceMs = 400,
    placeholder = "Rechercher...",
    className = '',
    ariaLabel = "Rechercher",
    showLoadingIndicator = true,
    disabled = false,
    size = 'md',
}: DebouncedSearchInputProps) {
    // État local pour la valeur saisie
    const [inputValue, setInputValue] = useState(controlledValue ?? '');
    const [isPending, setIsPending] = useState(false);

    // Ref pour tracker si c'est le premier rendu
    const isFirstRender = useRef(true);

    // Valeur debouncée
    const debouncedValue = useDebounce(inputValue, debounceMs);

    // Synchroniser avec la valeur contrôlée si elle change
    useEffect(() => {
        if (controlledValue !== undefined && controlledValue !== inputValue) {
            setInputValue(controlledValue);
        }
    }, [controlledValue]);

    // Détecter si une recherche est en attente
    useEffect(() => {
        if (inputValue !== debouncedValue) {
            setIsPending(true);
        } else {
            setIsPending(false);
        }
    }, [inputValue, debouncedValue]);

    // Exécuter la recherche quand la valeur debouncée change
    useEffect(() => {
        // Ne pas exécuter au premier rendu
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        onSearch(debouncedValue);
    }, [debouncedValue, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleClear = () => {
        setInputValue('');
        // Appeler immédiatement onSearch avec une valeur vide
        onSearch('');
    };

    // Classes selon la taille
    const sizeClasses = {
        sm: 'py-1.5 pl-8 pr-8 text-sm',
        md: 'py-2 pl-9 pr-9 text-sm',
        lg: 'py-2.5 pl-10 pr-10 text-base',
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const iconPositions = {
        sm: 'left-2.5',
        md: 'left-3',
        lg: 'left-3.5',
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            {/* Icône de recherche ou loader */}
            {showLoadingIndicator && isPending ? (
                <Loader2
                    className={`absolute ${iconPositions[size]} ${iconSizes[size]} text-primary animate-spin`}
                    aria-hidden="true"
                />
            ) : (
                <Search
                    className={`absolute ${iconPositions[size]} ${iconSizes[size]} text-gray-400`}
                    aria-hidden="true"
                />
            )}

            {/* Champ de saisie */}
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`
                    ${sizeClasses[size]}
                    border border-gray-300 rounded-xl
                    focus:ring-2 focus:ring-primary/50 focus:border-primary
                    outline-none transition-all
                    w-full
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    shadow-sm
                `}
                aria-label={ariaLabel}
                role="searchbox"
            />

            {/* Bouton effacer */}
            {inputValue && !disabled && (
                <button
                    onClick={handleClear}
                    className={`
                        absolute right-3 
                        text-gray-400 hover:text-gray-600 
                        transition-colors
                        p-0.5 rounded-full hover:bg-gray-100
                    `}
                    aria-label="Effacer la recherche"
                    type="button"
                >
                    <X className={iconSizes[size]} />
                </button>
            )}
        </div>
    );
}
