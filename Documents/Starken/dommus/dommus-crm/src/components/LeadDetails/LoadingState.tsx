
import React from "react";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="text-muted-foreground mt-4">Carregando informações do lead...</p>
      </div>
    </div>
  );
}
