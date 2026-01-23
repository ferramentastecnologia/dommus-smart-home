import React, { useState } from "react";
import { Eye, EyeOff, Home, Lightbulb, Tv, Thermometer, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
      toast.error("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(email, password, name);
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Falha no cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animated-gradient-bg opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl animate-glow-pulse" />
      </div>

      {/* Smart home floating icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] opacity-20 animate-float" style={{ animationDelay: '0s' }}>
          <Home className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute top-[25%] right-[15%] opacity-20 animate-float" style={{ animationDelay: '1s' }}>
          <Lightbulb className="w-6 h-6 text-accent" />
        </div>
        <div className="absolute bottom-[30%] left-[15%] opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          <Tv className="w-7 h-7 text-primary" />
        </div>
        <div className="absolute bottom-[20%] right-[10%] opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>
          <Thermometer className="w-6 h-6 text-accent" />
        </div>
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo-dommus.png"
              alt="Dommus Smart Home"
              className="h-14 mb-3 animate-fade-in"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <UserPlus className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary font-medium">Criar Conta</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-foreground/80 text-sm font-medium block">
                Nome
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className={cn(
                  "bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground",
                  "focus:border-primary focus:ring-primary/20 transition-all duration-300",
                  "h-11 rounded-lg"
                )}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-foreground/80 text-sm font-medium block">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={cn(
                  "bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground",
                  "focus:border-primary focus:ring-primary/20 transition-all duration-300",
                  "h-11 rounded-lg"
                )}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-foreground/80 text-sm font-medium block">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground",
                    "focus:border-primary focus:ring-primary/20 transition-all duration-300",
                    "h-11 rounded-lg pr-12"
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-foreground/80 text-sm font-medium block">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground",
                  "focus:border-primary focus:ring-primary/20 transition-all duration-300",
                  "h-11 rounded-lg"
                )}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full h-11 rounded-lg font-semibold text-base mt-2",
                "bg-gradient-to-r from-primary to-accent hover:opacity-90",
                "shadow-lg shadow-primary/25 hover:shadow-primary/40",
                "transition-all duration-300"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </div>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border/50 text-center">
            <p className="text-muted-foreground text-sm">
              Já tem uma conta?{" "}
              <a
                href="/login"
                className="text-primary hover:text-accent font-medium transition-colors"
              >
                Entrar
              </a>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-muted-foreground/50 text-xs mt-6 animate-fade-in animation-delay-300">
          Dommus Smart Home © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
