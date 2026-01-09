import { Film, Volume2, Wifi, Home, Shield, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ParallaxSection from "@/components/ui/ParallaxSection";

const services = [
  {
    icon: Film,
    title: "Home Theater & Cinema",
    description: "Experiências cinematográficas imersivas com áudio e vídeo de alta performance."
  },
  {
    icon: Volume2,
    title: "Som Ambiente Inteligente",
    description: "Sonorização distribuída que se adapta a cada ambiente automaticamente."
  },
  {
    icon: Wifi,
    title: "Wi-Fi de Alta Performance",
    description: "Cobertura total e estável em cada canto da sua casa ou empresa."
  },
  {
    icon: Home,
    title: "Automação Completa",
    description: "Iluminação, som, clima e cortinas. Tudo em um toque ou comando de voz."
  },
  {
    icon: Shield,
    title: "Segurança Integrada",
    description: "Câmeras, sensores e controle de acesso conectados à sua rotina."
  },
  {
    icon: Wrench,
    title: "Infraestrutura Preparada",
    description: "Planejamento técnico desde a obra para o presente e o futuro."
  }
];

const SolutionsSection = () => {
  return (
    <section id="solucoes" className="py-24 bg-background relative overflow-hidden">
      {/* Animated glow effects with parallax */}
      <ParallaxSection speed={0.12} direction="down" className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 animate-pulse-glow pointer-events-none" />
      <ParallaxSection speed={0.08} direction="up" className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <ScrollReveal animation="fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary rounded-full led-pulse" />
              <span className="text-xs text-primary font-medium uppercase tracking-wider">Soluções</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Tecnologia que funciona
              <span className="text-gradient block">do jeito que você quer.</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ScrollReveal key={service.title} animation="fade-up" delay={index * 100 + 200}>
              <div
                className={cn(
                  "group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 h-full",
                  "hover:border-primary/50 hover:shadow-card-hover transition-all duration-500",
                  "card-glow"
                )}
              >
                {/* Icon with smart home effect */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:shadow-glow transition-all duration-300 relative smart-icon">
                  <service.icon className="w-7 h-7 text-primary group-hover:animate-icon-bounce" />
                  {/* LED indicator */}
                  <div className="absolute top-1 right-1 w-2 h-2 bg-primary/50 rounded-full led-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3 group-hover:text-gradient transition-all duration-300">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {service.description}
                </p>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
