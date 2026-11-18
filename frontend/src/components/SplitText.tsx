import React, { useEffect, useRef, useState, type CSSProperties } from 'react';

export type SplitTextEffect = 'rise' | 'fade' | 'blur' | 'flip' | 'pop' | 'skew' | 'wave';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: CSSProperties['textAlign'];
  effect?: SplitTextEffect;
  trigger?: 'view' | 'load' | 'hover' | 'click';
  color?: string;
  accentColor?: string;
  onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 30,
  duration = 0.6,
  splitType = 'words',
  tag = 'p',
  textAlign = 'left',
  effect = 'rise',
  trigger = 'view',
  color
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (trigger === 'load') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [trigger]);

  const units = React.useMemo(() => {
    if (splitType === 'chars') {
      return text.split('');
    }
    // split by words by default to safely preserve complex unicode script (Kannada, Hindi, etc.)
    return text.split(/(\s+)/);
  }, [text, splitType]);

  const getInitialStyle = (): CSSProperties => {
    switch (effect) {
      case 'fade':
        return { opacity: 0 };
      case 'blur':
        return { opacity: 0, filter: 'blur(8px)', transform: 'translateY(10px)' };
      case 'pop':
        return { opacity: 0, transform: 'scale(0.6)' };
      case 'flip':
        return { opacity: 0, transform: 'rotateX(-90deg)' };
      case 'skew':
        return { opacity: 0, transform: 'skewX(-20deg) translateY(20px)' };
      case 'rise':
      default:
        return { opacity: 0, transform: 'translateY(24px)' };
    }
  };

  const getVisibleStyle = (): CSSProperties => {
    switch (effect) {
      case 'fade':
        return { opacity: 1 };
      case 'blur':
        return { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' };
      case 'pop':
        return { opacity: 1, transform: 'scale(1)' };
      case 'flip':
        return { opacity: 1, transform: 'rotateX(0deg)' };
      case 'skew':
        return { opacity: 1, transform: 'skewX(0deg) translateY(0)' };
      case 'rise':
      default:
        return { opacity: 1, transform: 'translateY(0)' };
    }
  };

  const Component = (tag || 'p') as React.ElementType;
  const isInline = tag === 'span' && !className.includes('block');
  const defaultDisplay = isInline ? 'inline-block' : 'block';
  const hasDisplayOverride = /\b(block|inline-block|inline|flex|inline-flex|grid|hidden)\b/.test(className);
  const displayClass = hasDisplayOverride ? '' : defaultDisplay;

  return (
    <Component
      ref={containerRef as any}
      className={`${displayClass} ${className}`.trim()}
      style={{ textAlign, color }}
    >
      {units.map((unit, index) => {
        // preserve whitespace as regular inline space
        if (/^\s+$/.test(unit)) {
          return <span key={index}> </span>;
        }

        const staggerDelay = `${index * (delay / 1000)}s`;
        const style: CSSProperties = {
          display: 'inline-block',
          transition: `all ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}`,
          willChange: 'transform, opacity',
          ...(isVisible ? getVisibleStyle() : getInitialStyle())
        };

        return (
          <span key={index} style={style}>
            {unit}
          </span>
        );
      })}
    </Component>
  );
};

export default SplitText;
