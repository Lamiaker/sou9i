// components/ui/MenuButton.tsx
import { LucideIcon } from "lucide-react";

interface MenuButtonProps {
  icon: LucideIcon;
  text: string;
  hasBorder?: boolean;
  onClick?: () => void;
}

export default function MenuButton({ 
  icon: Icon, 
  text, 
  hasBorder = false,
  onClick 
}: MenuButtonProps) {
  return (
    <button 
      className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition text-left cursor-pointer ${
        hasBorder ? "border-b border-gray-500" : ""
      }`}
      onClick={onClick}
    >
      
      <div className="w-5 h-5 flex items-center justify-center">
        <Icon size={20} className="text-gray-700" strokeWidth={2} />
      </div>
      <span className="text-gray-700 font-bold">{text}</span>
    </button>
  );
}