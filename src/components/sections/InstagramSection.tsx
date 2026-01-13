import { Instagram } from "lucide-react";
import { useEffect } from "react";

const instagramPosts = [
    "https://www.instagram.com/reel/DSkzvKBgcBj/",
    "https://www.instagram.com/reel/DQ5W1DeAXIa/",
    "https://www.instagram.com/p/CmaQJwuL7QS/",
    "https://www.instagram.com/reel/DEXgP2mpQQd/",
    "https://www.instagram.com/reel/C7hvsQTpPKS/",
    "https://www.instagram.com/p/Cs6J7Nbrge8/",
];

const InstagramSection = () => {
    useEffect(() => {
        // Load Instagram embed script
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);

        // Process embeds when script loads
        script.onload = () => {
            if ((window as any).instgrm) {
                (window as any).instgrm.Embeds.process();
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-4">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            @dommus.smarthome
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Acompanhe Nossos{" "}
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                            Projetos
                        </span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Veja nossos últimos projetos e inspire-se com soluções de automação residencial de alto padrão.
                    </p>
                </div>

                {/* Posts Grid with Embeds */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {instagramPosts.map((postUrl, index) => (
                        <div key={index} className="flex justify-center">
                            <blockquote
                                className="instagram-media"
                                data-instgrm-captioned
                                data-instgrm-permalink={postUrl}
                                data-instgrm-version="14"
                                style={{
                                    background: "#FFF",
                                    border: "0",
                                    borderRadius: "12px",
                                    margin: "0",
                                    maxWidth: "540px",
                                    minWidth: "280px",
                                    width: "100%",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="text-center mt-10">
                    <a
                        href="https://www.instagram.com/dommus.smarthome/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
                    >
                        <Instagram className="w-5 h-5" />
                        Siga-nos no Instagram
                    </a>
                </div>
            </div>
        </section>
    );
};

export default InstagramSection;
