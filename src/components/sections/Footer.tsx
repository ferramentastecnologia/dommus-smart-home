import { Instagram, MessageCircle, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo & Info */}
          <div className="text-center md:text-left">
            <a href="#" className="inline-block mb-3">
              <img
                src="/Logo_Dommus branco e roxo .png"
                alt="Dommus Smart Home"
                className="h-10 md:h-12 w-auto mx-auto md:mx-0"
              />
            </a>
            <p className="text-muted-foreground text-sm">
              Automação • Áudio • Vídeo • Infraestrutura
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a
              href="https://instagram.com/dommus.smarthome"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-glow transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="text-sm hidden sm:inline">@dommus.smarthome</span>
            </a>

            <a
              href="https://wa.me/5547920565215"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-glow transition-all duration-300">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm hidden sm:inline">WhatsApp</span>
            </a>

            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm">SC – Brasil</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dommus Smart Home. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;