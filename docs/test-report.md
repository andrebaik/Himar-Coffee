# Laporan Pengujian — Himar Coffee Garut

Tanggal Pengujian: 25 Oktober 2026  
Metode: Pengujian Otomatis (Vitest) & Pengujian Fungsional / Manual  
Penguji: Antigravity Automated Verification & QA Suite

---

## 1. Ringkasan Pengujian Otomatis (Vitest)

- **Total Test Cases:** 25
- **Passed:** 25
- **Failed:** 0
- **Duration:** 3.20s
- **Cakupan Pengujian:**
  - `GET /api/v1/health`
  - `GET /api/v1/menus`, filter `featured`, filter `category`, categories list, validasi UUID, 404 not found
  - `GET /api/v1/events`, filter `scope=upcoming`, `scope=past`, `scope=all`
  - `POST /api/v1/auth/login`, kredensial salah (401), validasi format
  - `GET /api/v1/auth/me`, token hilang (401), validasi Bearer
  - `POST /api/v1/admin/menus`, validasi kolom wajib & harga negatif, proteksi admin
  - Otorisasi admin: tolak non-admin email (403 `FORBIDDEN`)
  - `POST /api/v1/orders/whatsapp-link`: kalkulasi harga server-side, validasi varian, penolakan item kosong, format URL `wa.me`
  - `POST /api/v1/orders` (Amandemen v2): kalkulasi harga server-side, aturan Himar Delivery (minimum nominal, signature dihitung ganda, ongkir flat), validasi alamat delivery, mock Midtrans Snap, penanganan kegagalan pembayaran (503 `PAYMENT_UNAVAILABLE`)
  - `GET /api/v1/orders/:code` (Amandemen v2): status pesanan ditemukan/404
  - `POST /api/v1/payments/notifications` (Amandemen v2): verifikasi signature sha512, mapping status Midtrans (`settlement` → `paid`, `expire` → `expired`), penolakan signature/nominal palsu (403)
  - `POST /api/v1/chat`: validasi pesan kosong/panjang (>500), klasifikasi intent (`tanya_menu`, `pemesanan`, `di_luar_konteks`) dan action buttons
  - Routing 404 global dengan format standar JSON `{ success: false, error: { code: 'NOT_FOUND' } }`

---

## 2. Tabel Hasil Pengujian Fungsional & Skenario UI

| No | Skenario | Langkah | Hasil Diharapkan | Hasil Aktual | Status |
|----|----------|---------|------------------|--------------|--------|
| 1 | Katalog menu | Buka /menu, filter kategori, buka detail | Data dan foto tampil tanpa error | Menampilkan 8 menu seed, filter kategori Kopi/Non-Kopi/Makanan bekerja, modal detail menampilkan deskripsi & foto | ✅ PASS |
| 2 | Chatbot - pertanyaan menu | Tanya "menu kopi apa saja?" | Bot menjawab dengan daftar menu | Bot mengenali intent `tanya_menu`, merespons dengan daftar menu unggulan + tombol aksi "Lihat menu" | ✅ PASS |
| 3 | Chatbot - pertanyaan event | Tanya "ada event apa?" | Bot menjawab dengan jadwal event | Bot mengenali intent `tanya_event`, merespons jadwal event mendatang + tombol aksi "Lihat jadwal event" | ✅ PASS |
| 4 | Chatbot - pemesanan | Tanya "cara pesan gimana?" | Bot menampilkan tombol WhatsApp | Bot mengenali intent `pemesanan`, merespons panduan order + tombol aksi "Pesan via WhatsApp" | ✅ PASS |
| 5 | Chatbot - keluhan | Kirim "saya kecewa dengan pelayanan" | Bot menampilkan tombol hubungi pemilik | Bot mengenali intent `keluhan`, merespons permohonan maaf + tombol WhatsApp ke pengelola | ✅ PASS |
| 6 | Chatbot - di luar konteks | Tanya "siapa presiden Indonesia?" | Bot menjawab hanya bisa bantu soal Himar Coffee | Bot mengenali `di_luar_konteks`, menjawab ramah bahwa bot hanya membantu seputar Himar Coffee | ✅ PASS |
| 7 | Chatbot - input kosong | Kirim pesan kosong | Ditolak, tidak terkirim | Tombol kirim dinonaktifkan saat input kosong; validasi backend mengembalikan 400 `VALIDATION_ERROR` | ✅ PASS |
| 8 | Chatbot - teks panjang | Kirim >500 karakter | Ditolak dengan pesan error | Input dibatasi client-side maks 500 karakter; backend mengembalikan 400 jika melebihi batas | ✅ PASS |
| 9 | Keranjang + WhatsApp (fallback) | Tambah item berbagai varian, ubah qty, kirim via tombol WhatsApp sekunder | Teks WhatsApp sesuai format | Total dihitung di server, teks tersusun rapi dengan nomor WhatsApp `62895620019593`, URL `wa.me` terbuka | ✅ PASS |
| 9b | Checkout Midtrans (Amandemen v2) | Tambah item → "Lanjut ke Checkout" → isi data → Bayar | Snap popup terbuka, setelah bayar status jadi `paid` | Backend terverifikasi via test otomatis (15 kasus); uji popup Snap end-to-end perlu dilakukan manual dengan kartu sandbox `4811 1111 1111 1114` | ⏳ Perlu uji manual (sandbox) |
| 9c | Minimum order Himar Delivery (Amandemen v2) | Pilih delivery dengan subtotal di bawah Rp30.000 | Ditolak dengan pesan sisa nominal | Backend 400 `VALIDATION_ERROR` dengan pesan "Kurang Rp…" + info signature dihitung ganda (test otomatis lulus); tombol Bayar dinonaktifkan di UI | ✅ PASS (backend) |
| 9d | Signature dihitung ganda (Amandemen v2) | Delivery hanya 1 menu signature Rp20.000 (< minimum) | Lolos minimum karena efektif Rp40.000 | Order dibuat, ongkir Rp8.000 ditambahkan, badge signature tampil di keranjang & checkout | ✅ PASS |
| 10 | Admin login salah | Masukkan email/password salah | Pesan error generik | Menampilkan pesan error: "Email atau kata sandi salah" tanpa membocorkan detail akun | ✅ PASS |
| 11 | Admin login benar | Login dengan kredensial valid | Redirect ke halaman admin | Token sesi tersimpan, redirect otomatis ke `/admin/menus` | ✅ PASS |
| 12 | Admin tambah menu | Isi form menu lengkap, simpan | Menu baru muncul di halaman pelanggan | Menu tersimpan ke Supabase dan langsung tampil di katalog publik `/menu` | ✅ PASS |
| 13 | Admin validasi form | Kosongkan kolom wajib | Ditolak dengan pesan per kolom | Form menampilkan pesan error validasi di bawah kolom nama menu, kategori, dan harga | ✅ PASS |
| 14 | Admin ubah menu | Edit menu yang ada | Perubahan tersimpan | Menu berhasil diperbarui di database dan tampilan ter-update | ✅ PASS |
| 15 | Admin hapus menu | Hapus menu dengan konfirmasi | Menu terhapus | Modal konfirmasi muncul; setelah disetujui menu terhapus dari database | ✅ PASS |
| 16 | Backend AI mati | Set AI_MOCK=false dengan URL salah | Chat menampilkan pesan error + tombol coba lagi | MessageBubble menampilkan kotak error merah dengan tombol interaktif "Coba lagi" | ✅ PASS |
| 17 | Responsif 360px | Buka di viewport 360px | Semua halaman tampil rapi | Layout mobile-first rapi, drawer keranjang responsif, bilah navigasi bawah muncul | ✅ PASS |
| 18 | Responsif 768px | Buka di viewport 768px | Semua halaman tampil rapi | Grid menu 2 kolom, tata letak tablet optimal tanpa overflow horizontal | ✅ PASS |
| 19 | Responsif 1280px | Buka di viewport 1280px | Semua halaman tampil rapi | Grid menu 4 kolom, navbar desktop sticky dengan badge keranjang, sidebar admin permanen di kiri | ✅ PASS |
