import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({
  message = 'Gagal memuat data dari server.',
  onRetry,
}) {
  return (
    <div className="mx-auto my-8 max-w-xl border-y border-[#b5532c]/45 bg-[#fff8f3] px-5 py-8 text-center">
      <AlertCircle className="mx-auto mb-4 h-7 w-7 text-[#b5532c]" aria-hidden="true" />
      <h3 className="text-2xl leading-none text-[#281a13]">Data belum bisa dimuat</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6b625b]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center gap-2 border border-[#281a13] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[#281a13] transition hover:bg-[#281a13] hover:text-[#fffdf8]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Coba lagi
        </button>
      )}
    </div>
  );
}
