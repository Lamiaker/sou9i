"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBarre() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const router = useRouter();

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
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