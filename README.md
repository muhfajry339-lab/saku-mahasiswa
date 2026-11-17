# SAKU MAHASISWA

**Sistem Pakar Penentuan Prioritas Pengeluaran Mahasiswa**

SAKU MAHASISWA adalah aplikasi web berbasis aturan (*rule-based expert system*) yang membantu mahasiswa menentukan prioritas pengeluaran menggunakan metode **forward chaining** dan pendekatan **Matriks Eisenhower**. Aplikasi dibuat dengan HTML, CSS, dan JavaScript murni tanpa framework, backend, maupun proses build.

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

- Analisis pengeluaran berdasarkan 5 indikator: kepentingan, urgensi, jenis pengeluaran, dampak, dan kaitan dengan kegiatan kuliah.
- 12 aturan IF–THEN dengan 4 tingkat kesimpulan: P1, P2, P3, dan P4.
- Inferensi forward chaining serta resolusi konflik: bila beberapa aturan cocok, prioritas tertinggi (P1 lebih tinggi daripada P4) yang dipilih.
- Kartu hasil berisi prioritas, rekomendasi tindakan, ringkasan masukan, dan **hanya aturan yang benar-benar digunakan**.
- Penanganan jujur saat tidak ada aturan yang cocok, tanpa menebak prioritas.
- Lima contoh kasus untuk mencoba aplikasi dengan cepat.
- Riwayat analisis tersimpan di `localStorage`, lengkap dengan filter prioritas, pengurutan P1–P4, total nominal per prioritas, hapus per item, dan hapus semua.
- Mode terang dan gelap dengan preferensi tersimpan.
- Halaman Tentang Metode berisi penjelasan sistem pakar, Matriks Eisenhower, diagram alur, daftar pustaka, serta identitas tim.
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
│   ├── engine.js      # mesin inferensi forward chaining
│   └── app.js         # navigasi, form, hasil, riwayat, tema
└── tests/
    ├── uji-logika.js
    ├── hasil-uji.txt
    ├── uji-ui.js
    └── hasil-uji-ui.txt
```

## Basis Pengetahuan dan Inferensi

Lima fakta yang dikumpulkan dari pengguna:

| Kode | Indikator | Nilai |
| --- | --- | --- |
| K1 | Kepentingan | Tinggi, Sedang, Rendah |
| K2 | Urgensi | Tinggi, Sedang, Rendah |
| K3 | Jenis pengeluaran | Kebutuhan, Keinginan |
| K4 | Dampak | Tinggi, Sedang, Rendah |
| K5 | Kaitan dengan kegiatan kuliah | Tinggi, Sedang, Rendah |

Basis pengetahuan memiliki 12 aturan IF–THEN (R01–R12) yang menghasilkan salah satu dari empat kesimpulan:

| Prioritas | Makna | Warna |
| --- | --- | --- |
| P1 | Sangat prioritas, dahulukan | Merah |
| P2 | Prioritas tinggi, dianggarkan segera | Oranye |
| P3 | Prioritas sedang, dapat dijadwalkan | Kuning |
| P4 | Prioritas rendah, tunda bila dana terbatas | Hijau |

Alur inferensi:

1. Pengguna mengisi nama pengeluaran (wajib), nominal opsional, dan lima indikator.
2. Setiap aturan diperiksa: semua kondisi harus terpenuhi. Nilai berupa array berarti salah satu nilai dalam array diterima.
3. Aturan yang cocok dikumpulkan. Jika lebih dari satu, mesin memilih hasil dengan prioritas tertinggi.
4. Antarmuka menampilkan kesimpulan, rekomendasi, ringkasan masukan, dan aturan pendukung.
5. Jika tidak ada aturan yang cocok, aplikasi menampilkan pesan bahwa keputusan tidak dapat dibuat dan meminta pengguna mengubah masukan.
6. Hasil dapat disimpan ke riwayat untuk dibandingkan atau dihapus kemudian.

Daftar lengkap aturan sengaja tidak ditampilkan sebagai daftar di halaman aplikasi. Halaman hasil hanya menampilkan aturan yang digunakan pada analisis tersebut.

## Pengujian

Pengujian logika:

```bash
node tests/uji-logika.js
```

Hasil: **27/27 pengujian lulus**.

Pengujian antarmuka dengan jsdom (opsional, hanya untuk pengembangan):

```bash
node tests/uji-ui.js
```

Hasil: **36/36 pengujian lulus**, tanpa error JavaScript yang tercatat.

Rincian kasus uji, hasil, dan keterbatasan pengujian tersedia di `TESTING.md`. Berkas hasil terbaru juga disimpan di `tests/hasil-uji.txt` dan `tests/hasil-uji-ui.txt`.

## Privasi Data

Aplikasi tidak mengirim data ke server. Nama pengeluaran, nominal, indikator, prioritas, dan waktu analisis hanya disimpan di `localStorage` browser pengguna. Riwayat dapat dihapus kapan saja melalui halaman Riwayat.

## Tim Penyusun

- Nur Amela Ramadani — 250209500021
- Nurfitriani Ariska — 250209500002
- Muh Fajry — 250209500013

**Dosen pengampu:** Dyah Darma Andayani, S.T., M.Tel.Eng

Program Studi Pendidikan Teknik Informatika dan Komputer
Fakultas Teknik, Universitas Negeri Makassar
2026
