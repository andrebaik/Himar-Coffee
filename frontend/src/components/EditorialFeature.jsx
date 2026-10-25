import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';

export default function EditorialFeature({
  label,
  title,
  description,
  meta,
  imageSrc,
  imageAlt,
  actionLabel = 'Lihat detail',
  onAction,
  reverse = false,
  tone = 'paper',
  imageNote,
}) {
  const isDark = tone === 'dark';

  return (
    <article
      className={`grid overflow-hidden border ${
        isDark ? 'border-[#fffdf8]/15 bg-[#281a13] text-[#fffdf8]' : 'border-[#ded2c1] bg-[#fffdf8] text-[#281a13]'
      } md:grid-cols-[1.08fr_0.92fr] ${reverse ? 'md:grid-cols-[0.92fr_1.08fr]' : ''}`}
    >
      <div className={`relative min-h-[18rem] md:min-h-[30rem] ${reverse ? 'md:order-2' : ''}`}>
        <ImageWithFallback
          src={imageSrc}
          alt={imageAlt || title}
          aspectRatio="aspect-[4/3] md:aspect-auto md:h-full"
          className="h-full rounded-none"
        />
        <span
          className={`absolute bottom-4 left-4 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] ${
            isDark ? 'bg-[#fffdf8] text-[#281a13]' : 'bg-[#281a13] text-[#fffdf8]'
          }`}
        >
          {label}
        </span>
        {imageNote && <span className="absolute right-4 top-4 bg-[#281a13]/75 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#fffdf8]">{imageNote}</span>}
      </div>

      <div className={`flex flex-col justify-between gap-10 p-7 md:p-12 ${reverse ? 'md:order-1' : ''}`}>
        <div className="space-y-5">
          {meta && <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-[#b9c9af]' : 'text-[#4f6d52]'}`}>{meta}</p>}
          <h3 className="max-w-md text-4xl leading-[0.96] md:text-5xl">{title}</h3>
          <p className={`max-w-md text-sm leading-7 md:text-base ${isDark ? 'text-[#fffdf8]/72' : 'text-[#6b625b]'}`}>
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onAction}
          className={`inline-flex min-h-11 w-fit items-center gap-3 border-b pb-2 text-xs font-bold uppercase tracking-[0.12em] transition hover:gap-4 ${
            isDark ? 'border-[#fffdf8]/45 text-[#fffdf8]' : 'border-[#b5532c] text-[#281a13]'
          }`}
        >
          {actionLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
