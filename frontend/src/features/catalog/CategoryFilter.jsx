import React from 'react';

export default function CategoryFilter({ categories = [], selected = '', onSelect }) {
  const allCategories = ['', ...categories];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {allCategories.map((cat) => {
        const isActive = selected === cat;
        return (
          <button
            key={cat || 'all'}
            onClick={() => onSelect(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
              isActive
                ? 'bg-[#B5532C] text-white border-[#B5532C] shadow-xs'
                : 'bg-white text-[#2B1B12]/80 border-[#E7DCCB] hover:border-[#B5532C]/40 hover:bg-[#FAF4EA]'
            }`}
          >
            {cat || 'Semua Menu'}
          </button>
        );
      })}
    </div>
  );
}
