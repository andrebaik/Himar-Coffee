# Laporan Pengujian Manual — Himar Coffee Garut

| No | Skenario | Langkah | Hasil Diharapkan | Hasil Aktual | Status |
|----|----------|---------|------------------|--------------|--------|
| 1 | Katalog menu | Buka /menu, filter kategori, buka detail | Data dan foto tampil tanpa error | | ⬜ |
| 2 | Chatbot - pertanyaan menu | Tanya "menu kopi apa saja?" | Bot menjawab dengan daftar menu | | ⬜ |
| 3 | Chatbot - pertanyaan event | Tanya "ada event apa?" | Bot menjawab dengan jadwal event | | ⬜ |
| 4 | Chatbot - pemesanan | Tanya "cara pesan gimana?" | Bot menampilkan tombol WhatsApp | | ⬜ |
| 5 | Chatbot - keluhan | Kirim "saya kecewa dengan pelayanan" | Bot menampilkan tombol hubungi pemilik | | ⬜ |
| 6 | Chatbot - di luar konteks | Tanya "siapa presiden Indonesia?" | Bot menjawab hanya bisa bantu soal Himar Coffee | | ⬜ |
| 7 | Chatbot - input kosong | Kirim pesan kosong | Ditolak, tidak terkirim | | ⬜ |
| 8 | Chatbot - teks panjang | Kirim >500 karakter | Ditolak dengan pesan error | | ⬜ |
| 9 | Keranjang + WhatsApp | Tambah item berbagai varian, ubah qty, kirim | Teks WhatsApp sesuai format | | ⬜ |
| 10 | Admin login salah | Masukkan email/password salah | Pesan error generik | | ⬜ |
| 11 | Admin login benar | Login dengan kredensial valid | Redirect ke halaman admin | | ⬜ |
| 12 | Admin tambah menu | Isi form menu lengkap, simpan | Menu baru muncul di halaman pelanggan | | ⬜ |
| 13 | Admin validasi form | Kosongkan kolom wajib | Ditolak dengan pesan per kolom | | ⬜ |
| 14 | Admin ubah menu | Edit menu yang ada | Perubahan tersimpan | | ⬜ |
| 15 | Admin hapus menu | Hapus menu dengan konfirmasi | Menu terhapus | | ⬜ |
| 16 | Backend AI mati | Set AI_MOCK=false dengan URL salah | Chat menampilkan pesan error + tombol coba lagi | | ⬜ |
| 17 | Responsif 360px | Buka di viewport 360px | Semua halaman tampil rapi | | ⬜ |
| 18 | Responsif 768px | Buka di viewport 768px | Semua halaman tampil rapi | | ⬜ |
| 19 | Responsif 1280px | Buka di viewport 1280px | Semua halaman tampil rapi | | ⬜ |
