export default function ListeCategorices() {
  const categories = [
    "Immobilier",
    "Véhicules",
    "Emploi",
    "Mode",
    "Maison",
    "Multimédia",
    "Loisirs",
    "Services",
  ];

  return (
    <nav className="w-full bg-gray-50 border-t border-gray-200">
      <ul className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 py-3 text-sm font-medium text-gray-700">
        {categories.map((cat, index) => (
          <li
            key={index}
            className="cursor-pointer hover:text-orange-500 transition"
          >
            {cat}
          </li>
        ))}
      </ul>
    </nav>
  );
}
