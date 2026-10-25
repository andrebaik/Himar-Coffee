# Panduan Pengguna (User Manual) — Himar Coffee Garut

Dokumen ini berisi panduan penggunaan sistem digital Himar Coffee Garut, ditujukan untuk **pelanggan** dan **pengelola/admin kedai**.

---

## Bagian 1: Panduan Pelanggan

Platform digital Himar Coffee Garut dapat diakses langsung melalui peramban (browser) di ponsel pintar maupun komputer tanpa perlu registrasi atau mengunduh aplikasi tambahan.

### 1.1 Menjelajahi Menu & Minuman Favorit
1. Buka halaman utama website.
2. Klik tombol **"Lihat Menu"** atau pilih menu **"Menu"** pada bilah navigasi.
3. Gunakan filter kategori (*Semua Menu, Kopi, Non-Kopi, Makanan*) atau ketik nama menu di kolom pencarian.
4. Klik pada kartu menu untuk melihat informasi detail, foto racikan, dan pilihan varian (*Hot, Iced, dll.*).

### 1.2 Menggunakan Keranjang & Memesan via WhatsApp
1. Di modal detail menu, pilih varian yang diinginkan (jika ada) dan tentukan jumlah pesanan.
2. Klik tombol **"Tambah ke Pesanan"**.
3. Ikon keranjang di pojok kanan atas akan menampilkan jumlah item yang telah dipilih.
4. Klik ikon keranjang untuk membuka ringkasan pesanan.
5. Anda dapat menyesuaikan jumlah porsi, menghapus item, serta menambahkan catatan khusus (misalnya: *"Kurangi gula"* atau *"Es batu dipisah"*).
6. Klik tombol hijau **"Pesan via WhatsApp"**.
7. Sistem otomatis menyusun format teks pesanan rapi dan mengarahkan Anda langsung ke percakapan WhatsApp kasir/barista Himar Coffee untuk konfirmasi stok dan pembayaran.

### 1.3 Bertanya ke Asisten Chatbot AI
1. Klik tombol melayang lingkaran berwarna terracotta dengan ikon chat di pojok kanan bawah layar.
2. Anda akan disambut oleh Asisten Himar Coffee.
3. Anda dapat mengklik salah satu chip pertanyaan populer (*"Menu unggulan apa saja?"*, *"Ada event apa minggu ini?"*, *"Gimana cara pesan?"*) atau mengetik pertanyaan bebas seputar menu, harga, jam operasional, dan lokasi.
4. Jika asisten merekomendasikan menu tertentu, klik tombol tautan yang disediakan untuk langsung menuju katalog menu atau WhatsApp pemesanan.

### 1.4 Memantau Agenda Event & Workshop
1. Pilih menu **"Event"** pada navigasi atas atau navigasi bawah di ponsel.
2. Tab **"Event Mendatang"** menampilkan jadwal kegiatan terbaru seperti *Live Acoustic Night*, kelas barista, atau temu komunitas kopi lokal Garut.
3. Tab **"Sudah Berlalu"** menampilkan arsip acara-acara seru yang telah terselenggara sebelumnya.

---

## Bagian 2: Panduan Pengelola Kedai (Admin)

Portal Admin dirancang khusus agar tim pengelola Himar Coffee dapat memperbarui katalog menu dan jadwal acara secara mandiri kapan pun dibutuhkan.

### 2.1 Masuk ke Portal Admin
1. Akses halaman `/admin/login` melalui peramban.
2. Masukkan alamat email admin terdaftar (contoh: `himar@admin.com`) dan kata sandi yang telah ditentukan.
3. Klik **"Masuk ke Dasbor"**. Sistem akan memverifikasi kredensial dan mengarahkan Anda ke ruang kerja admin.

### 2.2 Mengelola Katalog Menu
1. Pada menu navigasi admin, klik **"Katalog Menu"**.
2. **Menambah Menu Baru:**
   - Klik tombol **"+ Tambah Menu"**.
   - Isi nama menu, kategori, harga dasar dalam rupiah, dan deskripsi singkat.
   - Unggah foto menu (format JPG, PNG, atau WebP, maksimal 2 MB). Foto akan tersimpan aman di cloud storage.
   - Tambahkan varian menu jika tersedia (misal: varian *Iced* dengan tambahan biaya `+Rp3.000`).
   - Centang opsi *Menu Unggulan* jika ingin menu ini ditampilkan di bagian atas Beranda pelanggan.
   - Pastikan opsi *Tersedia untuk Dipesan* aktif.
   - Klik **"Simpan Menu"**.
3. **Mengubah / Mengupdate Stok Menu:**
   - Klik ikon pensil biru pada baris menu yang ingin diubah.
   - Jika stok bahan habis, nonaktifkan centang *Tersedia*. Menu akan ditandai dengan badge "Habis" di website dan tidak dapat dipesan oleh pelanggan.
   - Klik **"Simpan Menu"**.
4. **Menghapus Menu:**
   - Klik ikon tong sampah merah, lalu konfirmasi penghapusan pada jendela dialog.

### 2.3 Mengelola Agenda Event
1. Pada menu navigasi admin, klik **"Jadwal Event"**.
2. **Menambah Event Baru:**
   - Klik tombol **"+ Tambah Event"**.
   - Masukkan judul kegiatan, tanggal & jam acara (Waktu Indonesia Barat), lokasi panggung, dan deskripsi acara.
   - Unggah poster promosi event.
   - Pastikan opsi *Terbitkan Event* tercentang agar tampil di website publik.
   - Klik **"Simpan Event"**.
3. **Mengedit / Menghapus Event:**
   - Gunakan tombol edit (pensil) atau hapus (tong sampah) sesuai kebutuhan.

### 2.4 Memantau Dasbor Penjualan (Streamlit)
1. Klik menu **"Dasbor Penjualan"** pada navigasi admin.
2. Dasbor analitik bisnis akan memuat ringkasan performa secara interaktif:
   - **Total Pendapatan (Rp)** dalam periode yang dipilih.
   - **Jumlah cup/porsi terjual**.
   - **Rata-rata nilai belanja per transaksi (AOV)**.
   - **Menu Best Seller** terlaris.
   - Grafik tren pendapatan harian dan komposisi penjualan antar kategori menu.
3. Anda dapat menyaring data berdasarkan rentang tanggal tertentu atau kategori menu melalui filter di bilah samping.

### 2.5 Melihat Riwayat Chatbot
1. Klik menu **"Riwayat Chat"** pada navigasi admin.
2. Anda dapat melihat percakapan pelanggan dengan asisten AI, kategori maksud pertanyaan (*intent*), tingkat keyakinan (*confidence*), serta jawaban yang diberikan.
3. Fitur ini sangat berguna untuk mengevaluasi pertanyaan apa yang paling sering diajukan pelanggan serta membaca keluhan yang masuk.

---

## Bagian 3: Tips Pemeliharaan & Troubleshooting

1. **Foto Menu Tidak Muncul:**
   - Pastikan foto memiliki ekstensi `.jpg`, `.jpeg`, `.png`, atau `.webp` dan ukurannya di bawah 2 MB.
   - Bila koneksi internet lambat saat mengunggah, tunggu hingga indikator "Mengunggah..." selesai sebelum menekan Simpan.
2. **WhatsApp Web Tidak Terbuka Otomatis:**
   - Jika peramban memblokir pop-up otomatis, sistem akan menampilkan notifikasi kuning dengan tombol *"Buka WhatsApp Manual"*. Klik tombol tersebut untuk membuka chat.
3. **Keluar dari Sistem:**
   - Selalu klik tombol **"Keluar"** di menu bawah admin setelah selesai mengelola sistem, terutama jika menggunakan perangkat bersama.
