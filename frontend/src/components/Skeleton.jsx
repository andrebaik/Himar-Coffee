import React from 'react';

export function MenuCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] border border-[#ded2c1] bg-[#eee5d8]" />
      <div className="border-b border-[#ded2c1] py-4">
        <div className="h-3 w-20 bg-[#ded2c1]" />
        <div className="mt-3 h-7 w-2/3 bg-[#ded2c1]" />
        <div className="mt-3 h-3 w-full bg-[#ded2c1]/75" />
        <div className="mt-2 h-3 w-4/5 bg-[#ded2c1]/75" />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="animate-pulse border border-[#ded2c1] bg-[#fffdf8]">
      <div className="aspect-[16/10] bg-[#eee5d8]" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-28 bg-[#ded2c1]" />
        <div className="h-7 w-4/5 bg-[#ded2c1]" />
        <div className="h-3 w-full bg-[#ded2c1]/75" />
        <div className="h-3 w-3/4 bg-[#ded2c1]/75" />
      </div>
    </div>
  );
}
