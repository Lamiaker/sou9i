import { Search } from "lucide-react";

export default function SearchBarre() {
  return (
   
    <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white max-w-lg w-full  ">
      <input
        type="text"
        placeholder="Que recherchez-vous ?"
     
        className="flex-1 px-5 py-2.5 outline-none text-sm placeholder-gray-500 bg-transparent"
      />

      {/* Le bouton de recherche */}
      <button
        type="button"
 
        className="flex items-center justify-center h-9 w-9 rounded-xl bg-secondary hover:bg-primary text-white mr-1.5 hover:bg-opacity-90 transition-colors"
      >
        <Search size={18} />
      </button>
    </div>
  );
}