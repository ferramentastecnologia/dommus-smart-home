import { Instagram, ExternalLink } from "lucide-react";
import instagramData from "@/data/instagramPosts.json";

interface InstagramPost {
    id: string;
    imageUrl: string;
    caption: string;
    permalink: string;
    timestamp: string;
}

const InstagramSection = () => {
    const posts: InstagramPost[] = instagramData.posts;

    return (
        <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-4">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            @{instagramData.instagramHandle}
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

                {/* Posts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
                    {posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square overflow-hidden rounded-xl bg-secondary/50"
                        >
                            {/* Image */}
                            <img
                                src={post.imageUrl}
                                alt={post.caption}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                {/* Caption */}
                                <p className="text-white text-sm line-clamp-2">
                                    {post.caption}
                                </p>

                                {/* External Link Icon */}
                                <div className="absolute top-4 right-4">
                                    <ExternalLink className="w-5 h-5 text-white drop-shadow-lg" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="text-center mt-10">
                    <a
                        href={instagramData.profileUrl}
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
