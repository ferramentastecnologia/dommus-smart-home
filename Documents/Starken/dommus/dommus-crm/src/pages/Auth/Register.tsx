import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ProFortunaLogo } from "@/components/ProFortunaLogo";
import { cn } from "@/lib/utils";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
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
      await registerUser(email, password, name);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-8 py-10 flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <ProFortunaLogo className="h-32 mb-4" />
          <div className="text-xl font-semibold text-profortuna-teal dark:text-profortuna-teal-light">CRM System</div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">Create Account</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Complete the form below to create your account.</p>
        
        <form onSubmit={handleRegister} className="w-full space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium block">Name</label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name here..."
                className={cn(
                  "profortuna-input border-profortuna-teal-light/30 focus:border-profortuna-teal",
                  "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                )}
                disabled={isLoading}
              />
            </div>
          </div>

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
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium block">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password here..."
                className={cn(
                  "profortuna-input border-profortuna-teal-light/30 focus:border-profortuna-teal pr-10",
                  "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium block">Confirm password</label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password..."
                className={cn(
                  "profortuna-input border-profortuna-teal-light/30 focus:border-profortuna-teal pr-10",
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
            {isLoading ? "Registering..." : "Create Account"}
          </Button>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-profortuna-teal hover:text-profortuna-blue dark:text-profortuna-teal-light dark:hover:text-profortuna-blue-light font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
