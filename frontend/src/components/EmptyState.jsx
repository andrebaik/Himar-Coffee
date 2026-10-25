import React from 'react';
import { Coffee } from 'lucide-react';

export default function EmptyState({
  title = 'Tidak ada data',
  description = 'Belum ada data untuk ditampilkan saat ini.',
  icon: Icon = Coffee,
  action,
}) {
  return (
    <div className="text-center py-12 px-4 bg-white/50 border border-[#E7DCCB] rounded-2xl max-w-md mx-auto my-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FAF4EA] flex items-center justify-center text-[#B5532C]">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-serif font-bold text-[#2B1B12] mb-1">{title}</h3>
      <p className="text-sm text-[#2B1B12]/70 mb-6">{description}</p>
      {action}
    </div>
  );
}
