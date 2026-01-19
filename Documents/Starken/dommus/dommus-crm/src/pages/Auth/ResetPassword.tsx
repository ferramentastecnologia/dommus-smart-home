import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { supabase } from "@/services/supabase/config";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Verify that we're in a password reset context
  useEffect(() => {
    const checkResetSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast.error("Invalid or expired password reset link. Please try again.");
        navigate("/forgot-password");
      }
    };
    
    checkResetSession();
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      setIsSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-8 py-10 flex flex-col items-center bg-white rounded-xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/lovable-uploads/79c3078a-1c1d-4ddf-aa27-23602c209727.png" 
            alt="Profortuna Group Logo" 
            className="h-32 mb-4" 
          />
          <div className="text-2xl font-semibold text-green-700">CRM System</div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Create New Password</h1>
        
        {!isSuccess ? (
          <>
            <p className="text-gray-600 mb-8 text-center">
              Please enter your new password below.
            </p>
            
            <form onSubmit={handlePasswordReset} className="w-full space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-gray-700 font-medium block">New Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password..."
                    className="profortuna-input border-green-200 focus:border-green-400 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-gray-700 font-medium block">Confirm New Password</label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password..."
                    className="profortuna-input border-green-200 focus:border-green-400 pr-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full h-12"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 mb-6">
              <p className="font-medium">Password Updated!</p>
              <p className="text-sm mt-1">
                Your password has been successfully updated. You will be redirected to the login page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 