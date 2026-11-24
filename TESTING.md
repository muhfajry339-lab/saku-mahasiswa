# Laporan Pengujian — SAKU MAHASISWA

Pengujian dilakukan pada **22 November 2026** menggunakan Node.js v18.19.1 dan jsdom 20.0.3. Aplikasi yang diuji adalah versi 1.1 tanpa backend dengan mesin inferensi di `js/engine.js`, basis pengetahuan di `js/rules.js`, dan sistem penilaian di `js/penilaian.js`.

## Ringkasan Hasil

| Jenis pengujian | Perintah | Hasil |
| --- | --- | --- |
| Logika mesin inferensi | `node tests/uji-logika.js` | **29/29 lulus, 0 gagal** |
| Sistem penilaian prioritas | `node tests/uji-penilaian.js` | **29/29 lulus, 0 gagal** |
| Antarmuka dan alur pengguna | `node tests/uji-ui.js` | **73/73 lulus, 0 gagal** |
| Error JavaScript di konsol saat uji UI | termasuk `uji-ui.js` | **Tidak ada error** |

Berkas hasil lengkap:

- `tests/hasil-uji.txt`
- `tests/hasil-uji-penilaian.txt`
- `tests/hasil-uji-ui.txt`

## Cara Menjalankan Pengujian

Dari folder proyek:

```bash
node tests/uji-logika.js
node tests/uji-penilaian.js
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
| A5 | Cakupan fakta lengkap minimal 90% | ≥ 90% | Lulus (156/162 = 96,3%) |
| A6 | Seluruh kombinasi kebutuhan lengkap menghasilkan keputusan | 81 dari 81 | Lulus |

Catatan cakupan: kondisi 12 aturan memakai nilai alternatif (array). Dari 162 kombinasi lima indikator, 156 kombinasi (96,3%) menghasilkan keputusan dan hanya 6 kombinasi keinginan yang kontradiktif yang tetap `tidak_cocok`. Seluruh 81 kombinasi berjenis Kebutuhan tertangani.

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
| D3 | Kombinasi tidak terdefinisi #2 | T | R | Keinginan | T | S | Tidak cocok | `tidak_cocok`, aturan `null` | Lulus |
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

## G. Pengujian Sistem Penilaian Prioritas

Menguji `js/penilaian.js`: konfigurasi bobot, pemetaan kategori, perhitungan skor, kesesuaian harga, urutan perbandingan, alasan, rekomendasi, dan kompatibilitas data lama.

| No | Pengujian | Harapan | Hasil |
| --- | --- | --- | --- |
| G1 | Jumlah kategori kebutuhan | 9 | Lulus |
| G2 | ID kategori unik | 9 ID berbeda | Lulus |
| G3 | Total bobot kriteria | 100% | Lulus |
| G4 | Kategori wajib UKT, makan, transportasi, kos | Semua tersedia dan bertanda wajib | Lulus |
| G5 | Kategori Skincare (Perempuan) | Tersedia dan tidak wajib | Lulus |
| G6 | Alias “SPP” | Dikenali sebagai UKT | Lulus |
| G7 | Alias “sewa kos” | Dikenali sebagai Bayar Kos | Lulus |
| G8 | Kebutuhan manual | Tidak dipaksa masuk kategori | Lulus |
| G9 | Kategori khusus | Dipakai untuk kebutuhan manual | Lulus |
| G10 | Skor UKT | Berada di rentang 0–100 | Lulus |
| G11 | Kebutuhan wajib | Skor tingkat kebutuhan minimal 90 | Lulus |
| G12 | Konsistensi total | Sama dengan jumlah kontribusi berbobot | Lulus |
| G13 | Tanpa dana | Kesesuaian harga netral (60) | Lulus |
| G14 | Harga ≤10% dana | Skor 100 | Lulus |
| G15 | Harga ≤25% dana | Skor 85 | Lulus |
| G16 | Harga ≤50% dana | Skor 70 | Lulus |
| G17 | Harga ≤75% dana | Skor 55 | Lulus |
| G18 | Harga ≤100% dana | Skor 40 | Lulus |
| G19 | Harga >100% dana | Skor 20 | Lulus |
| G20 | Bukan sekadar harga murah | Kebutuhan wajib yang lebih mahal tetap di urutan pertama | Lulus |
| G21 | Alasan peringkat | Memuat skor | Lulus |
| G22 | Alasan kebutuhan wajib | Menyebut “kebutuhan wajib” | Lulus |
| G23 | Rekomendasi utama | Memilih skor tertinggi | Lulus |
| G24 | Teks rekomendasi | Tersedia dan dapat dibaca | Lulus |
| G25 | Data tanpa nominal | Tetap mendapat skor | Lulus |
| G26 | Kategori dari nama lama | “Bayar Kos” dikenali | Lulus |
| G27 | Harga netral data lama | Nominal kosong dinilai netral | Lulus |
| G28 | Urutan perbandingan | Skor tertinggi lebih dahulu | Lulus |
| G29 | Kebutuhan wajib mahal vs hiburan murah | Kebutuhan wajib menang | Lulus |

## H. Pengujian Antarmuka dan Alur Pengguna

Pengujian ini menjalankan `index.html` beserta `rules.js`, `penilaian.js`, `engine.js`, dan `app.js` di jsdom, lalu menyimulasikan interaksi pengguna.

| No | Skenario | Hasil |
| --- | --- | --- |
| H1 | Halaman beranda aktif saat aplikasi dibuka | Lulus |
| H2 | Lima kelompok indikator dibuat dari JavaScript | Lulus |
| H3 | Lima contoh kasus tersedia | Lulus |
| H4 | Tombol analisis nonaktif sebelum data lengkap | Lulus |
| H5 | Mesin inferensi dan modul penilaian tersedia global | Lulus |
| H6 | Dropdown kategori tertutup saat awal | Lulus |
| H7 | Dropdown kategori dapat dibuka dan ditutup | Lulus |
| H8 | Sembilan kategori tampil | Lulus |
| H9 | Pencarian kategori dengan mengetik | Lulus |
| H10 | Memilih kategori mengisi input | Lulus |
| H11 | Petunjuk menandai kebutuhan wajib | Lulus |
| H12 | Input manual dikenali sebagai kebutuhan khusus | Lulus |
| H13 | Reset mengosongkan kebutuhan | Lulus |
| H14 | Panel contoh kasus dapat dibuka | Lulus |
| H15 | Formulir terisi saat contoh P1 dipilih | Lulus |
| H16 | Nominal dan dana tersedia terisi | Lulus |
| H17 | Kategori contoh terdeteksi UKT | Lulus |
| H18 | Kelima indikator terpilih otomatis | Lulus |
| H19 | Tombol analisis aktif setelah data lengkap | Lulus |
| H20 | Pengguna berpindah ke halaman hasil | Lulus |
| H21 | Kesimpulan P1 tampil | Lulus |
| H22 | Aturan pendukung R01 tampil | Lulus |
| H23 | Panel skor prioritas tampil | Lulus |
| H24 | Skor UKT contoh = 94 | Lulus |
| H25 | Kategori tampil di ringkasan hasil | Lulus |
| H26 | Hasil tersimpan otomatis di `localStorage` | Lulus |
| H27 | Item riwayat menyimpan skor | Lulus |
| H28 | Item riwayat menyimpan kategori | Lulus |
| H29 | Item riwayat menyimpan dana | Lulus |
| H30 | Tombol simpan nonaktif setelah auto-save | Lulus |
| H31 | Analisis kedua menghasilkan P2 | Lulus |
| H32 | Dua analisis tersimpan otomatis | Lulus |
| H33 | Navigasi ke halaman riwayat berfungsi | Lulus |
| H34 | Dua item riwayat tampil | Lulus |
| H35 | Empat kartu total per prioritas tampil | Lulus |
| H36 | Skor tampil pada setiap item riwayat | Lulus |
| H37 | Bar perbandingan tersedia | Lulus |
| H38 | Tombol bandingkan nonaktif sebelum memilih | Lulus |
| H39 | Dua kebutuhan dapat dipilih | Lulus |
| H40 | Tombol bandingkan aktif setelah dua dipilih | Lulus |
| H41 | Panel perbandingan tampil | Lulus |
| H42 | Tabel perbandingan berisi dua baris | Lulus |
| H43 | Kebutuhan skor tertinggi di urutan pertama | Lulus |
| H44 | Rekomendasi utama ditampilkan | Lulus |
| H45 | Alasan peringkat ditampilkan | Lulus |
| H46 | Perbandingan otomatis tersimpan | Lulus |
| H47 | `localStorage` perbandingan terisi | Lulus |
| H48 | Panel perbandingan dapat ditutup | Lulus |
| H49 | Perbandingan sebelumnya dapat dibuka | Lulus |
| H50 | Perbandingan tersimpan dapat dihapus | Lulus |
| H51 | Hapus semua riwayat berfungsi | Lulus |
| H52 | Empty state riwayat tampil | Lulus |
| H53 | `localStorage` riwayat ikut dikosongkan | Lulus |
| H54 | Mode gelap aktif saat tombol tema diklik | Lulus |
| H55 | Preferensi tema gelap tersimpan | Lulus |
| H56 | Tema kembali terang saat diklik lagi | Lulus |
| H57 | Hasil tanpa aturan cocok tampil | Lulus |
| H58 | Pesan “Tidak ditemukan aturan yang cocok” tampil | Lulus |
| H59 | Skor tetap dihitung saat tanpa aturan | Lulus |
| H60 | Tombol “Ubah Masukan” tersedia | Lulus |
| H61 | Tombol simpan tidak ditampilkan pada kondisi tanpa aturan | Lulus |
| H62 | Hasil tanpa aturan tetap tersimpan otomatis | Lulus |
| H63 | Status tanpa aturan tercatat | Lulus |
| H64 | Riwayat tanpa aturan ditandai perlu tinjauan | Lulus |
| H65 | Tombol analisis nonaktif saat kebutuhan dikosongkan | Lulus |
| H66 | Petunjuk meminta kebutuhan diisi | Lulus |
| H67 | Submit tanpa kebutuhan tidak berpindah ke hasil | Lulus |
| H68 | Tombol analisis aktif setelah kebutuhan diisi | Lulus |
| H69 | Tidak ada error JavaScript yang tercatat | Lulus |
| H70 | Dropdown mudah dipakai dengan mouse | Lulus |
| H71 | Kategori dapat dipilih lewat keyboard (panah/Enter) | Diperiksa melalui implementasi ARIA combobox |
| H72 | Data lama tetap terbaca tanpa kehilangan riwayat | Lulus melalui normalisasi data |
| H73 | Perbandingan tidak berada di menu terpisah | Lulus, berada di dalam Riwayat |

## I. Pemeriksaan Responsif dan Kompatibilitas

| Aspek | Pemeriksaan | Status |
| --- | --- | --- |
| Lebar 360px | Tata letak satu kolom, navigasi menu lipat, kartu indikator dan statistik bertumpuk | Diperiksa melalui aturan media query |
| Lebar 430px | Tombol perbandingan melebar penuh dan kartu riwayat bertumpuk | Diperiksa melalui aturan media query |
| Lebar 680px | Formulir kebutuhan menjadi satu kolom, tabel perbandingan dapat digulir | Diperiksa melalui aturan media query |
| Lebar 960px | Combobox mengambil lebar penuh baris, grid bobot dua kolom | Diperiksa melalui aturan media query |
| Lebar 1080px | Grid prioritas, contoh kasus, dan metodologi menyesuaikan jumlah kolom | Diperiksa melalui aturan media query |
| Lebar 1440px | Kontainer maksimum berada di tengah, tidak melebar berlebihan | Diperiksa melalui aturan CSS |
| Overflow horizontal | Tabel perbandingan dan diagram alur dapat digulir di layar kecil | Diperiksa melalui aturan CSS |
| Mode gelap | Warna teks, kartu, tombol, dropdown, dan badge prioritas tetap terbaca | Diperiksa melalui token warna dan uji tema |
| Tanpa JavaScript | Pesan `noscript` tampil | Tersedia di `index.html` |

Catatan: lingkungan pengujian tidak menyediakan browser grafis (Chromium/Firefox). Pengujian visual berbasis tangkapan layar perlu dilakukan manual di browser sebelum presentasi. Struktur responsif, breakpoint, dan perilaku antarmuka telah diperiksa melalui CSS serta jsdom.

## J. Keterbatasan

- Aplikasi berjalan sepenuhnya di browser dan tidak memiliki backend atau basis data server.
- Riwayat dan perbandingan bersifat lokal pada satu browser dan dapat hilang bila data situs dibersihkan.
- Metode inferensi bersifat pasti (*certainty factor* tidak digunakan). Setelah kondisi aturan diperluas, 156 dari 162 kombinasi fakta lengkap menghasilkan keputusan; 6 kombinasi keinginan kontradiktif (keinginan dengan urgensi rendah tetapi dampak tinggi, atau sejenisnya) tetap menghasilkan “tidak ada aturan cocok”, bukan perkiraan.
- Skor prioritas adalah alat bantu keputusan, bukan pengganti pertimbangan pribadi atau konsultasi keuangan.
- Bila nominal atau dana tersedia belum diisi, kriteria kesesuaian harga dinilai netral (60/100).
- Pengujian jsdom tidak menghitung tata letak piksel, sehingga kecocokan visual akhir tetap perlu dicek di browser.
- Font eksternal memerlukan koneksi internet; aplikasi memiliki fallback font sistem.
