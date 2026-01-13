import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';

export interface CarouselItem {
  id: string;
  imageUrl: string;
  type: 'image' | 'video';
  caption: string;
  permalink: string;
}

interface Carousel3DProps {
  items: CarouselItem[];
  autoRotateSpeed?: number;
  radius?: number;
}

const Carousel3D: React.FC<Carousel3DProps> = ({
  items,
  autoRotateSpeed = 4000,
  radius = 400
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
      setIsAnimating(false);
    }, 300);
  }, [items.length, isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
      setIsAnimating(false);
    }, 300);
  }, [items.length, isAnimating]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, autoRotateSpeed);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoRotateSpeed, nextSlide]);

  const anglePerItem = 360 / items.length;

  // Get visible items for mobile (current + neighbors)
  const getVisibleItems = () => {
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + items.length) % items.length;
      visible.push({ ...items[index], position: i });
    }
    return visible;
  };

  const renderItem = (item: CarouselItem, index: number, is3D: boolean = false, angle: number = 0) => {
    const isVideo = item.type === 'video';

    return (
      <a
        key={item.id}
        href={item.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
        onClick={(e) => {
          // Prevent navigation during animation
          if (isAnimating) e.preventDefault();
        }}
      >
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-card/70 backdrop-blur-lg border border-border/50">
          {isVideo ? (
            <video
              src={item.imageUrl}
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
              src={item.imageUrl}
              alt={item.caption}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}

          {/* Video indicator */}
          {isVideo && (
            <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center group-hover:opacity-0 transition-opacity">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white text-sm line-clamp-2">{item.caption}</p>
            </div>
            <div className="absolute top-4 right-4">
              <ExternalLink className="w-5 h-5 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </a>
    );
  };

  // Mobile Carousel
  if (isMobile) {
    const visibleItems = getVisibleItems();

    return (
      <div
        className="relative w-full overflow-hidden"
        onTouchStart={() => setIsAutoPlaying(false)}
        onTouchEnd={() => setIsAutoPlaying(true)}
      >
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 transition-all duration-300 shadow-lg"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 transition-all duration-300 shadow-lg"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slides Container */}
        <div className="flex items-center justify-center h-[400px] px-12">
          <div className="relative w-full h-full flex items-center justify-center">
            {visibleItems.map((item) => {
              let translateX = item.position * 100;
              let scale = item.position === 0 ? 1 : 0.8;
              let opacity = item.position === 0 ? 1 : 0.5;
              let zIndex = item.position === 0 ? 10 : 5;

              if (isAnimating) {
                if (direction === 'right') {
                  translateX -= 100;
                } else {
                  translateX += 100;
                }
              }

              return (
                <div
                  key={`${item.id}-${item.position}`}
                  className="absolute w-[280px] h-[350px] transition-all duration-300 ease-out"
                  style={{
                    transform: `translateX(${translateX}%) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  {renderItem(item, 0)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 'right' : 'left');
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop 3D Carousel
  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 3D Container */}
      <div
        className="h-[500px] flex items-center justify-center"
        style={{ perspective: '1500px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-currentIndex * anglePerItem}deg)`,
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            // Calculate visibility based on current rotation
            const currentRotation = currentIndex * anglePerItem;
            const relativeAngle = ((itemAngle - currentRotation) % 360 + 360) % 360;
            const normalizedAngle = relativeAngle > 180 ? 360 - relativeAngle : relativeAngle;
            const opacity = Math.max(0.2, 1 - (normalizedAngle / 120));
            const isVisible = normalizedAngle < 90;

            return (
              <div
                key={item.id}
                className="absolute w-[300px] h-[380px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-150px',
                  marginTop: '-190px',
                  opacity: isVisible ? opacity : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                {renderItem(item, i, true, itemAngle)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'bg-primary w-6'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export { Carousel3D };
