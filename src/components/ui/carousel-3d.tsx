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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const anglePerItem = 360 / items.length;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate current index from rotation angle (for dots indicator)
  const getCurrentIndex = useCallback(() => {
    const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
    return Math.round(normalizedAngle / anglePerItem) % items.length;
  }, [rotationAngle, anglePerItem, items.length]);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    // Always add angle - continuous rotation to the right
    setRotationAngle(prev => prev + anglePerItem);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, anglePerItem]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    // Always subtract angle - continuous rotation to the left
    setRotationAngle(prev => prev - anglePerItem);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, anglePerItem]);

  const goToSlide = useCallback((targetIndex: number) => {
    if (isAnimating) return;
    const currentIdx = getCurrentIndex();
    if (targetIndex === currentIdx) return;

    setIsAnimating(true);

    // Calculate shortest path
    let diff = targetIndex - currentIdx;
    if (diff > items.length / 2) diff -= items.length;
    if (diff < -items.length / 2) diff += items.length;

    setRotationAngle(prev => prev + diff * anglePerItem);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, getCurrentIndex, items.length, anglePerItem]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, autoRotateSpeed);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoRotateSpeed, nextSlide]);

  // Get visible items for mobile based on rotation
  const getVisibleItemsForMobile = useCallback(() => {
    const currentIdx = getCurrentIndex();
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index = ((currentIdx + i) % items.length + items.length) % items.length;
      visible.push({ ...items[index], position: i });
    }
    return visible;
  }, [getCurrentIndex, items]);

  const renderItem = (item: CarouselItem) => {
    const isVideo = item.type === 'video';

    return (
      <a
        key={item.id}
        href={item.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full h-full"
        onClick={(e) => {
          if (isAnimating) e.preventDefault();
        }}
      >
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-card/70 backdrop-blur-lg border border-border/50">
          <div className="absolute inset-0">
            {isVideo ? (
              <video
                src={item.imageUrl}
                className="absolute inset-0 w-full h-full object-cover"
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
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>

          {isVideo && (
            <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center group-hover:opacity-0 transition-opacity z-10">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
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

  const currentIndex = getCurrentIndex();

  // Mobile Carousel - horizontal sliding
  if (isMobile) {
    const visibleItems = getVisibleItemsForMobile();

    return (
      <div
        className="relative w-full overflow-hidden"
        onTouchStart={() => setIsAutoPlaying(false)}
        onTouchEnd={() => setIsAutoPlaying(true)}
      >
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

        <div className="flex items-center justify-center h-[320px] px-12">
          <div className="relative w-full h-full flex items-center justify-center">
            {visibleItems.map((item) => {
              const scale = item.position === 0 ? 1 : 0.8;
              const opacity = item.position === 0 ? 1 : 0.5;
              const zIndex = item.position === 0 ? 10 : 5;
              const translateX = item.position * 85;

              return (
                <div
                  key={`${item.id}-${item.position}`}
                  className="absolute w-[280px] aspect-square transition-all duration-500 ease-out"
                  style={{
                    transform: `translateX(${translateX}%) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  {renderItem(item)}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
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

      <div
        className="h-[500px] flex items-center justify-center"
        style={{ perspective: '1500px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-rotationAngle}deg)`,
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            // Calculate visibility based on current rotation
            const relativeAngle = ((itemAngle - (rotationAngle % 360) + 360) % 360);
            const normalizedAngle = relativeAngle > 180 ? 360 - relativeAngle : relativeAngle;
            const opacity = Math.max(0.2, 1 - (normalizedAngle / 120));
            const isVisible = normalizedAngle < 90;

            return (
              <div
                key={item.id}
                className="absolute w-[320px] h-[320px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-160px',
                  marginTop: '-160px',
                  opacity: isVisible ? opacity : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                {renderItem(item)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
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
