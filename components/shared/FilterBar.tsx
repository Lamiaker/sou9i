"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Search, SlidersHorizontal } from 'lucide-react';

export type FilterType = 'select' | 'range' | 'text' | 'number';

export interface FilterOption {
    label: string;
    value: string | number;
}

export interface FilterConfig<F> {
    key: keyof F;
    label: string;
    type: FilterType;
    options?: string[] | FilterOption[];
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    unit?: string;
    advanced?: boolean;
    defaultValue?: any; // Value considered as "no filter applied"
}

interface FilterBarProps<F> {
    filters: F;
    configs: FilterConfig<F>[];
    onUpdate: (key: keyof F, value: any) => void;
    onReset: () => void;
    className?: string;
}

export function FilterBar<F>({ filters, configs, onUpdate, onReset, className = '' }: FilterBarProps<F>) {
    const [openFilter, setOpenFilter] = useState<keyof F | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOverlayClick = () => {
        setOpenFilter(null);
    };

    // Close dropdowns when clicking outside (fallback)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ((event.target as HTMLElement).closest('.filter-dropdown-container') === null) {
                if (!document.querySelector('.filter-overlay-portal')) {
                    setOpenFilter(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const mainFilters = configs.filter(c => !c.advanced);
    const advancedFilters = configs.filter(c => c.advanced);

    // Logic to determine if "Clear all" should be shown
    const hasActiveFilters = configs.some(c => {
        const val = filters[c.key];
        const defaultVal = c.defaultValue !== undefined ? c.defaultValue : (c.type === 'range' ? c.min : '');

        return val !== defaultVal && val !== null && val !== undefined;
    });

    const renderFilterInput = (config: FilterConfig<F>) => {
        switch (config.type) {
            case 'text':
                return (
                    <div className="relative flex items-center w-full md:w-auto">
                        <Search className="absolute left-3 w-4 h-4 text-gray-400" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder={config.placeholder || config.label}
                            value={(filters[config.key] as unknown as string) || ''}
                            onChange={(e) => onUpdate(config.key, e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full md:w-64 shadow-sm"
                            aria-label={config.label}
                        />
                        {filters[config.key] && (
                            <button
                                onClick={() => onUpdate(config.key, '')}
                                className="absolute right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Effacer la recherche"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                );

            case 'select':
            case 'number':
                let displayOptions: (string | FilterOption)[] = config.options || [];
                if (config.type === 'number') {
                    const min = config.min || 0;
                    const max = config.max || 10;
                    displayOptions = [];
                    for (let i = min; i <= max; i++) {
                        displayOptions.push({ label: i === 0 ? 'Toutes' : `${i}+`, value: i });
                    }
                }

                return (
                    <div className={`relative filter-dropdown-container ${openFilter === config.key ? 'z-50' : 'z-30'}`}>
                        <button
                            onClick={() => setOpenFilter(openFilter === config.key ? null : config.key)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all shadow-sm whitespace-nowrap ${filters[config.key] !== (config.defaultValue ?? (config.type === 'number' ? 0 : ''))
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            aria-haspopup="true"
                            aria-expanded={openFilter === config.key}
                        >
                            <span className="text-sm font-medium">
                                {config.type === 'number' && (filters[config.key] as unknown as number) > 0
                                    ? `${filters[config.key]}+ ${config.label}`
                                    : (filters[config.key] as unknown as string || config.label)}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${openFilter === config.key ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>

                        {openFilter === config.key && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-40 p-3 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2 max-h-60 overflow-y-auto" role="radiogroup" aria-label={config.label}>
                                    {displayOptions.map((option) => {
                                        const value = typeof option === 'string' ? option : option.value;
                                        const label = typeof option === 'string' ? option : option.label;
                                        return (
                                            <label key={String(value)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="radio"
                                                    name={String(config.key)}
                                                    value={value}
                                                    checked={filters[config.key] === value}
                                                    onChange={() => {
                                                        onUpdate(config.key, value);
                                                        setOpenFilter(null);
                                                    }}
                                                    className="text-blue-500 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {filters[config.key] !== (config.defaultValue ?? (config.type === 'number' ? 0 : '')) && (
                                    <button
                                        onClick={() => {
                                            onUpdate(config.key, config.defaultValue ?? (config.type === 'number' ? 0 : ''));
                                            setOpenFilter(null);
                                        }}
                                        className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Effacer
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'range':
                return (
                    <div className={`relative filter-dropdown-container ${openFilter === config.key ? 'z-50' : 'z-30'}`}>
                        <button
                            onClick={() => setOpenFilter(openFilter === config.key ? null : config.key)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all shadow-sm whitespace-nowrap ${(filters[config.key] !== (config.defaultValue ?? config.min ?? 0))
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            aria-haspopup="true"
                            aria-expanded={openFilter === config.key}
                        >
                            <span className="text-sm font-medium">{config.label}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${openFilter === config.key ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>

                        {openFilter === config.key && (
                            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-40 p-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            {config.defaultValue === config.max ? 'Max' : 'Valeur'}: {(filters[config.key] as unknown as number)?.toLocaleString()} {config.unit}
                                        </label>
                                        <input
                                            type="range"
                                            min={config.min || 0}
                                            max={config.max || 100}
                                            step={config.step || 1}
                                            value={(filters[config.key] as unknown as number) || 0}
                                            onChange={(e) => onUpdate(config.key, Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{config.min || 0} {config.unit}</span>
                                            <span>{config.max?.toLocaleString()} {config.unit}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {mounted && openFilter && createPortal(
                <div
                    className="fixed inset-0 z-[15] bg-black/10 backdrop-blur-[1px] filter-overlay-portal"
                    onClick={handleOverlayClick}
                    aria-hidden="true"
                />,
                document.body
            )}

            <div className={`w-full relative ${className}`}>
                <div className="flex flex-wrap gap-3 items-center">
                    {mainFilters.map(config => (
                        <div key={String(config.key)}>
                            {renderFilterInput(config)}
                        </div>
                    ))}

                    {advancedFilters.length > 0 && (
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all whitespace-nowrap ${showAdvanced
                                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
                                }`}
                            aria-expanded={showAdvanced}
                        >
                            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                            <span className="text-sm font-medium">Filtres avancés</span>
                        </button>
                    )}

                    {hasActiveFilters && (
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                            Effacer tout
                        </button>
                    )}
                </div>

                {showAdvanced && advancedFilters.length > 0 && (
                    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {advancedFilters.map(config => (
                                <div key={String(config.key)}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {config.label}
                                    </label>
                                    {config.type === 'range' ? (
                                        <div>
                                            <input
                                                type="range"
                                                min={config.min || 0}
                                                max={config.max || 100}
                                                step={config.step || 1}
                                                value={(filters[config.key] as unknown as number) || 0}
                                                onChange={(e) => onUpdate(config.key, Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                                            />
                                            <div className="text-xs text-gray-500 mt-1 text-center">
                                                {filters[config.key] as unknown as number} {config.unit}
                                            </div>
                                        </div>
                                    ) : config.type === 'select' ? (
                                        <select
                                            value={filters[config.key] as unknown as string}
                                            onChange={(e) => onUpdate(config.key, config.type === 'number' ? Number(e.target.value) : e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Toutes</option>
                                            {config.options?.map(opt => {
                                                const val = typeof opt === 'string' ? opt : opt.value;
                                                const lab = typeof opt === 'string' ? opt : opt.label;
                                                return <option key={String(val)} value={val}>{lab}</option>;
                                            })}
                                        </select>
                                    ) : config.type === 'number' ? (
                                        <select
                                            value={filters[config.key] as unknown as number}
                                            onChange={(e) => onUpdate(config.key, Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {[0, 1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num === 0 ? 'Toutes' : `${num}+`}</option>
                                            ))}
                                        </select>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
