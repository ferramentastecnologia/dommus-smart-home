import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ParallaxSection from "@/components/ui/ParallaxSection";

const differentials = [
  "Experiência técnica de +12 anos",
  "Projetos 100% personalizados",
  "Suporte residencial e corporativo",
  "Parceria com arquitetos",
  "Planejamento desde a obra",
  "Equipamentos profissionais",
  "Do projeto à instalação"
];

const DifferentialsSection = () => {
  return (
    <section id="diferenciais" className="py-24 bg-card relative overflow-hidden">
      {/* Animated Glow with parallax */}
      <ParallaxSection speed={0.1} direction="down" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal animation="fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium uppercase tracking-wider">Diferenciais</span>
              </div>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={100}>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Por que a <span className="text-gradient">Dommus?</span>
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {differentials.map((item, index) => (
              <ScrollReveal key={item} animation="fade-up" delay={index * 80 + 150}>
                <div
                  className={cn(
                    "group flex items-center gap-4 p-5 md:p-6 bg-background/50 backdrop-blur-sm rounded-xl",
                    "border border-border/30 hover:border-primary/40 transition-all duration-300",
                    "hover:shadow-glow"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 group-hover:shadow-glow transition-all duration-300 relative">
                    <Check className="w-5 h-5 text-primary" />
                    {/* LED effect on hover */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 led-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-foreground font-medium text-sm md:text-base">{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
};

export default DifferentialsSection;
