// components/ui/IconButtonWithLabel.tsx
import { LucideIcon } from "lucide-react";

interface IconButtonWithLabelProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export default function IconButtonWithLabel({ 
  icon: Icon, 
  label, 
  onClick 
}: IconButtonWithLabelProps) {
  return (
    <button 
      className="flex flex-col items-center group cursor-pointer"
      onClick={onClick}
    >
      <Icon size={22} />
      <span className="relative text-xs font-medium mt-1">
        {label}
        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-secondary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
      </span>
    </button>
  );
}