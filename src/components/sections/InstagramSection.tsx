import { Instagram, Loader2 } from "lucide-react";
import { Carousel3D, CarouselItem } from "@/components/ui/carousel-3d";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

const InstagramSection = () => {
    const { data, loading } = useInstagramPosts();

    // Fallback enquanto carrega
    if (loading || !data) {
        return (
            <section className="py-20 bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
                <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </section>
        );
    }

    const carouselItems: CarouselItem[] = data.posts.map(post => ({
        id: post.id,
        imageUrl: post.imageUrl,
        type: post.type,
        caption: post.caption,
        permalink: post.permalink,
    }));

    return (
        <section className="py-20 bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-4">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            @{data.instagramHandle}
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

                {/* 3D Carousel */}
                <div className="max-w-6xl mx-auto">
                    <Carousel3D
                        items={carouselItems}
                        autoRotateSpeed={5000}
                        radius={450}
                    />
                </div>

                {/* CTA Button */}
                <div className="text-center mt-10">
                    <a
                        href={data.profileUrl}
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
