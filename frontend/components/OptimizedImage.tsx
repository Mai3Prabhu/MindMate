import Image, { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'loading'> {
  eager?: boolean
}

/**
 * Optimized image component with automatic lazy loading
 * Uses Next.js Image component with best practices
 */
export default function OptimizedImage({ 
  eager = false,
  priority,
  ...props 
}: OptimizedImageProps) {
  return (
    <Image
      {...props}
      loading={eager || priority ? 'eager' : 'lazy'}
      priority={priority}
      placeholder={props.placeholder || 'blur'}
      blurDataURL={props.blurDataURL || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='}
      quality={props.quality || 85}
      sizes={props.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
    />
  )
}

/**
 * Avatar image with optimized defaults
 */
export function Avatar({ 
  src, 
  alt, 
  size = 40 
}: { 
  src: string
  alt: string
  size?: number 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      sizes={`${size}px`}
    />
  )
}

/**
 * Background image with optimized defaults
 */
export function BackgroundImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes="100vw"
      priority
    />
  )
}
