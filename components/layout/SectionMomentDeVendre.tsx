
 interface SectionMomentDeVendreProps {
  title: string;
  description?: string;
  buttonText: string;
}
export function SectionMomentDeVendre({ title, description, buttonText }: SectionMomentDeVendreProps) {
  return (
    <section className="w-full mb-8 ">
      <div className="bg-orange-50 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600 text-sm">{description}</p>
          )}
        </div>
        <button className="px-8 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-primary transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          {buttonText}
        </button>
      </div>
    </section>
  );
}