import { TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ParallaxSection from "@/components/ui/ParallaxSection";

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 bg-card relative overflow-hidden">
      {/* Animated glow with parallax */}
      <ParallaxSection speed={0.15} direction="down" className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-medium uppercase tracking-wider">Sobre nós</span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <ParallaxSection speed={0.05}>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
                Projetamos experiências
                <span className="text-gradient"> inteligentes.</span>
              </h2>
            </ParallaxSection>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="space-y-6 text-base md:text-lg text-muted-foreground">
              <p>
                A <strong className="text-foreground">Dommus Smart Home</strong> projeta e executa soluções completas em automação, áudio, vídeo e infraestrutura tecnológica para residências e empresas de alto padrão.
              </p>
              
              <p>
                Unimos conhecimento técnico profundo com execução impecável — do planejamento à entrega final.
              </p>
            </div>
          </ScrollReveal>

          {/* Stats with LED effects and animated counters */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16">
              <div className="text-center group">
                <div className="relative inline-block">
                  <AnimatedCounter 
                    end={12} 
                    suffix="+" 
                    className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-2"
                    duration={2000}
                  />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full led-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Anos</div>
              </div>
              <div className="text-center group">
                <div className="relative inline-block">
                  <AnimatedCounter 
                    end={500} 
                    suffix="+" 
                    className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-2"
                    duration={2500}
                  />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full led-pulse opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '0.5s' }} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Projetos</div>
              </div>
              <div className="text-center group">
                <div className="relative inline-block">
                  <AnimatedCounter 
                    end={100} 
                    suffix="%" 
                    className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-2"
                    duration={2200}
                  />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full led-pulse opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '1s' }} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Satisfação</div>
              </div>
              <div className="text-center group">
                <div className="relative inline-block">
                  <div className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-2">SC</div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full led-pulse opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '1.5s' }} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Região</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Section divider */}
      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
};

export default AboutSection;
