/**
 * UJI LOGIKA MESIN INFERENSI — SAKU MAHASISWA
 * Jalankan dari folder proyek:  node tests/uji-logika.js
 */
"use strict";

const path = require("path");
const RULES = require(path.join(__dirname, "..", "js", "rules.js"));
const { cocokkanAturan, infer } = require(path.join(__dirname, "..", "js", "engine.js"));

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

function faktaDariAturan(aturan, pilihanArray = 0) {
  return Object.fromEntries(
    Object.entries(aturan.kondisi).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[pilihanArray] : value,
    ])
  );
}

console.log("============================================================");
console.log(" PENGUJIAN LOGIKA SAKU MAHASISWA");
console.log(" Basis pengetahuan :", RULES.length, "aturan");
console.log(" Metode            : forward chaining + resolusi prioritas");
console.log("============================================================\n");

/* ---------- Validasi struktur basis pengetahuan ---------- */
console.log("A. VALIDASI BASIS PENGETAHUAN");
uji("Jumlah aturan adalah 12", RULES.length, 12);
uji("ID aturan unik", new Set(RULES.map((r) => r.id)).size, 12);
uji(
  "Semua aturan memiliki 5 kondisi",
  RULES.every((r) => Object.keys(r.kondisi).length === 5),
  true
);
uji(
  "Semua hasil berada pada P1–P4",
  [...new Set(RULES.map((r) => r.hasil))].sort(),
  ["P1", "P2", "P3", "P4"]
);

const NILAI_INDIKATOR = {
  kepentingan: ["Rendah", "Sedang", "Tinggi"],
  urgensi: ["Rendah", "Sedang", "Tinggi"],
  jenis: ["Kebutuhan", "Keinginan"],
  dampak: ["Rendah", "Sedang", "Tinggi"],
  kaitan: ["Rendah", "Sedang", "Tinggi"],
};
const KUNCI_INDIKATOR = Object.keys(NILAI_INDIKATOR);
let totalKombinasi = 0;
let kombinasiCocok = 0;
let totalKebutuhan = 0;
let kebutuhanCocok = 0;

function hitungCakupan(index, fakta) {
  if (index === KUNCI_INDIKATOR.length) {
    totalKombinasi += 1;
    const hasil = infer(fakta, RULES);
    const kebutuhan = fakta.jenis === "Kebutuhan";
    if (kebutuhan) totalKebutuhan += 1;
    if (hasil.status === "cocok") {
      kombinasiCocok += 1;
      if (kebutuhan) kebutuhanCocok += 1;
    }
    return;
  }

  const kunci = KUNCI_INDIKATOR[index];
  NILAI_INDIKATOR[kunci].forEach((nilai) => {
    hitungCakupan(index + 1, { ...fakta, [kunci]: nilai });
  });
}

hitungCakupan(0, {});
uji(
  "Cakupan fakta lengkap minimal 90%",
  kombinasiCocok / totalKombinasi >= 0.9,
  true
);
uji(
  "Seluruh kombinasi kebutuhan lengkap menghasilkan keputusan",
  kebutuhanCocok,
  totalKebutuhan
);

/* ---------- 12 kasus, satu per aturan ---------- */
console.log("\nB. SATU KASUS UNTUK SETIAP ATURAN");
RULES.forEach((aturan) => {
  const fakta = faktaDariAturan(aturan);
  const hasil = infer(fakta, RULES);
  uji(
    `${aturan.id} → ${aturan.hasil} (${aturan.deskripsi})`,
    {
      status: hasil.status,
      id: hasil.aturan ? hasil.aturan.id : null,
      prioritas: hasil.aturan ? hasil.aturan.hasil : null,
    },
    { status: "cocok", id: aturan.id, prioritas: aturan.hasil }
  );
});

/* ---------- Kondisi array R02 ---------- */
console.log("\nC. PENGUJIAN KONDISI NILAI ARRAY (R02)");
["Sedang", "Rendah"].forEach((nilaiKaitan) => {
  const fakta = { ...faktaDariAturan(RULES[1]), kaitan: nilaiKaitan };
  const hasil = infer(fakta, RULES);
  uji(
    `R02 menerima kaitan = ${nilaiKaitan}`,
    { status: hasil.status, id: hasil.aturan && hasil.aturan.id },
    { status: "cocok", id: "R02" }
  );
});

/* ---------- Kasus tanpa aturan cocok ---------- */
console.log("\nD. KASUS TIDAK ADA ATURAN COCOK");
const kasusTidakCocok = [
  {
    nama: "Contoh demo: jaket edisi terbatas",
    fakta: {
      kepentingan: "Rendah",
      urgensi: "Rendah",
      jenis: "Keinginan",
      dampak: "Sedang",
      kaitan: "Rendah",
    },
  },
  {
    nama: "Kombinasi tidak terdefinisi #1",
    fakta: {
      kepentingan: "Tinggi",
      urgensi: "Rendah",
      jenis: "Keinginan",
      dampak: "Tinggi",
      kaitan: "Tinggi",
    },
  },
  {
    nama: "Kombinasi tidak terdefinisi #2",
    fakta: {
      kepentingan: "Tinggi",
      urgensi: "Rendah",
      jenis: "Keinginan",
      dampak: "Tinggi",
      kaitan: "Sedang",
    },
  },
  {
    nama: "Fakta tidak lengkap",
    fakta: {
      kepentingan: "Tinggi",
      urgensi: "Tinggi",
    },
  },
];

kasusTidakCocok.forEach(({ nama, fakta }) => {
  const hasil = infer(fakta, RULES);
  uji(nama, { status: hasil.status, aturan: hasil.aturan }, { status: "tidak_cocok", aturan: null });
});

/* ---------- cocokkanAturan secara langsung ---------- */
console.log("\nE. FUNGSI cocokkanAturan()");
uji(
  "Fakta persis cocok dengan R01",
  cocokkanAturan(faktaDariAturan(RULES[0]), RULES[0]),
  true
);
uji(
  "Satu kondisi berbeda membuat aturan tidak cocok",
  cocokkanAturan({ ...faktaDariAturan(RULES[0]), urgensi: "Rendah" }, RULES[0]),
  false
);
uji(
  "Fakta kosong tidak cocok dengan aturan mana pun",
  RULES.some((aturan) => cocokkanAturan({}, aturan)),
  false
);

/* ---------- Resolusi konflik ---------- */
console.log("\nF. RESOLUSI KONFLIK ANTAR-ATURAN");
const faktaKonflik = {
  kepentingan: "Tinggi",
  urgensi: "Tinggi",
  jenis: "Kebutuhan",
  dampak: "Tinggi",
  kaitan: "Tinggi",
};
const basisKonflik = [
  {
    id: "X1",
    kondisi: { ...faktaKonflik },
    hasil: "P4",
    deskripsi: "Aturan simulasi berprioritas rendah.",
  },
  {
    id: "X2",
    kondisi: { ...faktaKonflik },
    hasil: "P1",
    deskripsi: "Aturan simulasi berprioritas tertinggi.",
  },
  {
    id: "X3",
    kondisi: { ...faktaKonflik },
    hasil: "P2",
    deskripsi: "Aturan simulasi berprioritas menengah.",
  },
];
uji(
  "Tiga aturan cocok, P1 dipilih sebagai pemenang",
  (() => {
    const hasil = infer(faktaKonflik, basisKonflik);
    return { status: hasil.status, id: hasil.aturan && hasil.aturan.id, hasil: hasil.aturan && hasil.aturan.hasil };
  })(),
  { status: "cocok", id: "X2", hasil: "P1" }
);
uji(
  "Tanpa aturan P1, P2 mengalahkan P4",
  (() => {
    const hasil = infer(faktaKonflik, [basisKonflik[0], basisKonflik[2]]);
    return { status: hasil.status, id: hasil.aturan && hasil.aturan.id, hasil: hasil.aturan && hasil.aturan.hasil };
  })(),
  { status: "cocok", id: "X3", hasil: "P2" }
);

/* ---------- Ringkasan ---------- */
const total = lulus + gagal;
console.log("\n============================================================");
console.log(` HASIL AKHIR: ${lulus}/${total} pengujian lulus, ${gagal} gagal.`);
console.log("============================================================");

if (gagal > 0) process.exitCode = 1;
