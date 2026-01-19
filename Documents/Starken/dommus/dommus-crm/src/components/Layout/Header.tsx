import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProFortunaLogo } from "@/components/ProFortunaLogo";

export function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 py-3 px-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="lg:w-64 flex items-center">
          <div className="w-36 lg:hidden p-2 bg-transparent rounded-md">
            <ProFortunaLogo className="w-full h-auto" />
          </div>
        </div>
        
        {/* Search bar removed as it's not being used */}
        
        <div className="flex items-center space-x-4 ml-auto">
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary hover:bg-primary/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
