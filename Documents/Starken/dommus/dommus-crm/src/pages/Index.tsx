import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database } from "lucide-react";
import { setupFirestore } from "@/utils/firestoreSetup";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  
  const handleSetupDatabase = async () => {
    try {
      toast.info("Setting up database...");
      const result = await setupFirestore();
      if (result.success) {
        toast.success("Database configured successfully!");
      }
    } catch (error) {
      console.error("Error setting up database:", error);
      toast.error("Failed to configure database");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Welcome to CRM Cloud
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        Manage your customer relationships efficiently with our platform.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        <Button 
          size="lg"
          onClick={() => navigate("/simple-dashboard")}
          className="flex items-center justify-center gap-2"
        >
          Go to Dashboard <ArrowRight size={18} />
        </Button>
        
        <Button 
          variant="outline"
          size="lg"
          onClick={handleSetupDatabase}
          className="flex items-center justify-center gap-2"
        >
          Setup Database <Database size={18} />
        </Button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8L22 12L18 16M6 16L2 12L6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Agile System</h2>
          <p className="text-muted-foreground text-center">
            Intuitive interface that makes lead and task management easy
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Detailed Analytics</h2>
          <p className="text-muted-foreground text-center">
            Get valuable insights about your sales team's performance
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Contact Management</h2>
          <p className="text-muted-foreground text-center">
            Organize your leads and maintain a complete interaction history
          </p>
        </div>
      </div>
    </div>
  );
}
