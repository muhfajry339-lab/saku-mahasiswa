/**
 * MESIN INFERENSI — FORWARD CHAINING
 * ----------------------------------
 * Alur penalaran:
 *   1. Fakta (5 indikator) sudah dikumpulkan dari formulir pengguna.
 *   2. Setiap aturan pada basis pengetahuan diperiksa satu per satu.
 *   3. Aturan dianggap cocok bila SEMUA kondisi indikatornya terpenuhi.
 *      - Kondisi berupa nilai tunggal  -> fakta harus sama persis.
 *      - Kondisi berupa array          -> fakta cukup salah satu anggotanya.
 *   4. Kumpulan aturan yang cocok menjadi kandidat kesimpulan.
 *   5. Bila lebih dari satu aturan cocok, dipilih prioritas tertinggi
 *      (P1 paling tinggi, lalu P2, P3, P4).
 *   6. Jika tidak ada yang cocok, mesin mengembalikan status "tidak_cocok"
 *      dan TIDAK menebak hasil.
 *
 * Fungsi utama:
 *   cocokkanAturan(fakta, aturan) -> boolean
 *   infer(fakta, daftarAturan?)   -> { status, aturan }
 */

const URUTAN_PRIORITAS = { P1: 1, P2: 2, P3: 3, P4: 4 };

function cocokkanAturan(fakta, aturan) {
  if (!fakta || !aturan || !aturan.kondisi) return false;

  // Forward chaining: cocokkan fakta dengan setiap kondisi aturan.
  return Object.keys(aturan.kondisi).every((indikator) => {
    const syarat = aturan.kondisi[indikator];
    const nilaiFakta = fakta[indikator];

    // Kondisi boleh berisi beberapa nilai yang dapat diterima.
    if (Array.isArray(syarat)) {
      return syarat.includes(nilaiFakta);
    }

    return syarat === nilaiFakta;
  });
}

function infer(fakta, daftarAturan) {
  // Gunakan parameter (untuk pengujian), basis global di browser, atau
  // modul rules.js ketika dijalankan dengan Node.
  let basis = daftarAturan;
  if (!basis && typeof SAKU_RULES !== "undefined") basis = SAKU_RULES;
  if (!basis && typeof require === "function") {
    try {
      basis = require("./rules.js");
    } catch (error) {
      basis = [];
    }
  }
  basis = basis || [];

  const kandidat = basis.filter((aturan) => cocokkanAturan(fakta, aturan));

  if (kandidat.length === 0) {
    return { status: "tidak_cocok", aturan: null };
  }

  // Resolusi konflik: prioritas tertinggi menang.
  kandidat.sort(
    (a, b) =>
      (URUTAN_PRIORITAS[a.hasil] || 99) - (URUTAN_PRIORITAS[b.hasil] || 99)
  );

  return { status: "cocok", aturan: kandidat[0] };
}

if (typeof window !== "undefined") {
  window.cocokkanAturan = cocokkanAturan;
  window.infer = infer;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { cocokkanAturan, infer, URUTAN_PRIORITAS };
}
