/**
 * UJI SISTEM PENILAIAN PRIORITAS — SAKU MAHASISWA
 * Jalankan: node tests/uji-penilaian.js
 */
"use strict";

const path = require("path");
const P = require(path.join(__dirname, "..", "js", "penilaian.js"));

let lulus = 0;
let gagal = 0;

function uji(nama, aktual, harapan) {
  const ok = JSON.stringify(aktual) === JSON.stringify(harapan);
  if (ok) {
    lulus += 1;
    console.log(`  ✔ LULUS  ${nama}  →  ${JSON.stringify(aktual)}`);
  } else {
    gagal += 1;
    console.log(`  ✘ GAGAL  ${nama}`);
    console.log(`           diharapkan ${JSON.stringify(harapan)}, didapat ${JSON.stringify(aktual)}`);
  }
}

function fakta(kepentingan, urgensi, kaitan) {
  return { kepentingan, urgensi, kaitan };
}

console.log("============================================================");
console.log(" PENGUJIAN SISTEM PENILAIAN SAKU MAHASISWA");
console.log(" Bobot: kebutuhan 35% | urgensi 30% | manfaat 25% | harga 10%");
console.log("============================================================\n");

console.log("A. VALIDASI KONFIGURASI");
uji("Jumlah kategori adalah 9", P.KATEGORI.length, 9);
uji("ID kategori unik", new Set(P.KATEGORI.map((k) => k.id)).size, 9);
uji(
  "Total bobot adalah 100%",
  P.BOBOT.kebutuhan + P.BOBOT.urgensi + P.BOBOT.manfaat + P.BOBOT.harga,
  100
);
uji(
  "Semua kategori wajib yang diminta tersedia",
  ["UKT Perkuliahan", "Uang Makan", "Uang Transportasi", "Bayar Kos"].every((nama) =>
    P.KATEGORI.some((k) => k.nama === nama && k.wajib)
  ),
  true
);
uji(
  "Kategori Skincare tersedia dan tidak wajib",
  (() => {
    const k = P.KATEGORI.find((item) => item.nama === "Skincare (Perempuan)");
    return k ? { ada: true, wajib: k.wajib } : { ada: false, wajib: null };
  })(),
  { ada: true, wajib: false }
);

console.log("\nB. PEMETAAN KATEGORI");
uji("Alias SPP dikenali sebagai UKT", P.cariKategori("Bayar SPP semester").id, "ukt");
uji("Alias kos dikenali sebagai Bayar Kos", P.cariKategori("sewa kos bulanan").id, "kos");
uji("Kebutuhan manual tidak dipaksa masuk kategori", P.cariKategori("Jaket edisi terbatas"), null);
uji(
  "Kategori khusus dipakai untuk kebutuhan manual",
  P.resolveKategori({ nama: "Jaket edisi terbatas" }).id,
  "khusus"
);

console.log("\nC. PERHITUNGAN SKOR DASAR");
const ukt = {
  nama: "UKT Perkuliahan",
  nominal: 5000000,
  dana: 6000000,
  fakta: fakta("Tinggi", "Tinggi", "Tinggi"),
};
const nonton = {
  nama: "Nonton bioskop",
  nominal: 60000,
  dana: 300000,
  fakta: fakta("Rendah", "Sedang", "Rendah"),
};
const skorUkt = P.hitungSkor(ukt);
const skorNonton = P.hitungSkor(nonton);

uji("Skor UKT berada di rentang 0–100", skorUkt.total >= 0 && skorUkt.total <= 100, true);
uji("UKT ditandai kebutuhan wajib", skorUkt.wajib, true);
uji(
  "Tingkat kebutuhan wajib minimal 90",
  skorUkt.komponen.kebutuhan.nilai >= P.SKOR_WAJIB_MINIMAL,
  true
);
uji(
  "Total sama dengan jumlah kontribusi berbobot",
  skorUkt.total,
  Math.round(
    ((skorUkt.komponen.kebutuhan.nilai * 35 +
      skorUkt.komponen.urgensi.nilai * 30 +
      skorUkt.komponen.manfaat.nilai * 25 +
      skorUkt.komponen.harga.nilai * 10) /
      100) *
      10
  ) / 10
);

console.log("\nD. KESESUAIAN HARGA");
uji("Tanpa dana, harga dinilai netral", P.skorKesesuaianHarga(100000, null), P.SKOR_HARGA_NETRAL);
uji("Harga 5% dari dana mendapat skor tertinggi", P.skorKesesuaianHarga(50000, 1000000), 100);
uji("Harga 20% dari dana", P.skorKesesuaianHarga(200000, 1000000), 85);
uji("Harga 45% dari dana", P.skorKesesuaianHarga(450000, 1000000), 70);
uji("Harga 70% dari dana", P.skorKesesuaianHarga(700000, 1000000), 55);
uji("Harga 80% dari dana", P.skorKesesuaianHarga(800000, 1000000), 40);
uji("Harga sama dengan dana", P.skorKesesuaianHarga(1000000, 1000000), 40);
uji("Harga melebihi dana", P.skorKesesuaianHarga(1500000, 1000000), 20);

console.log("\nE. BUKAN SEKADAR HARGA MURAH");
const murah = {
  id: "murah",
  priority: "P4",
  nama: "Nonton bioskop",
  nominal: 60000,
  dana: 300000,
  fakta: fakta("Rendah", "Sedang", "Rendah"),
};
const mahalPenting = {
  id: "mahal",
  priority: "P1",
  nama: "UKT Perkuliahan",
  nominal: 5000000,
  dana: 6000000,
  fakta: fakta("Tinggi", "Tinggi", "Tinggi"),
};
const urutan = P.bandingkan([murah, mahalPenting]);
uji(
  "Kebutuhan wajib yang lebih mahal tetap di urutan pertama",
  urutan.map((item) => item.id),
  ["mahal", "murah"]
);

console.log("\nF. ALASAN DAN REKOMENDASI");
const alasan = P.alasan(urutan[0], urutan);
uji("Alasan memuat skor", alasan.includes("skor"), true);
uji("Alasan menyebut kebutuhan wajib", alasan.includes("kebutuhan wajib"), true);
const saran = P.rekomendasi(urutan);
uji("Rekomendasi memilih skor tertinggi", saran.utama.id, "mahal");
uji("Alasan rekomendasi tersedia", typeof saran.alasan === "string" && saran.alasan.length > 20, true);

console.log("\nG. KONSISTENSI DATA LAMA");
const lama = {
  nama: "Bayar Kos",
  nominal: null,
  fakta: fakta("Sedang", "Tinggi", "Sedang"),
};
const skorLama = P.hitungSkor(lama);
uji("Data tanpa nominal tetap mendapat skor", Number.isFinite(skorLama.total), true);
uji("Kategori kos dikenali dari nama", skorLama.kategoriId, "kos");
uji("Harga netral saat nominal kosong", skorLama.komponen.harga.netral, true);

const total = lulus + gagal;
console.log("\n============================================================");
console.log(` HASIL AKHIR PENILAIAN: ${lulus}/${total} pengujian lulus, ${gagal} gagal.`);
console.log("============================================================");

if (gagal > 0) process.exitCode = 1;
