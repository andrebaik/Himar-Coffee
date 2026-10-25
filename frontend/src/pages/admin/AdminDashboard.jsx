import React from 'react';
import { ExternalLink, BarChart3, AlertCircle } from 'lucide-react';
import AdminLayout from '../../features/admin/AdminLayout.jsx';

export default function AdminDashboard() {
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL;

  return (
    <AdminLayout title="Dasbor Penjualan">
      <div className="space-y-4">
        {dashboardUrl ? (
          <div className="bg-white rounded-3xl border border-[#E7DCCB] overflow-hidden shadow-xs flex flex-col h-[750px]">
            <div className="p-3.5 bg-[#FAF4EA] border-b border-[#E7DCCB] flex items-center justify-between">
              <span className="text-xs text-[#2B1B12]/70 font-medium">
                Streamlit Business Intelligence Dashboard
              </span>
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#B5532C] hover:text-[#a04622] inline-flex items-center gap-1"
              >
                <span>Buka di tab baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <iframe
              src={dashboardUrl}
              title="Dasbor Penjualan Himar Coffee"
              loading="lazy"
              className="w-full flex-1 border-0"
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E7DCCB] p-12 text-center max-w-lg mx-auto shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 bg-[#FAF4EA] text-[#B5532C] rounded-2xl flex items-center justify-center mx-auto border border-[#E7DCCB]">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#2B1B12]">
              Dasbor Belum Dikonfigurasi
            </h3>
            <p className="text-xs text-[#2B1B12]/70 leading-relaxed">
              Dasbor visualisasi penjualan sedang dikembangkan menggunakan Streamlit. Setelah siap dan URL tersedia, set variabel lingkungan{' '}
              <code className="bg-[#FAF4EA] px-2 py-0.5 rounded text-[#B5532C] font-mono text-[11px]">
                VITE_DASHBOARD_URL
              </code>{' '}
              untuk menampilkan grafik penjualan langsung di sini.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
