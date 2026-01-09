import { ReactNode } from 'react';
import { useParallax } from '@/hooks/useParallax';

interface ParallaxSectionProps {
  children?: ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}

const ParallaxSection = ({ 
  children, 
  speed = 0.1, 
  direction = 'up',
  className = ''
}: ParallaxSectionProps) => {
  const { ref, offset } = useParallax<HTMLDivElement>({ speed, direction });

  return (
    <div 
      ref={ref}
      className={className}
      style={{ 
        transform: `translateY(${offset}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;
