"use client";

import React, { Component, ErrorInfo, ReactNode, ReactElement } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary React réutilisable
 * Capture les erreurs dans les composants enfants
 * et affiche un fallback user-friendly
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log l'erreur (uniquement côté serveur ou en dev)
        if (process.env.NODE_ENV === "development") {
            console.error("ErrorBoundary caught:", error, errorInfo);
        }

        // Callback optionnel pour tracking
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Si un fallback personnalisé est fourni, l'utiliser
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Fallback par défaut
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Une erreur est survenue
                    </h3>
                    <p className="text-sm text-red-600 mb-4">
                        Ce composant n'a pas pu se charger correctement.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Réessayer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC pour wrapper un composant avec ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
): React.FC<P> {
    const WithErrorBoundary: React.FC<P> = (props) => (
        <ErrorBoundary fallback={fallback}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

    return WithErrorBoundary;
}

/**
 * Composant ErrorBoundary léger pour les sections non-critiques
 * Affiche simplement un message minimaliste en cas d'erreur
 */
export function SectionErrorBoundary({
    children,
    sectionName = "Cette section",
}: {
    children: ReactNode;
    sectionName?: string;
}): ReactElement {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-center text-sm text-slate-500">
                    {sectionName} n'a pas pu être chargée.
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
