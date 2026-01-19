
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AccessDeniedCard() {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Restricted Access</CardTitle>
          <CardDescription>This page is accessible only to administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
