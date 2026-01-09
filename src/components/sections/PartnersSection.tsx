import { Button } from "@/components/ui/button";
import { ArrowRight, Handshake } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const PartnersSection = () => {
  return (
    <section id="parceiros" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative animated elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="scale-in">
            <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl p-8 md:p-12 border border-border/50 relative overflow-hidden hover:border-primary/30 transition-all duration-500">
              {/* Inner glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-glow" />

              <div className="relative z-10">
                <ScrollReveal animation="fade-up">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
                    <Handshake className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">Parceiros</span>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={100}>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Tecnologia que valoriza
                    <span className="text-gradient"> a arquitetura.</span>
                  </h2>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={200}>
                  <div className="space-y-4 text-base md:text-lg text-muted-foreground mb-8">
                    <p>
                      Trabalhamos lado a lado com arquitetos e construtoras, oferecendo suporte técnico completo e soluções que agregam valor estético e funcional às obras.
                    </p>
                    <p>
                      Cada projeto é uma nova oportunidade de criar algo único.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={300}>
                  <Button variant="premium" size="lg" className="group" asChild>
                    <a href="#contato">
                      Quero ser parceiro
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
