import React from 'react';
import { BarChart3, ExternalLink } from 'lucide-react';
import AdminLayout from '../../features/admin/AdminLayout.jsx';

export default function AdminDashboard() {
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL;

  return (
    <AdminLayout title="Dasbor penjualan">
      <div className="space-y-8">
        <div className="border-b border-[#ded2c1] pb-6">
          <p className="max-w-2xl text-sm leading-7 text-[#6b625b]">Buka ringkasan penjualan dan pola menu yang membantu kamu menyiapkan operasional kedai.</p>
        </div>

        {dashboardUrl ? (
          <div className="overflow-hidden border border-[#ded2c1] bg-[#fffdf8]">
            <div className="flex flex-col gap-4 border-b border-[#ded2c1] bg-[#eee5d8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4f6d52]">Data penjualan</p><p className="mt-1 text-sm text-[#6b625b]">Dashboard Streamlit terhubung</p></div>
              <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#b5532c] transition hover:text-[#8c3f25]"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Buka di tab baru</a>
            </div>
            <iframe src={dashboardUrl} title="Dasbor penjualan Himar Coffee" loading="lazy" className="h-[min(75vh,52rem)] w-full border-0" />
          </div>
        ) : (
          <div className="mx-auto max-w-xl border-y border-[#ded2c1] py-16 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-[#b5532c]" aria-hidden="true" />
            <h2 className="mt-5 text-3xl leading-none">Dasbor belum dikonfigurasi</h2>
            <p className="mt-4 text-sm leading-7 text-[#6b625b]">Isi <code className="bg-[#eee5d8] px-1.5 py-0.5 text-xs text-[#b5532c]">VITE_DASHBOARD_URL</code> lalu build ulang frontend untuk menampilkan dashboard Streamlit di sini.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
