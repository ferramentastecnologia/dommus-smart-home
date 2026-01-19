import React from 'react';

export function ProFortunaLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/profortuna-logo.png" 
        alt="ProFortuna Group" 
        className="w-[160px] h-auto"
      />
    </div>
  );
}

export default ProFortunaLogo; 