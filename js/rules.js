/**
 * BASIS PENGETAHUAN — SAKU MAHASISWA
 * -----------------------------------
 * Berisi 12 aturan IF–THEN (rule-based expert system) yang menghubungkan
 * lima fakta/indikator dengan empat tingkat prioritas pengeluaran.
 *
 * Struktur satu aturan:
 *   id        : kode aturan (R01–R12)
 *   kondisi   : pasangan indikator -> nilai yang harus terpenuhi.
 *               Nilai boleh berupa array, artinya salah satu nilai diterima.
 *   hasil     : kesimpulan prioritas (P1–P4)
 *   deskripsi : keterangan aturan untuk ditampilkan saat aturan digunakan.
 *
 * Catatan: daftar ini hanya dipakai mesin inferensi; antarmuka tidak
 * menampilkan seluruh aturan sebagai daftar di halaman mana pun.
 */

const SAKU_RULES = [
  {
    id: "R01",
    kondisi: {
      kepentingan: "Tinggi",
      urgensi: "Tinggi",
      jenis: "Kebutuhan",
      dampak: "Tinggi",
      kaitan: "Tinggi",
    },
    hasil: "P1",
    deskripsi:
      "Kebutuhan akademik/pokok yang sangat mendesak, misalnya membayar SPP.",
  },
  {
    id: "R02",
    kondisi: {
      kepentingan: "Tinggi",
      urgensi: ["Tinggi", "Sedang"],
      jenis: "Kebutuhan",
      dampak: ["Tinggi", "Sedang"],
      kaitan: ["Sedang", "Rendah"],
    },
    hasil: "P1",
    deskripsi:
      "Kebutuhan hidup dasar yang mendesak, misalnya kos atau obat darurat.",
  },
  {
    id: "R03",
    kondisi: {
      kepentingan: "Tinggi",
      urgensi: ["Sedang", "Tinggi"],
      jenis: "Kebutuhan",
      dampak: "Tinggi",
      kaitan: ["Tinggi", "Sedang"],
    },
    hasil: "P1",
    deskripsi:
      "Penunjang kuliah penting yang harus disiapkan sebelum tenggat.",
  },
  {
    id: "R04",
    kondisi: {
      kepentingan: "Tinggi",
      urgensi: ["Sedang", "Tinggi"],
      jenis: "Kebutuhan",
      dampak: ["Sedang", "Rendah", "Tinggi"],
      kaitan: ["Tinggi", "Sedang", "Rendah"],
    },
    hasil: "P2",
    deskripsi:
      "Penunjang akademik penting dengan tenggat yang masih agak longgar.",
  },
  {
    id: "R05",
    kondisi: {
      kepentingan: "Sedang",
      urgensi: "Tinggi",
      jenis: "Kebutuhan",
      dampak: "Tinggi",
      kaitan: ["Tinggi", "Sedang", "Rendah"],
    },
    hasil: "P2",
    deskripsi:
      "Mendesak dan terkait kuliah, tetapi tingkat kepentingannya menengah.",
  },
  {
    id: "R06",
    kondisi: {
      kepentingan: ["Tinggi", "Sedang"],
      urgensi: "Rendah",
      jenis: "Kebutuhan",
      dampak: ["Sedang", "Tinggi"],
      kaitan: ["Tinggi", "Sedang"],
    },
    hasil: "P2",
    deskripsi:
      "Persiapan jangka panjang untuk kuliah yang tetap perlu dianggarkan.",
  },
  {
    id: "R07",
    kondisi: {
      kepentingan: ["Sedang", "Rendah", "Tinggi"],
      urgensi: ["Sedang", "Rendah"],
      jenis: "Kebutuhan",
      dampak: ["Sedang", "Tinggi"],
      kaitan: ["Tinggi", "Sedang"],
    },
    hasil: "P3",
    deskripsi:
      "Penunjang kuliah sekunder yang tidak terlalu mendesak.",
  },
  {
    id: "R08",
    kondisi: {
      kepentingan: ["Sedang", "Rendah", "Tinggi"],
      urgensi: ["Rendah", "Sedang", "Tinggi"],
      jenis: "Kebutuhan",
      dampak: ["Rendah", "Sedang", "Tinggi"],
      kaitan: ["Sedang", "Rendah", "Tinggi"],
    },
    hasil: "P3",
    deskripsi:
      "Kebutuhan lain yang tidak memenuhi aturan prioritas lebih tinggi; masih dapat dijadwalkan.",
  },
  {
    id: "R09",
    kondisi: {
      kepentingan: ["Sedang", "Tinggi"],
      urgensi: ["Tinggi", "Sedang", "Rendah"],
      jenis: "Keinginan",
      dampak: ["Rendah", "Sedang"],
      kaitan: ["Rendah", "Sedang", "Tinggi"],
    },
    hasil: "P3",
    deskripsi:
      "Keinginan berdampak rendah atau sedang; bukan prioritas utama.",
  },
  {
    id: "R10",
    kondisi: {
      kepentingan: ["Rendah", "Sedang", "Tinggi"],
      urgensi: "Sedang",
      jenis: "Keinginan",
      dampak: ["Rendah", "Sedang", "Tinggi"],
      kaitan: ["Rendah", "Sedang", "Tinggi"],
    },
    hasil: "P4",
    deskripsi: "Keinginan dengan urgensi sedang yang sebaiknya menunggu dana sisa.",
  },
  {
    id: "R11",
    kondisi: {
      kepentingan: ["Rendah", "Sedang", "Tinggi"],
      urgensi: "Tinggi",
      jenis: "Keinginan",
      dampak: ["Rendah", "Sedang", "Tinggi"],
      kaitan: ["Rendah", "Sedang", "Tinggi"],
    },
    hasil: "P4",
    deskripsi:
      "Keinginan mendesak yang tetap dapat ditunda karena bukan kebutuhan pokok.",
  },
  {
    id: "R12",
    kondisi: {
      kepentingan: ["Rendah", "Sedang"],
      urgensi: "Rendah",
      jenis: "Keinginan",
      dampak: ["Rendah", "Tinggi"],
      kaitan: ["Rendah", "Sedang", "Tinggi"],
    },
    hasil: "P4",
    deskripsi:
      "Keinginan tersier berurgensi rendah yang bisa dibatalkan jika anggaran menipis.",
  },
];

if (typeof window !== "undefined") {
  window.SAKU_RULES = SAKU_RULES;
}
if (typeof globalThis !== "undefined") {
  globalThis.SAKU_RULES = SAKU_RULES;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = SAKU_RULES;
}
