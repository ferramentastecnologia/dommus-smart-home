import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-home-theater.jpg";
import heroImageGlow from "@/assets/hero-home-theater-glow.png";
import heroImageGlowLight from "@/assets/hero-home-theater-glow-light.png";
import { useState, useMemo } from "react";
import ParallaxSection from "@/components/ui/ParallaxSection";
import { getWhatsAppLink } from "@/lib/utils";

const HeroSection = () => {
  const [lightOn, setLightOn] = useState(false);
  const [tvGlowOn, setTvGlowOn] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [climaOn, setClimaOn] = useState(false);

  // Determina qual imagem usar baseado no estado
  const currentImage = useMemo(() => {
    if (tvGlowOn && lightOn) return heroImageGlowLight;
    if (tvGlowOn) return heroImageGlow;
    return heroImage;
  }, [tvGlowOn, lightOn]);

  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Background Image with Overlay - crossfade suave */}
    <div className="absolute inset-0">
      {/* Imagens empilhadas para transição suave */}
      {/* Base: nenhum ligado */}
      <img
        src={heroImageGlow}
        alt="Home theater"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${!tvGlowOn && !lightOn ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Só Luz */}
      <img
        src={heroImage}
        alt="Home theater com luz"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${!tvGlowOn && lightOn ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Só Vídeo */}
      <img
        src={heroImageGlow}
        alt="Home theater com TV ligada"
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out saturate-[1.4] brightness-110 contrast-110 ${tvGlowOn && !lightOn ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Vídeo + Luz */}
      <img
        src={heroImageGlowLight}
        alt="Home theater com TV e luz ligadas"
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out saturate-[1.4] brightness-110 contrast-110 ${tvGlowOn && lightOn ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Gradients - Dynamic based on state */}
      {/* Vertical gradient: Lighter when Light is ON, Medium when Video is ON, Dark when OFF */}
      <div className={`absolute inset-0 transition-all duration-1000 ${lightOn
        ? 'bg-gradient-to-b from-primary/5 via-amber-500/5 to-background'
        : tvGlowOn
          ? 'bg-gradient-to-b from-background/60 via-background/40 to-background'
          : 'bg-gradient-to-b from-background/90 via-background/70 to-background'
        }`} />

      {/* Horizontal gradient: Lighter when Video or Light is ON */}
      <div className={`absolute inset-0 bg-gradient-to-r via-transparent to-background transition-all duration-1000 ${tvGlowOn || lightOn
        ? 'from-background/60 to-background/60'
        : 'from-background/95 to-background/95'
        }`} />

      {/* Light effect overlay - Reduced intensity */}
      <div className={`absolute inset-0 transition-all duration-1000 ${lightOn ? 'bg-gradient-radial from-amber-400/10 via-transparent to-transparent opacity-100' : 'opacity-0'}`} />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 animated-gradient-bg opacity-10" />
    </div>

    {/* Sound waves effect */}
    {soundOn && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {[1, 2, 3].map(i => <div key={i} className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping" style={{
        width: `${200 + i * 100}px`,
        height: `${200 + i * 100}px`,
        marginLeft: `-${100 + i * 50}px`,
        marginTop: `-${100 + i * 50}px`,
        animationDelay: `${i * 0.3}s`,
        animationDuration: '2s'
      }} />)}
    </div>}

    {/* Climate effect - subtle particles */}
    {climaOn && <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => <div key={i} className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-float" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 2}s`
      }} />)}
    </div>}

    {/* Multiple Glow Effects with parallax */}
    <ParallaxSection speed={0.15} direction="up" className={`absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse-glow transition-all duration-1000 pointer-events-none ${lightOn ? 'bg-amber-400/40' : 'bg-primary/20'}`} />
    <ParallaxSection speed={0.1} direction="down" className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-accent/15 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
    <ParallaxSection speed={0.08} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl animate-glow-pulse pointer-events-none" />

    {/* Content */}
    <div className="relative z-10 container mx-auto px-4 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Smart home indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 animate-fade-in-up backdrop-blur-sm">
          <span className="w-2 h-2 bg-primary rounded-full led-pulse" />
          <span className="text-sm text-primary font-medium tracking-wide">Casa inteligente em funcionamento</span>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up animation-delay-100 leading-tight">
          Sua casa,
          <span className="text-gradient block mt-2 glow-text">inteligente de verdade.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed">
          Transformamos o seu espaço em um ambiente inteligente e conectado.
        </p>


        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
          <Button variant="hero" size="lg" asChild>
            <a href={getWhatsAppLink("heroSolicitarProjeto")} target="_blank" rel="noopener noreferrer">Solicitar projeto</a>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <a href={getWhatsAppLink("heroFalarEspecialista")} target="_blank" rel="noopener noreferrer">Falar com especialista</a>
          </Button>
        </div>

        {/* Smart home icons indicator - INTERACTIVE */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-10 md:mt-16 animate-fade-in-up animation-delay-400">
          {/* Vídeo */}
          <button
            onClick={() => setTvGlowOn(!tvGlowOn)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer group ${tvGlowOn ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${tvGlowOn ? 'bg-primary/30 shadow-lg shadow-primary/50' : 'bg-primary/10'} md:group-hover:scale-110`}>
              <svg className={`w-6 h-6 transition-all duration-500 ${tvGlowOn ? 'text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-primary'}`} fill={tvGlowOn ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`text-xs transition-colors duration-300 ${tvGlowOn ? 'text-primary' : 'text-muted-foreground'}`}>Vídeo</span>
          </button>

          {/* Luz */}
          <button onClick={() => setLightOn(!lightOn)} className={`flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer group ${lightOn ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${lightOn ? 'bg-amber-400/30 shadow-lg shadow-amber-400/50' : 'bg-primary/10'} md:group-hover:scale-110`}>
              <svg className={`w-6 h-6 transition-all duration-500 ${lightOn ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-primary'}`} fill={lightOn ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className={`text-xs transition-colors duration-300 ${lightOn ? 'text-amber-400' : 'text-muted-foreground'}`}>Luz</span>
          </button>

          {/* Som */}
          <button onClick={() => setSoundOn(!soundOn)} className={`flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer group ${soundOn ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${soundOn ? 'bg-primary/30 shadow-lg shadow-primary/50' : 'bg-primary/10'} md:group-hover:scale-110`}>
              <svg className={`w-6 h-6 transition-all duration-500 ${soundOn ? 'text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
              </svg>
            </div>
            <span className={`text-xs transition-colors duration-300 ${soundOn ? 'text-primary' : 'text-muted-foreground'}`}>Som</span>
          </button>

          {/* Clima */}
          <button onClick={() => setClimaOn(!climaOn)} className={`flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer group ${climaOn ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${climaOn ? 'bg-blue-400/30 shadow-lg shadow-blue-400/50' : 'bg-primary/10'} md:group-hover:scale-110`}>
              <svg className={`w-6 h-6 transition-all duration-500 ${climaOn ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            </div>
            <span className={`text-xs transition-colors duration-300 ${climaOn ? 'text-blue-400' : 'text-muted-foreground'}`}>Clima</span>
          </button>
        </div>
      </div>
    </div>
  </section>;
};
export default HeroSection;
