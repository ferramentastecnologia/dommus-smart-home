import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getWhatsAppLink } from "@/lib/utils";

const CTASection = () => {
  return (
    <section id="contato" className="py-24 bg-card relative overflow-hidden">
      {/* Animated glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal animation="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary rounded-full led-pulse" />
              <span className="text-sm text-primary font-medium">Pronto para começar?</span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Vamos transformar seu
              <span className="text-gradient block mt-2 glow-text">espaço em tecnologia.</span>
            </h2>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-base md:text-lg text-muted-foreground mb-10">
              Fale com nossa equipe e descubra a solução ideal para você.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group" asChild>
                <a href={getWhatsAppLink("ctaFalarWhatsapp")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar via WhatsApp
                </a>
              </Button>
              <Button variant="heroOutline" size="lg" className="group" asChild>
                <a href={getWhatsAppLink("ctaVerSolucoes")} target="_blank" rel="noopener noreferrer">
                  Ver soluções
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
