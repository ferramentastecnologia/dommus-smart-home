import React, { useState } from "react";
import { resetPassword } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProFortunaLogo } from "@/components/ProFortunaLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      // Error message is handled by the resetPassword function
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-8 py-10 flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <ProFortunaLogo className="h-32 mb-4" />
          <div className="text-xl font-semibold text-profortuna-teal dark:text-profortuna-teal-light">CRM System</div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Reset Password</h1>
        
        {!isSubmitted ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleResetPassword} className="w-full space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium block">Email</label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email here..."
                    className={cn(
                      "profortuna-input border-profortuna-teal-light/30 focus:border-profortuna-teal",
                      "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                    )}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-profortuna-teal hover:bg-profortuna-blue text-white font-semibold rounded-full h-12"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg border border-green-200 dark:border-green-900 mb-6">
              <p className="font-medium">Reset link sent!</p>
              <p className="text-sm mt-1">
                We've sent a password reset link to <span className="font-semibold">{email}</span>.
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
        )}
        
        <div className="mt-8">
          <Button
            type="button"
            variant="ghost"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
} 