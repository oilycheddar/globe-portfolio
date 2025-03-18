import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  // Convert PNG paths to WebP
  const getOptimizedSrc = (path: string): string => {
    if (path.includes('/optimized/')) return path;
    return path.replace(/\.(png|jpg|jpeg)$/, '.webp').replace('/images/', '/images/optimized/');
  };

  return (
    <div className={`relative ${className || ''}`} style={{ opacity: isLoading ? 0.5 : 1 }}>
      <Image
        src={getOptimizedSrc(imgSrc)}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (fallbackSrc && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
        sizes={props.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        style={{
          maxWidth: '100%',
          height: 'auto',
          ...props.style,
        }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage; 