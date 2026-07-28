// src/components/ui/BookImage.tsx
'use client';

import { useState } from 'react';

interface BookImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function BookImage({ src, alt = 'Book cover', className = '', width, height }: BookImageProps) {
  const [error, setError] = useState(false);
  
  // If no src or error, use fallback
  const imageSrc = (!src || error) ? '/uploads/default-book-cover.jpg' : src;
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{ width, height }}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}