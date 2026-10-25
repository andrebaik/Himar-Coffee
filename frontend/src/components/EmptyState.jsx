import React from 'react';
import { Coffee } from 'lucide-react';

export default function EmptyState({
  title = 'Belum ada data',
  description = 'Belum ada data untuk ditampilkan saat ini.',
  icon: Icon = Coffee,
  action,
}) {
  return (
    <div className="mx-auto my-8 max-w-xl border-y border-[#ded2c1] py-14 text-center">
      <Icon className="mx-auto mb-5 h-8 w-8 text-[#b5532c]" aria-hidden="true" />
      <h3 className="text-3xl leading-none text-[#281a13]">{title}</h3>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6b625b]">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
