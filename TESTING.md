# Laporan Pengujian — SAKU MAHASISWA

Pengujian dilakukan pada **17 November 2026** menggunakan Node.js v18.19.1 dan jsdom 20.0.3. Aplikasi yang diuji adalah versi tanpa backend dengan mesin inferensi di `js/engine.js` dan basis pengetahuan di `js/rules.js`.

## Ringkasan Hasil

| Jenis pengujian | Perintah | Hasil |
| --- | --- | --- |
| Logika mesin inferensi | `node tests/uji-logika.js` | **27/27 lulus, 0 gagal** |
| Antarmuka dan alur pengguna | `node tests/uji-ui.js` | **36/36 lulus, 0 gagal** |
| Error JavaScript di konsol saat uji UI | termasuk `uji-ui.js` | **Tidak ada error** |

Berkas hasil lengkap:

- `tests/hasil-uji.txt`
- `tests/hasil-uji-ui.txt`

## Cara Menjalankan Pengujian

Dari folder proyek:

```bash
node tests/uji-logika.js
node tests/uji-ui.js
```

`uji-ui.js` membutuhkan paket pengembangan `jsdom`. Paket ini tidak dipakai oleh aplikasi saat dibuka di browser. Bila belum tersedia:

```bash
npm install --no-save jsdom
```

## A. Validasi Basis Pengetahuan

| No | Pengujian | Harapan | Hasil |
| --- | --- | --- | --- |
| A1 | Jumlah aturan | 12 | Lulus |
| A2 | ID aturan unik | 12 ID berbeda | Lulus |
| A3 | Setiap aturan memiliki 5 kondisi | Ya | Lulus |
| A4 | Semua kesimpulan berada di P1–P4 | P1, P2, P3, P4 | Lulus |

## B. Satu Kasus untuk Setiap Aturan

Keterangan nilai: **T** = Tinggi, **S** = Sedang, **R** = Rendah. Kolom K, U, J, D, dan KT berturut-turut adalah Kepentingan, Urgensi, Jenis, Dampak, dan Kaitan dengan kegiatan kuliah.

| No | Aturan | Kasus | K | U | J | D | KT | Harapan | Aktual | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B01 | R01 | Kebutuhan pokok sangat mendesak | T | T | Kebutuhan | T | T | P1 | R01 → P1 | Lulus |
| B02 | R02 | Kebutuhan hidup dasar mendesak | T | T | Kebutuhan | T | S | P1 | R02 → P1 | Lulus |
| B03 | R03 | Penunjang kuliah penting sebelum tenggat | T | S | Kebutuhan | T | T | P1 | R03 → P1 | Lulus |
| B04 | R04 | Buku referensi, tenggat masih longgar | T | S | Kebutuhan | S | T | P2 | R04 → P2 | Lulus |
| B05 | R05 | Mendesak dan terkait kuliah, kepentingan menengah | S | T | Kebutuhan | T | T | P2 | R05 → P2 | Lulus |
| B06 | R06 | Persiapan kuliah jangka panjang | T | R | Kebutuhan | S | T | P2 | R06 → P2 | Lulus |
| B07 | R07 | Penunjang kuliah sekunder | S | S | Kebutuhan | S | T | P3 | R07 → P3 | Lulus |
| B08 | R08 | Alat tulis rutin | S | R | Kebutuhan | R | S | P3 | R08 → P3 | Lulus |
| B09 | R09 | Keinginan mendadak, dampak akademis minim | S | T | Keinginan | R | R | P3 | R09 → P3 | Lulus |
| B10 | R10 | Hiburan atau rekreasi | R | S | Keinginan | R | R | P4 | R10 → P4 | Lulus |
| B11 | R11 | Keinginan konsumtif tidak terkait kuliah | R | T | Keinginan | R | R | P4 | R11 → P4 | Lulus |
| B12 | R12 | Tersier yang dapat dibatalkan | R | R | Keinginan | R | R | P4 | R12 → P4 | Lulus |

## C. Pengujian Kondisi Nilai Array pada R02

R02 menerima dua nilai untuk indikator kaitan.

| No | Nilai kaitan | Harapan | Aktual | Status |
| --- | --- | --- | --- | --- |
| C1 | Sedang | R02 → P1 | R02 → P1 | Lulus |
| C2 | Rendah | R02 → P1 | R02 → P1 | Lulus |

## D. Kasus Tanpa Aturan Cocok

Mesin harus mengembalikan status `tidak_cocok`, tidak memilih aturan, dan tidak menebak prioritas.

| No | Kasus | K | U | J | D | KT | Harapan | Aktual | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Jaket edisi terbatas (contoh demo) | R | R | Keinginan | S | R | Tidak cocok | `tidak_cocok`, aturan `null` | Lulus |
| D2 | Kombinasi tidak terdefinisi #1 | T | R | Keinginan | T | T | Tidak cocok | `tidak_cocok`, aturan `null` | Lulus |
| D3 | Kombinasi tidak terdefinisi #2 | S | T | Kebutuhan | S | T | Tidak cocok | `tidak_cocok`, aturan `null` | Lulus |
| D4 | Fakta tidak lengkap (hanya 2 indikator) | T | T | — | — | — | Tidak cocok | `tidak_cocok`, aturan `null` | Lulus |

## E. Pengujian Fungsi `cocokkanAturan()`

| No | Pengujian | Harapan | Hasil |
| --- | --- | --- | --- |
| E1 | Fakta persis sama dengan R01 | `true` | Lulus |
| E2 | Satu kondisi berbeda dari R01 | `false` | Lulus |
| E3 | Fakta kosong terhadap seluruh aturan | Tidak ada yang cocok | Lulus |

## F. Resolusi Konflik

Menggunakan aturan simulasi X1 (P4), X2 (P1), dan X3 (P2) yang semuanya cocok dengan fakta yang sama.

| No | Pengujian | Harapan | Aktual | Status |
| --- | --- | --- | --- | --- |
| F1 | Tiga aturan cocok sekaligus | P1 menang (X2) | X2 → P1 | Lulus |
| F2 | Aturan P1 dihilangkan, P2 dan P4 cocok | P2 menang (X3) | X3 → P2 | Lulus |

## G. Pengujian Antarmuka dan Alur Pengguna

Pengujian ini menjalankan `index.html` beserta `rules.js`, `engine.js`, dan `app.js` di jsdom, lalu menyimulasikan interaksi pengguna.

| No | Skenario | Hasil |
| --- | --- | --- |
| G1 | Halaman beranda aktif saat aplikasi dibuka | Lulus |
| G2 | Lima kelompok indikator dibuat dari JavaScript | Lulus |
| G3 | Lima contoh kasus tersedia | Lulus |
| G4 | Tombol analisis nonaktif sebelum data lengkap | Lulus |
| G5 | Mesin inferensi tersedia secara global | Lulus |
| G6 | Panel contoh kasus dapat dibuka | Lulus |
| G7 | Formulir terisi saat contoh P1 dipilih | Lulus |
| G8 | Kelima indikator terpilih otomatis | Lulus |
| G9 | Tombol analisis aktif setelah data lengkap | Lulus |
| G10 | Pengguna berpindah ke halaman hasil setelah analisis | Lulus |
| G11 | Kesimpulan P1 tampil | Lulus |
| G12 | Aturan pendukung R01 tampil | Lulus |
| G13 | Judul “Aturan yang Digunakan” tampil | Lulus |
| G14 | Ringkasan masukan pengguna tampil | Lulus |
| G15 | Hasil tersimpan di `localStorage` | Lulus |
| G16 | Tombol simpan berubah menjadi status tersimpan | Lulus |
| G17 | Navigasi ke halaman riwayat berfungsi | Lulus |
| G18 | Satu item riwayat tampil setelah disimpan | Lulus |
| G19 | Empat kartu total per prioritas tampil | Lulus |
| G20 | Dialog konfirmasi hapus terbuka | Lulus |
| G21 | Item riwayat terhapus setelah konfirmasi | Lulus |
| G22 | Empty state riwayat tampil setelah daftar kosong | Lulus |
| G23 | `localStorage` ikut dikosongkan | Lulus |
| G24 | Mode gelap aktif saat tombol tema diklik | Lulus |
| G25 | Preferensi tema gelap tersimpan | Lulus |
| G26 | Tema kembali terang saat tombol diklik lagi | Lulus |
| G27 | Hasil tanpa aturan cocok tampil untuk contoh demo | Lulus |
| G28 | Pesan “Tidak ditemukan aturan yang cocok” tampil | Lulus |
| G29 | Tombol “Ubah Masukan” tersedia pada kondisi tanpa aturan | Lulus |
| G30 | Tombol simpan tidak ditampilkan pada kondisi tanpa aturan | Lulus |
| G31 | Nominal contoh tetap terisi setelah contoh dimuat | Lulus |
| G32 | Tombol analisis nonaktif saat nama dikosongkan | Lulus |
| G33 | Petunjuk meminta nama pengeluaran saat nama kosong | Lulus |
| G34 | Submit tanpa nama tidak berpindah ke halaman hasil | Lulus |
| G35 | Tombol analisis aktif setelah nama diisi | Lulus |
| G36 | Tidak ada error JavaScript yang tercatat selama pengujian | Lulus |

## H. Pemeriksaan Responsif dan Kompatibilitas

| Aspek | Pemeriksaan | Status |
| --- | --- | --- |
| Lebar 360px | Tata letak satu kolom, navigasi menu lipat, kartu indikator dan statistik bertumpuk | Diperiksa melalui aturan media query |
| Lebar 680px | Grid indikator dan contoh kasus menyesuaikan menjadi satu atau dua kolom | Diperiksa melalui aturan media query |
| Lebar 860px | Navigasi desktop diganti tombol menu; grid langkah menjadi satu kolom | Diperiksa melalui aturan media query |
| Lebar 1080px | Grid prioritas, contoh kasus, dan metodologi menyesuaikan jumlah kolom | Diperiksa melalui aturan media query |
| Lebar 1440px | Kontainer maksimum 1180px berada di tengah, tidak melebar berlebihan | Diperiksa melalui aturan CSS |
| Overflow horizontal | Hanya diagram alur yang dapat digulir horizontal di layar kecil; halaman utama tidak | Diperiksa melalui aturan CSS |
| Mode gelap | Warna teks, kartu, tombol, dan badge prioritas tetap terbaca | Diperiksa melalui token warna dan uji tema |
| Tanpa JavaScript | Pesan `noscript` tampil | Tersedia di `index.html` |

Catatan: lingkungan pengujian tidak menyediakan browser grafis (Chromium/Firefox). Pengujian visual berbasis tangkapan layar perlu dilakukan manual di browser sebelum presentasi. Struktur responsif, breakpoint, dan perilaku antarmuka telah diperiksa melalui CSS serta jsdom.

## I. Keterbatasan

- Aplikasi berjalan sepenuhnya di browser dan tidak memiliki backend atau basis data server.
- Riwayat bersifat lokal pada satu browser dan dapat hilang bila data situs dibersihkan.
- Metode inferensi bersifat pasti (*certainty factor* tidak digunakan); kombinasi di luar 12 aturan akan menghasilkan “tidak ada aturan cocok”, bukan perkiraan.
- Pengujian jsdom tidak menghitung tata letak piksel, sehingga kecocokan visual akhir tetap perlu dicek di browser.
- Font eksternal memerlukan koneksi internet; aplikasi memiliki fallback font sistem.
