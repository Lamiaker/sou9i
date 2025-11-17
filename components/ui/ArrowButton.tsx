import React from "react";

type ArrowButtonProps = {
  direction?: "left" | "right";      // Sens de la flèche
  onClick?: () => void;              // Action au clic
  className?: string;                // Classes Tailwind pour position ou style
  ariaLabel?: string;                // Accessibilité
};

export default function ArrowButton({
  direction = "right",
  onClick,
  className = "",
  ariaLabel,
}: ArrowButtonProps) {

  const isLeft = direction === "left";

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || (isLeft ? "Previous" : "Next")}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 
                  w-10 h-10 items-center justify-center cursor-pointer
                   rounded-full shadow-lg border border-gray-200 
                   bg-white/90 hover:bg-white transition ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={isLeft ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}
