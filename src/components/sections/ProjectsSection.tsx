import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LazyImage from "@/components/ui/LazyImage";
import instagramData from "@/data/instagramPosts.json";

const projects = [
  {
    image: instagramData.projectPosts[0].imageUrl,
    permalink: instagramData.projectPosts[0].permalink,
    title: "Residências de Alto Padrão",
    description: "Automação completa com controle integrado"
  },
  {
    image: instagramData.projectPosts[1].imageUrl,
    permalink: instagramData.projectPosts[1].permalink,
    title: "Ambientes Corporativos",
    description: "Auditórios e salas de reunião inteligentes"
  },
  {
    image: instagramData.projectPosts[2].imageUrl,
    permalink: instagramData.projectPosts[2].permalink,
    title: "Home Theaters",
    description: "Experiência cinematográfica em casa"
  }
];

const ProjectsSection = () => {
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
              <a
                href={project.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group relative rounded-2xl overflow-hidden cursor-pointer block"
                )}
              >
                {/* Lazy loaded image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <LazyImage
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-1 group-hover:text-gradient transition-all duration-300">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-all duration-300" />
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
};

export default ProjectsSection;
