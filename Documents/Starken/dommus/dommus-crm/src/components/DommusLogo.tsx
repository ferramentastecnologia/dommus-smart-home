import React from "react";

interface DommusLogoProps {
  className?: string;
}

export function DommusLogo({ className = "" }: DommusLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Dommus Smart Home"
      className={className}
    />
  );
}
