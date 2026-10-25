import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-serif font-bold text-terracotta mb-4">404</h1>
        <p className="text-xl text-espresso mb-2">Halaman tidak ditemukan</p>
        <p className="text-espresso/60 mb-8">Maaf, halaman yang kamu cari tidak ada.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
