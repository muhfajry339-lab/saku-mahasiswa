# SAKU MAHASISWA

**Sistem Pakar Penentuan Prioritas Pengeluaran Mahasiswa**

SAKU MAHASISWA adalah aplikasi web berbasis aturan (*rule-based expert system*) yang membantu mahasiswa menentukan prioritas kebutuhan menggunakan metode **forward chaining**, pendekatan **Matriks Eisenhower**, dan **skor prioritas otomatis** empat kriteria. Aplikasi dibuat dengan HTML, CSS, dan JavaScript murni tanpa framework, backend, maupun proses build.

## Cara Menjalankan

Tidak ada dependensi yang perlu dipasang untuk memakai aplikasi.

1. Buka folder `saku-mahasiswa`.
2. Klik dua kali `index.html`, atau buka melalui browser.

Alternatif yang disarankan agar semua aset dimuat optimal:

```bash
cd saku-mahasiswa
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.

> Font Google digunakan bila koneksi internet tersedia. Jika tidak tersedia, aplikasi tetap berjalan dengan font sistem. Data riwayat disimpan di `localStorage` browser.

## Fitur Utama

- **Kategori kebutuhan** berupa dropdown yang dapat dicari dan diisi manual: UKT Perkuliahan, Peralatan Kuliah, Beli Laptop, Skincare (Perempuan), Uang Makan, Uang Transportasi, Bayar Kos, Kuota/Internet, dan Kebutuhan Lainnya.
- Analisis kebutuhan berdasarkan 5 indikator: kepentingan, urgensi, jenis kebutuhan, dampak, dan kaitan dengan kegiatan kuliah.
- **Skor prioritas otomatis 0–100** dengan bobot tetap: tingkat kebutuhan 35%, urgensi 30%, manfaat perkuliahan 25%, dan kesesuaian harga 10%.
- 12 aturan IF–THEN dengan 4 tingkat kesimpulan: P1, P2, P3, dan P4.
- Kondisi aturan memakai nilai alternatif sehingga **156 dari 162 kombinasi fakta lengkap (96,3%)** menghasilkan keputusan; seluruh kombinasi kebutuhan tertangani.
- Inferensi forward chaining serta resolusi konflik: bila beberapa aturan cocok, prioritas tertinggi (P1 lebih tinggi daripada P4) yang dipilih.
- Kartu hasil berisi prioritas, rekomendasi tindakan, ringkasan masukan, rincian skor per kriteria, dan **hanya aturan yang benar-benar digunakan**.
- Penanganan jujur untuk kombinasi yang benar-benar di luar cakupan, tanpa menebak prioritas. Skor tetap dihitung agar kebutuhan dapat dibandingkan.
- Lima contoh kasus untuk mencoba aplikasi dengan cepat.
- **Riwayat otomatis**: setiap hasil analisis langsung tersimpan di `localStorage` tanpa perlu menekan tombol simpan.
- **Perbandingan prioritas di dalam menu Riwayat**: centang dua kebutuhan atau lebih, lalu lihat urutan skor, urgensi, nominal, alasan, dan rekomendasi utama.
- Perbandingan yang pernah dibuat otomatis tersimpan dan dapat dibuka kembali atau dihapus.
- Filter prioritas, pengurutan skor tertinggi, total nominal per prioritas, hapus per item, dan hapus semua.
- Mode terang dan gelap dengan preferensi tersimpan.
- Halaman Tentang Metode berisi penjelasan sistem pakar, Matriks Eisenhower, bobot penilaian, diagram alur, daftar pustaka, serta identitas tim.
- Tampilan responsif untuk layar ponsel 360px hingga desktop 1440px.

## Struktur Proyek

```text
saku-mahasiswa/
├── index.html
├── README.md
├── TESTING.md
├── assets/
│   ├── favicon.svg
│   └── logo.svg
├── css/
│   └── style.css
├── js/
│   ├── rules.js       # basis pengetahuan 12 aturan
│   ├── penilaian.js   # kategori kebutuhan + skor 4 kriteria
│   ├── engine.js      # mesin inferensi forward chaining
│   └── app.js         # navigasi, combobox, form, hasil, riwayat, perbandingan, tema
└── tests/
    ├── uji-logika.js
    ├── uji-penilaian.js
    ├── uji-ui.js
    ├── hasil-uji.txt
    ├── hasil-uji-penilaian.txt
    └── hasil-uji-ui.txt
```

## Kategori Kebutuhan

Kolom “Kebutuhan yang Ingin Diprioritaskan” berupa *combobox*: pengguna dapat memilih dari daftar, mencari dengan mengetik, atau memasukkan kebutuhan sendiri. Kategori yang disediakan:

1. UKT Perkuliahan
2. Peralatan Kuliah
3. Beli Laptop
4. Skincare (Perempuan) — opsional dan tidak membatasi pengguna lain
5. Uang Makan
6. Uang Transportasi
7. Bayar Kos
8. Kuota/Internet
9. Kebutuhan Lainnya

Kategori wajib adalah UKT, Uang Makan, Uang Transportasi, dan Bayar Kos. Kebutuhan yang diketik sendiri tetap dinilai dengan kriteria yang sama.

## Sistem Penilaian Prioritas Otomatis

Selain inferensi aturan, setiap kebutuhan diberi skor 0–100. Bobot tetap dan totalnya 100%:

| Kriteria | Bobot | Sumber nilai |
| --- | --- | --- |
| Tingkat kebutuhan | 35% | Indikator kepentingan; kategori wajib minimal 90 |
| Tingkat urgensi | 30% | Indikator urgensi |
| Manfaat untuk perkuliahan | 25% | Indikator kaitan dengan kegiatan kuliah |
| Kesesuaian harga | 10% | Perbandingan nominal biaya dengan dana tersedia |

Catatan perhitungan:

- Nilai Tinggi = 100, Sedang = 70, Rendah = 40.
- Kesesuaian harga memakai rasio nominal terhadap dana: ≤10% = 100, ≤25% = 85, ≤50% = 70, ≤75% = 55, ≤100% = 40, >100% = 20. Bila nominal atau dana belum diisi, nilainya netral (60).
- Karena harga hanya 10%, kebutuhan yang lebih penting tidak otomatis kalah karena lebih mahal.
- Skor diurutkan menurun. Bila skor sama, prioritas aturan P1–P4 dan waktu analisis menjadi penentu.
- Setiap hasil menampilkan rincian kontribusi tiap kriteria agar perhitungan transparan.

## Basis Pengetahuan dan Inferensi

Lima fakta yang dikumpulkan dari pengguna:

| Kode | Indikator | Nilai |
| --- | --- | --- |
| K1 | Kepentingan | Tinggi, Sedang, Rendah |
| K2 | Urgensi | Tinggi, Sedang, Rendah |
| K3 | Jenis pengeluaran | Kebutuhan, Keinginan |
| K4 | Dampak | Tinggi, Sedang, Rendah |
| K5 | Kaitan dengan kegiatan kuliah | Tinggi, Sedang, Rendah |

Basis pengetahuan memiliki 12 aturan IF–THEN (R01–R12) yang menghasilkan salah satu dari empat kesimpulan. Setiap kondisi dapat berisi satu nilai atau beberapa nilai alternatif (array) agar cakupan kombinasi lebih luas tanpa menambah jumlah aturan:

| Prioritas | Makna | Warna |
| --- | --- | --- |
| P1 | Sangat prioritas, dahulukan | Merah |
| P2 | Prioritas tinggi, dianggarkan segera | Oranye |
| P3 | Prioritas sedang, dapat dijadwalkan | Kuning |
| P4 | Prioritas rendah, tunda bila dana terbatas | Hijau |

Alur inferensi:

1. Pengguna memilih atau mengetik kebutuhan (wajib), mengisi nominal dan dana tersedia (opsional), lalu lima indikator.
2. Setiap aturan diperiksa: semua kondisi harus terpenuhi. Nilai berupa array berarti salah satu nilai dalam array diterima.
3. Aturan yang cocok dikumpulkan. Jika lebih dari satu, mesin memilih hasil dengan prioritas tertinggi.
4. Antarmuka menampilkan kesimpulan, rekomendasi, ringkasan masukan, rincian skor, dan aturan pendukung.
5. Setelah perluasan kondisi, hanya 6 dari 162 kombinasi fakta lengkap (kombinasi keinginan yang kontradiktif, misalnya keinginan berdampak tinggi) yang tidak memiliki aturan cocok. Untuk kasus itu aplikasi menampilkan pesan bahwa keputusan tidak dapat dibuat dan meminta pengguna mengubah masukan; skor tetap dihitung.
6. Hasil tersimpan otomatis di Riwayat. Pengguna dapat membandingkan dua kebutuhan atau lebih di menu Riwayat.

Daftar lengkap aturan sengaja tidak ditampilkan sebagai daftar di halaman aplikasi. Halaman hasil hanya menampilkan aturan yang digunakan pada analisis tersebut.

## Perbandingan di Menu Riwayat

Seluruh fitur perbandingan berada di menu **Riwayat** (tidak ada menu terpisah):

- Setiap analisis otomatis masuk riwayat.
- Centang dua kebutuhan atau lebih, lalu tekan **Bandingkan**.
- Tabel menampilkan nama kebutuhan, nominal, urgensi, skor prioritas, dan kode P1–P4.
- Urutan dihitung dari skor tertinggi ke terendah.
- Setiap baris disertai alasan yang mudah dipahami dan rekomendasi kebutuhan yang sebaiknya dipenuhi lebih dahulu.
- Perbandingan otomatis tersimpan dan dapat dibuka kembali atau dihapus.
- Tombol hapus per item dan hapus semua tetap tersedia.

## Pengujian

Pengujian logika mesin inferensi:

```bash
node tests/uji-logika.js
```

Hasil: **29/29 pengujian lulus**.

Pengujian sistem penilaian otomatis:

```bash
node tests/uji-penilaian.js
```

Hasil: **29/29 pengujian lulus**.

Pengujian antarmuka dengan jsdom (opsional, hanya untuk pengembangan):

```bash
node tests/uji-ui.js
```

Hasil: **73/73 pengujian lulus**, tanpa error JavaScript yang tercatat.

Rincian kasus uji, hasil, dan keterbatasan pengujian tersedia di `TESTING.md`. Berkas hasil terbaru juga disimpan di `tests/hasil-uji.txt`, `tests/hasil-uji-penilaian.txt`, dan `tests/hasil-uji-ui.txt`.

## Privasi Data

Aplikasi tidak mengirim data ke server. Nama kebutuhan, kategori, nominal, dana tersedia, indikator, skor, prioritas, dan waktu analisis hanya disimpan di `localStorage` browser pengguna. Daftar perbandingan tersimpan memakai kunci `saku-mahasiswa-perbandingan-v1`. Semua data dapat dihapus kapan saja melalui halaman Riwayat.

## Tim Penyusun

- Nur Amela Ramadani — 250209500021
- Nurfitriani Ariska — 250209500002
- Muh Fajry — 250209500013

**Dosen pengampu:** Dyah Darma Andayani, S.T., M.Tel.Eng

Program Studi Pendidikan Teknik Informatika dan Komputer
Fakultas Teknik, Universitas Negeri Makassar
2026
