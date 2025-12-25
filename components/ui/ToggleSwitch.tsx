"use client";

import { cn } from "@/lib/utils/helpers";

interface ToggleSwitchProps {
    id?: string;
    label: string;
    description?: string;
    required?: boolean;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    error?: string;
}

export default function ToggleSwitch({
    id,
    label,
    description,
    required = false,
    checked,
    onChange,
    disabled = false,
    error,
}: ToggleSwitchProps) {
    return (
        <div className="py-2">
            <button
                type="button"
                id={id}
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={cn(
                    "group w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                    "hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    checked
                        ? "bg-primary/5 border-primary/30"
                        : "bg-white border-gray-200",
                    error && "border-red-300 bg-red-50",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
            >
                {/* Switch */}
                <div
                    className={cn(
                        "relative w-14 h-8 rounded-full transition-all duration-300 shrink-0",
                        checked
                            ? "bg-gradient-to-r from-primary to-secondary"
                            : "bg-gray-300"
                    )}
                >
                    {/* Knob */}
                    <div
                        className={cn(
                            "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                            "flex items-center justify-center",
                            checked ? "left-7" : "left-1"
                        )}
                    >
                        {/* Icon inside knob */}
                        {checked ? (
                            <svg
                                className="w-3.5 h-3.5 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-3 h-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Label et description */}
                <div className="flex-1 text-left">
                    <p className={cn(
                        "font-medium transition-colors",
                        checked ? "text-gray-900" : "text-gray-700"
                    )}>
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {description && (
                        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    )}
                </div>

                {/* Badge Oui/Non */}
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    checked
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                )}>
                    {checked ? "Oui" : "Non"}
                </div>
            </button>

            {/* Message d'erreur */}
            {error && (
                <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
            )}
        </div>
    );
}
