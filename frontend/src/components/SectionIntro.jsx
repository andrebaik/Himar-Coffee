import React from 'react';
import { Link } from 'react-router-dom';

export default function SectionIntro({
  eyebrow,
  title,
  description,
  linkLabel,
  linkTo,
  tone = 'default',
}) {
  const toneClass = tone === 'light' ? 'text-[#fffdf8]' : 'text-[#281a13]';
  const descriptionClass = tone === 'light' ? 'text-[#fffdf8]/72' : 'text-[#6b625b]';

  return (
    <div className={`flex flex-col gap-4 ${toneClass}`}>
      {eyebrow && (
        <span className={tone === 'light' ? 'eyebrow text-[#b9c9af]' : 'eyebrow'}>{eyebrow}</span>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="max-w-2xl">
          <h2 className="max-w-3xl text-4xl leading-[0.98] md:text-5xl">{title}</h2>
          {description && (
            <p className={`mt-4 max-w-xl text-sm leading-7 md:text-base ${descriptionClass}`}>
              {description}
            </p>
          )}
        </div>
        {linkLabel && linkTo && (
          <Link className={tone === 'light' ? 'editorial-link text-[#fffdf8]' : 'editorial-link'} to={linkTo}>
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
