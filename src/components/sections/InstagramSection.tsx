import { Instagram, ExternalLink, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import instagramData from "@/data/instagramPosts.json";

interface InstagramPost {
    id: string;
    imageUrl: string;
    type: string;
    caption: string;
    permalink: string;
    timestamp: string;
}

const InstagramSection = () => {
    const posts: InstagramPost[] = instagramData.posts;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Number of posts visible at once based on screen size
    const getVisibleCount = () => {
        if (typeof window === 'undefined') return 3;
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    };

    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        const handleResize = () => setVisibleCount(getVisibleCount());
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, posts.length - visibleCount);

    const nextSlide = useCallback(() => {
        setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    }, [maxIndex]);

    const prevSlide = () => {
        setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
    };

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const visiblePosts = posts.slice(currentIndex, currentIndex + visibleCount);
    // Fill remaining slots if we're at the end
    if (visiblePosts.length < visibleCount) {
        visiblePosts.push(...posts.slice(0, visibleCount - visiblePosts.length));
    }

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

                {/* Carousel Container */}
                <div
                    className="relative max-w-6xl mx-auto"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-8">
                        {visiblePosts.map((post) => (
                            <a
                                key={post.id}
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-square overflow-hidden rounded-xl bg-secondary/50 transition-transform duration-300 hover:scale-[1.02]"
                            >
                                {/* Image or Video */}
                                {post.type === 'video' ? (
                                    <video
                                        src={post.imageUrl}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        playsInline
                                        onMouseEnter={(e) => e.currentTarget.play()}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.pause();
                                            e.currentTarget.currentTime = 0;
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={post.imageUrl}
                                        alt={post.caption}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                )}

                                {/* Video Play Icon */}
                                {post.type === 'video' && (
                                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center group-hover:opacity-0 transition-opacity">
                                        <Play className="w-4 h-4 text-white fill-white" />
                                    </div>
                                )}

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

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: Math.ceil(posts.length / visibleCount) }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx * visibleCount > maxIndex ? maxIndex : idx * visibleCount)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    Math.floor(currentIndex / visibleCount) === idx
                                        ? 'bg-primary w-6'
                                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
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
