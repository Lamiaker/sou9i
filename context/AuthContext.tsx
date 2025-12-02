"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simuler la vérification de session au chargement
    useEffect(() => {
        const storedUser = localStorage.getItem("user_session");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Erreur parsing session", e);
                localStorage.removeItem("user_session");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock user data
        const mockUser: User = {
            id: "u1",
            name: "Amine Tounsi",
            email: email,
            phone: "0550123456",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amine",
            location: "Alger",
            memberSince: "Décembre 2024",
            verified: true
        };

        setUser(mockUser);
        localStorage.setItem("user_session", JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user_session");
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
