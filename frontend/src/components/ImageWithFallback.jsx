import React, { useState } from 'react';
import { Coffee } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt = 'Himar Coffee',
  className = '',
  aspectRatio = 'aspect-4/3',
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${aspectRatio} w-full bg-[#FAF4EA] border border-[#E7DCCB] rounded-lg flex flex-col items-center justify-center text-[#2B1B12]/40 ${className}`}
      >
        <Coffee className="w-10 h-10 mb-1 text-[#B5532C]/60" />
        <span className="text-xs font-medium tracking-wide">Himar Coffee</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${aspectRatio} w-full object-cover rounded-lg ${className}`}
    />
  );
}
