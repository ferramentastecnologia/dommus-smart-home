
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string | null;
}

export function ErrorState({ error }: ErrorStateProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Lead Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || "The requested lead does not exist or has been removed."}</p>
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
          onClick={() => navigate("/leads")}
        >
          Back to Leads
        </Button>
      </div>
    </div>
  );
}
