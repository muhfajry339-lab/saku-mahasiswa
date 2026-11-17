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
      urgensi: "Tinggi",
      jenis: "Kebutuhan",
      dampak: "Tinggi",
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
      urgensi: "Sedang",
      jenis: "Kebutuhan",
      dampak: "Tinggi",
      kaitan: "Tinggi",
    },
    hasil: "P1",
    deskripsi:
      "Penunjang kuliah penting yang harus disiapkan sebelum tenggat.",
  },
  {
    id: "R04",
    kondisi: {
      kepentingan: "Tinggi",
      urgensi: "Sedang",
      jenis: "Kebutuhan",
      dampak: "Sedang",
      kaitan: "Tinggi",
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
      kaitan: "Tinggi",
    },
    hasil: "P2",
    deskripsi:
      "Mendesak dan terkait kuliah, tetapi tingkat kepentingannya menengah.",
  },
  {
    id: "R06",
    kondisi: {
      kepentingan: "Tinggi",
      urgensi: "Rendah",
      jenis: "Kebutuhan",
      dampak: "Sedang",
      kaitan: "Tinggi",
    },
    hasil: "P2",
    deskripsi:
      "Persiapan jangka panjang untuk kuliah yang tetap perlu dianggarkan.",
  },
  {
    id: "R07",
    kondisi: {
      kepentingan: "Sedang",
      urgensi: "Sedang",
      jenis: "Kebutuhan",
      dampak: "Sedang",
      kaitan: "Tinggi",
    },
    hasil: "P3",
    deskripsi:
      "Penunjang kuliah sekunder yang tidak terlalu mendesak.",
  },
  {
    id: "R08",
    kondisi: {
      kepentingan: "Sedang",
      urgensi: "Rendah",
      jenis: "Kebutuhan",
      dampak: "Rendah",
      kaitan: "Sedang",
    },
    hasil: "P3",
    deskripsi:
      "Kebutuhan sehari-hari rutin yang waktunya masih bisa digeser.",
  },
  {
    id: "R09",
    kondisi: {
      kepentingan: "Sedang",
      urgensi: "Tinggi",
      jenis: "Keinginan",
      dampak: "Rendah",
      kaitan: "Rendah",
    },
    hasil: "P3",
    deskripsi:
      "Keinginan sesaat yang mendadak, tetapi minim dampak akademis.",
  },
  {
    id: "R10",
    kondisi: {
      kepentingan: "Rendah",
      urgensi: "Sedang",
      jenis: "Keinginan",
      dampak: "Rendah",
      kaitan: "Rendah",
    },
    hasil: "P4",
    deskripsi: "Hiburan atau rekreasi yang sebaiknya menunggu dana sisa.",
  },
  {
    id: "R11",
    kondisi: {
      kepentingan: "Rendah",
      urgensi: "Tinggi",
      jenis: "Keinginan",
      dampak: "Rendah",
      kaitan: "Rendah",
    },
    hasil: "P4",
    deskripsi:
      "Keinginan konsumtif yang tidak berkaitan dengan kegiatan kuliah.",
  },
  {
    id: "R12",
    kondisi: {
      kepentingan: "Rendah",
      urgensi: "Rendah",
      jenis: "Keinginan",
      dampak: "Rendah",
      kaitan: "Rendah",
    },
    hasil: "P4",
    deskripsi:
      "Tersier/hiburan tidak mendesak yang bisa dibatalkan jika anggaran menipis.",
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
