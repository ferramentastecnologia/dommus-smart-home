import React from "react";

interface DommusLogoProps {
  className?: string;
}

const BASE_URL = import.meta.env.BASE_URL || "/";

export function DommusLogo({ className = "" }: DommusLogoProps) {
  return (
    <img
      src={`${BASE_URL}logo.png`}
      alt="Dommus Smart Home"
      className={className}
    />
  );
}
