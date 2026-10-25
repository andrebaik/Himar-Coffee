import React from 'react';

export default function CategoryFilter({ categories = [], selected = '', onSelect }) {
  const allCategories = ['', ...categories];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[#ded2c1] pb-4" aria-label="Filter kategori menu">
      {allCategories.map((category) => {
        const isActive = selected === category;
        return (
          <button
            key={category || 'all'}
            type="button"
            onClick={() => onSelect(category)}
            className={`relative inline-flex min-h-11 items-center text-sm transition ${
              isActive ? 'font-semibold text-[#b5532c]' : 'text-[#6b625b] hover:text-[#281a13]'
            }`}
            aria-pressed={isActive}
          >
            {category || 'Semua menu'}
            {isActive && <span className="absolute -bottom-[1px] left-0 h-0.5 w-full bg-[#b5532c]" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
