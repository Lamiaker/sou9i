"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

// Composant interne qui utilise useSearchParams
function SearchBarInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const router = useRouter();

  useEffect(() => {
    // Synchronize with URL params - intentional setState in effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams?.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white max-w-lg w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Que recherchez-vous ?"
        className="flex-1 px-5 py-2.5 outline-none text-sm placeholder-gray-500 bg-transparent"
      />

      <button
        type="submit"
        className="flex items-center justify-center h-9 w-9 rounded-xl bg-secondary hover:bg-primary text-white mr-1.5 hover:bg-opacity-90 transition-colors"
      >
        <Search size={18} />
      </button>
    </form>
  );
}

// Skeleton pour le chargement
function SearchBarSkeleton() {
  return (
    <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white max-w-lg w-full animate-pulse">
      <div className="flex-1 px-5 py-2.5">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="h-9 w-9 rounded-xl bg-gray-200 mr-1.5"></div>
    </div>
  );
}

/**
 * SearchBar avec Suspense boundary
 * Permet le prerendering statique (ISR/SSG) des pages parentes
 */
export default function SearchBar() {
  return (
    <Suspense fallback={<SearchBarSkeleton />}>
      <SearchBarInner />
    </Suspense>
  );
}