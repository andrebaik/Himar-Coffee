import React, { useState } from 'react';
import { Coffee } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt = 'Himar Coffee',
  className = '',
  aspectRatio = 'aspect-4/3',
  fallbackLabel = 'Gambar belum tersedia',
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${aspectRatio} flex w-full flex-col items-center justify-center border border-[#ded2c1] bg-[#eee5d8] text-[#281a13]/55 ${className}`}
      >
        <Coffee className="mb-2 h-8 w-8 text-[#b5532c]/70" aria-hidden="true" />
        <span className="px-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${aspectRatio} w-full object-cover ${className}`}
    />
  );
}
