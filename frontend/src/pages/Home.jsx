import { Coffee, CalendarDays, MessageCircle } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-espresso mb-4">
          Himar Coffee Garut
        </h1>
        <p className="text-lg text-espresso/70 mb-8">
          Kedai kopi hangat dan bersahaja di Garut
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-surface rounded-xl p-6 border border-border shadow-sm">
            <Coffee className="w-8 h-8 text-terracotta mx-auto mb-3" />
            <h3 className="font-serif font-semibold text-lg mb-2">Menu</h3>
            <p className="text-sm text-espresso/60">Jelajahi menu kopi dan makanan kami</p>
          </div>
          <div className="bg-surface rounded-xl p-6 border border-border shadow-sm">
            <CalendarDays className="w-8 h-8 text-terracotta mx-auto mb-3" />
            <h3 className="font-serif font-semibold text-lg mb-2">Event</h3>
            <p className="text-sm text-espresso/60">Lihat jadwal acara mendatang</p>
          </div>
          <div className="bg-surface rounded-xl p-6 border border-border shadow-sm">
            <MessageCircle className="w-8 h-8 text-terracotta mx-auto mb-3" />
            <h3 className="font-serif font-semibold text-lg mb-2">Asisten</h3>
            <p className="text-sm text-espresso/60">Tanya apa saja tentang Himar Coffee</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
