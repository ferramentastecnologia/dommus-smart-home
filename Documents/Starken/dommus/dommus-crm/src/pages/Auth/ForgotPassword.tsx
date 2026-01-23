import React, { useState } from "react";
import { resetPassword } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Lightbulb, Tv, Thermometer, Mail, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Digite seu email");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
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

      {/* Card */}
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
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary font-medium">Recuperar Senha</span>
            </div>
          </div>

          {!isSubmitted ? (
            <>
              <p className="text-muted-foreground text-sm text-center mb-6">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-5">
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
                      "h-12 rounded-lg"
                    )}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-12 rounded-lg font-semibold text-base",
                    "bg-gradient-to-r from-primary to-accent hover:opacity-90",
                    "shadow-lg shadow-primary/25 hover:shadow-primary/40",
                    "transition-all duration-300"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    "Enviar Link"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Email enviado!</h3>
              <p className="text-muted-foreground text-sm">
                Enviamos um link de recuperação para{" "}
                <span className="text-primary font-medium">{email}</span>.
                Verifique sua caixa de entrada.
              </p>
              <p className="text-muted-foreground/70 text-xs">
                Não recebeu? Verifique a pasta de spam.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
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
