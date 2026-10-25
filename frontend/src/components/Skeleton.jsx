import React from 'react';

export function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E7DCCB] p-4 animate-pulse">
      <div className="w-full aspect-4/3 bg-[#FAF4EA] rounded-lg mb-3"></div>
      <div className="h-4 bg-[#E7DCCB] rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-[#E7DCCB]/60 rounded w-1/2 mb-4"></div>
      <div className="flex justify-between items-center pt-2 border-t border-[#E7DCCB]/40">
        <div className="h-4 bg-[#B5532C]/30 rounded w-1/3"></div>
        <div className="h-8 bg-[#E7DCCB] rounded-lg w-20"></div>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E7DCCB] p-4 animate-pulse">
      <div className="w-full aspect-16/9 bg-[#FAF4EA] rounded-lg mb-3"></div>
      <div className="h-5 bg-[#E7DCCB] rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-[#E7DCCB]/60 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-[#E7DCCB]/40 rounded w-full mb-1"></div>
      <div className="h-3 bg-[#E7DCCB]/40 rounded w-4/5"></div>
    </div>
  );
}
