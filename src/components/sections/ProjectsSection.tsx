import ScrollReveal from "@/components/ui/ScrollReveal";
import { useEffect } from "react";

const projects = [
  {
    permalink: "https://www.instagram.com/reel/Cnut9XhBV-t/",
    title: "Residências de Alto Padrão",
    description: "Automação completa com controle integrado"
  },
  {
    permalink: "https://www.instagram.com/reel/Cnp8aqMhnC9/",
    title: "Academia Duifit",
    description: "Sonorização profissional completa"
  },
  {
    permalink: "https://www.instagram.com/reel/Cki2Ci4JiGz/",
    title: "Ambientes Corporativos",
    description: "Soluções audiovisuais integradas"
  }
];

const ProjectsSection = () => {
  useEffect(() => {
    // Process Instagram embeds
    if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }, []);

  return (
    <section id="projetos" className="py-24 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <ScrollReveal animation="fade-up">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Cada projeto é único.
              <span className="text-gradient block">Cada detalhe importa.</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ScrollReveal key={project.title} animation="scale-in" delay={index * 150}>
              <div className="text-center">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                <div className="flex justify-center">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={project.permalink}
                    data-instgrm-version="14"
                    style={{
                      background: "#FFF",
                      border: "0",
                      borderRadius: "12px",
                      margin: "0",
                      maxWidth: "400px",
                      minWidth: "280px",
                      width: "100%",
                    }}
                  />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
};

export default ProjectsSection;
