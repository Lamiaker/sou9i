import { Search } from "lucide-react";

export default function SearchBarre() {
  return (
    <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
      <input
        type="text"
        placeholder="Que recherchez-vous ?"
        className="flex-1 px-4 py-2 outline-none text-sm"
      />
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-full transition flex items-center gap-2">
        <Search size={18} />
        <span className="hidden sm:inline">Rechercher</span>
      </button>
    </div>
  );
}
