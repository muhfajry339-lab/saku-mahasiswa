/**
 * UJI ASAP ANTARMUKA — SAKU MAHASISWA (v1.1)
 * Memerlukan paket pengembangan jsdom (tidak dipakai aplikasi saat dibuka).
 * Jalankan: node tests/uji-ui.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const root = path.join(__dirname, "..");
const errors = [];
let lulus = 0;
let gagal = 0;

function cek(nama, kondisi, detail = "") {
  if (kondisi) {
    lulus += 1;
    console.log(`  ✔ LULUS  ${nama}`);
  } else {
    gagal += 1;
    console.log(`  ✘ GAGAL  ${nama}${detail ? ` — ${detail}` : ""}`);
  }
}

function tunggu(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

/* Sunting HTML agar seluruh skrip lokal dieksekusi inline oleh jsdom. */
let html = baca("index.html");
html = html.replace(
  '<script src="js/rules.js"></script>',
  () => `<script>${baca("js/rules.js")}</script>`
);
html = html.replace(
  '<script src="js/penilaian.js"></script>',
  () => `<script>${baca("js/penilaian.js")}</script>`
);
html = html.replace(
  '<script src="js/engine.js"></script>',
  () => `<script>${baca("js/engine.js")}</script>`
);
html = html.replace(
  '<script src="js/app.js"></script>',
  () => `<script>${baca("js/app.js")}</script>`
);
html = html.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, "");
html = html.replace(/<link rel="stylesheet" href="css\/style\.css">\s*/, "");

const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => errors.push(`jsdomError: ${error.message}`));
virtualConsole.on("error", (...args) => errors.push(`console.error: ${args.join(" ")}`));

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  url: "http://localhost/index.html",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.scrollTo = () => {};
    window.HTMLElement.prototype.scrollIntoView = function () {};
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          media: "",
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() { return false; },
        };
      };
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.confirm = () => true;
    window.addEventListener("error", (event) => errors.push(`window.error: ${event.message}`));

    if (window.HTMLDialogElement) {
      window.HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
        this.setAttribute("open", "");
      };
      window.HTMLDialogElement.prototype.close = function (value) {
        this.returnValue = value || "";
        this.open = false;
        this.removeAttribute("open");
        this.dispatchEvent(new window.Event("close"));
      };
    }
  },
});

const { window } = dom;
const { document } = window;

function klik(elemen) {
  if (!elemen) throw new Error("Elemen yang hendak diklik tidak ditemukan.");
  elemen.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
}

function ketik(input, nilai) {
  if (!input) throw new Error("Input yang hendak diisi tidak ditemukan.");
  input.value = nilai;
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
}

function kirimForm() {
  document.querySelector("#form-analisis").dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true })
  );
}

function centang(input) {
  input.checked = true;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
}

async function bukaAnalisis() {
  klik(document.querySelector('.nav-link[data-nav="analisis"]'));
  await tunggu(80);
}

async function bukaRiwayat() {
  klik(document.querySelector('.nav-link[data-nav="riwayat"]'));
  await tunggu(100);
}

async function jalankan() {
  await tunggu(80);

  console.log("A. PEMUATAN AWAL");
  cek("Halaman beranda aktif", document.querySelector(".view.is-active")?.id === "view-beranda");
  cek("Lima kelompok indikator dibuat", document.querySelectorAll(".indicator-group").length === 5);
  cek("Lima contoh kasus tersedia", document.querySelectorAll("[data-example]").length === 5);
  cek("Tombol analisis awalnya nonaktif", document.querySelector("#btn-submit").disabled === true);
  cek("Mesin inferensi global tersedia", typeof window.infer === "function");
  cek("Modul penilaian global tersedia", typeof window.SAKU_PENILAIAN === "object");
  cek("Daftar kategori awal tertutup", document.querySelector("#daftar-kebutuhan").hidden === true);

  console.log("\nB. COMBOBOX KATEGORI");
  klik(document.querySelector("#combobox-toggle"));
  cek("Dropdown kategori terbuka", document.querySelector("#daftar-kebutuhan").hidden === false);
  cek("Sembilan kategori tampil", document.querySelectorAll("#daftar-kebutuhan .combobox-option").length === 9);
  klik(document.querySelector("#combobox-toggle"));
  cek("Dropdown dapat ditutup", document.querySelector("#daftar-kebutuhan").hidden === true);

  const namaInput = document.querySelector("#nama-pengeluaran");
  ketik(namaInput, "kos");
  cek("Pencarian kategori menyaring daftar", document.querySelectorAll("#daftar-kebutuhan .combobox-option").length >= 1);
  klik(document.querySelector('#daftar-kebutuhan [data-kategori="kos"]'));
  cek("Kategori terpilih mengisi input", namaInput.value === "Bayar Kos");
  cek(
    "Petunjuk menandai kebutuhan wajib",
    (document.querySelector("#kategori-terpilih")?.textContent || "").includes("Kebutuhan wajib")
  );

  ketik(namaInput, "Cetak skripsi");
  cek(
    "Input manual dikenali sebagai kebutuhan khusus",
    (document.querySelector("#kategori-terpilih")?.textContent || "").includes("Kebutuhan khusus")
  );
  klik(document.querySelector("#btn-reset"));
  await tunggu(20);
  cek("Reset mengosongkan kebutuhan", namaInput.value === "");

  console.log("\nC. CONTOH KASUS, SKOR, DAN AUTO-SAVE");
  klik(document.querySelector("#btn-contoh"));
  cek("Panel contoh kasus terbuka", document.querySelector("#panel-contoh").hidden === false);
  klik(document.querySelector('[data-example="0"]'));
  await tunggu(30);
  cek("Formulir terisi nama contoh", namaInput.value === "Bayar SPP semester");
  cek("Nominal contoh terisi", document.querySelector("#nominal").value === "5.000.000");
  cek("Dana tersedia contoh terisi", document.querySelector("#dana").value === "6.000.000");
  cek(
    "Kategori contoh terdeteksi UKT",
    (document.querySelector("#kategori-terpilih")?.textContent || "").includes("UKT")
  );
  cek(
    "Kelima indikator terpilih",
    ["kepentingan", "urgensi", "jenis", "dampak", "kaitan"].every(
      (key) => document.querySelector(`input[name="${key}"]:checked`)
    )
  );
  cek("Tombol analisis aktif setelah data lengkap", document.querySelector("#btn-submit").disabled === false);

  kirimForm();
  await tunggu(750);
  cek("Berpindah ke halaman hasil", window.location.hash === "#hasil");
  cek("Kesimpulan P1 tampil", Boolean(document.querySelector("#hasil-content .priority-p1")));
  cek(
    "Aturan pendukung R01 ditampilkan",
    (document.querySelector("#hasil-content .rule-id")?.textContent || "").includes("R01")
  );
  cek("Panel skor otomatis tampil", Boolean(document.querySelector("#hasil-content .score-panel")));
  cek(
    "Skor UKT contoh adalah 94",
    (document.querySelector("#hasil-content .score-total strong")?.textContent || "").trim() === "94"
  );
  cek(
    "Kategori tampil di ringkasan hasil",
    (document.querySelector("#hasil-content")?.textContent || "").includes("UKT Perkuliahan")
  );

  const setelahAnalisis = JSON.parse(window.localStorage.getItem("saku-mahasiswa-riwayat-v1") || "[]");
  cek("Hasil tersimpan otomatis di localStorage", setelahAnalisis.length === 1);
  cek("Item riwayat menyimpan skor", setelahAnalisis[0]?.skor?.total === 94);
  cek("Item riwayat menyimpan kategori", setelahAnalisis[0]?.kategoriId === "ukt");
  cek("Item riwayat menyimpan dana", setelahAnalisis[0]?.dana === 6000000);
  cek("Tombol simpan sudah nonaktif karena auto-save", Boolean(document.querySelector('[data-action="save"]:disabled')));

  console.log("\nD. ANALISIS KEDUA");
  await bukaAnalisis();
  klik(document.querySelector("#btn-contoh"));
  klik(document.querySelector('[data-example="1"]'));
  await tunggu(30);
  cek("Contoh kedua terisi", namaInput.value === "Beli buku referensi");
  kirimForm();
  await tunggu(750);
  cek("Kesimpulan P2 tampil", Boolean(document.querySelector("#hasil-content .priority-p2")));
  cek(
    "Dua analisis tersimpan otomatis",
    JSON.parse(window.localStorage.getItem("saku-mahasiswa-riwayat-v1") || "[]").length === 2
  );

  console.log("\nE. RIWAYAT, PERBANDINGAN, DAN HAPUS");
  await bukaRiwayat();
  cek("Halaman riwayat aktif", document.querySelector(".view.is-active")?.id === "view-riwayat");
  cek("Dua item riwayat tampil", document.querySelectorAll(".history-item").length === 2);
  cek("Empat kartu total per prioritas tampil", document.querySelectorAll(".stat-card").length === 4);
  cek("Skor tampil pada setiap item riwayat", document.querySelectorAll(".history-score").length === 2);
  cek("Bar perbandingan tersedia", Boolean(document.querySelector("#compare-bar")));
  cek("Tombol bandingkan awalnya nonaktif", document.querySelector("#btn-bandingkan").disabled === true);

  const kotakPilih = document.querySelectorAll("[data-select]");
  centang(kotakPilih[0]);
  centang(kotakPilih[1]);
  cek(
    "Dua kebutuhan terpilih",
    (document.querySelector("#compare-count")?.textContent || "").includes("2")
  );
  cek("Tombol bandingkan aktif", document.querySelector("#btn-bandingkan").disabled === false);

  klik(document.querySelector("#btn-bandingkan"));
  await tunggu(60);
  cek("Panel perbandingan tampil", document.querySelector("#riwayat-perbandingan").hidden === false);
  cek("Tabel perbandingan berisi dua baris", document.querySelectorAll(".compare-table tbody tr").length === 2);
  cek(
    "Kebutuhan skor tertinggi berada di urutan pertama",
    (document.querySelector(".compare-table tbody tr:first-child .compare-name strong")?.textContent || "").includes(
      "Bayar SPP semester"
    )
  );
  cek(
    "Rekomendasi utama ditampilkan",
    (document.querySelector(".compare-recommend")?.textContent || "").includes("Rekomendasi utama")
  );
  cek("Dua alasan peringkat ditampilkan", document.querySelectorAll(".compare-reason").length === 2);
  cek("Perbandingan otomatis tersimpan", document.querySelectorAll(".saved-comparison-item").length === 1);
  cek(
    "localStorage perbandingan terisi",
    JSON.parse(window.localStorage.getItem("saku-mahasiswa-perbandingan-v1") || "[]").length === 1
  );

  klik(document.querySelector("[data-close-comparison]"));
  await tunggu(20);
  cek("Panel perbandingan dapat ditutup", document.querySelector("#riwayat-perbandingan").hidden === true);

  klik(document.querySelector("[data-open-comparison]"));
  await tunggu(30);
  cek("Perbandingan sebelumnya dapat dibuka", document.querySelector("#riwayat-perbandingan").hidden === false);

  klik(document.querySelector("[data-delete-comparison]"));
  await tunggu(20);
  klik(document.querySelector("#confirm-accept"));
  await tunggu(50);
  cek("Perbandingan tersimpan dapat dihapus", document.querySelector("#saved-comparisons").hidden === true);

  klik(document.querySelector("#btn-hapus-semua"));
  await tunggu(20);
  klik(document.querySelector("#confirm-accept"));
  await tunggu(60);
  cek("Riwayat kosong setelah dihapus semua", document.querySelectorAll(".history-item").length === 0);
  cek("Empty state riwayat tampil", Boolean(document.querySelector(".empty-state")));
  cek(
    "localStorage riwayat ikut dikosongkan",
    JSON.parse(window.localStorage.getItem("saku-mahasiswa-riwayat-v1") || "[]").length === 0
  );

  console.log("\nF. TEMA GELAP");
  klik(document.querySelector("#theme-toggle"));
  cek("Tema gelap aktif", document.documentElement.getAttribute("data-theme") === "dark");
  cek("Preferensi tema tersimpan", window.localStorage.getItem("saku-tema") === "gelap");
  klik(document.querySelector("#theme-toggle"));
  cek("Tema kembali terang", document.documentElement.getAttribute("data-theme") === "light");

  console.log("\nG. KASUS TIDAK ADA ATURAN COCOK");
  await bukaAnalisis();
  klik(document.querySelector("#btn-contoh"));
  klik(document.querySelector('[data-example="4"]'));
  await tunggu(30);
  kirimForm();
  await tunggu(750);
  cek("Hasil tanpa aturan cocok tampil", Boolean(document.querySelector("#hasil-content .no-match")));
  cek(
    "Pesan tidak ditemukan aturan cocok tampil",
    (document.querySelector("#hasil-content")?.textContent || "").includes(
      "Tidak ditemukan aturan yang cocok"
    )
  );
  cek("Skor tetap dihitung saat tanpa aturan", Boolean(document.querySelector("#hasil-content .score-panel")));
  cek("Tombol Ubah Masukan tersedia", Boolean(document.querySelector('[data-action="edit"]')));
  cek("Tidak ada tombol simpan pada kondisi tanpa aturan", !document.querySelector('[data-action="save"]'));

  const tanpaAturan = JSON.parse(window.localStorage.getItem("saku-mahasiswa-riwayat-v1") || "[]");
  cek("Hasil tanpa aturan tetap tersimpan otomatis", tanpaAturan.length === 1);
  cek("Status tanpa aturan tercatat", tanpaAturan[0]?.status === "tidak_cocok");

  await bukaRiwayat();
  cek("Riwayat tanpa aturan ditandai perlu tinjauan", document.querySelectorAll('[data-priority="none"]').length === 1);

  console.log("\nH. VALIDASI KEBUTUHAN WAJIB");
  await bukaAnalisis();
  const formAnalisis = document.querySelector("#form-analisis");
  ketik(namaInput, "");
  cek("Tombol analisis nonaktif saat kebutuhan dikosongkan", document.querySelector("#btn-submit").disabled === true);
  cek(
    "Petunjuk meminta kebutuhan diisi",
    (document.querySelector("#form-hint")?.textContent || "").includes("Kebutuhan masih kosong")
  );
  formAnalisis.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await tunggu(50);
  cek("Submit tanpa kebutuhan tidak berpindah ke hasil", window.location.hash === "#analisis");
  ketik(namaInput, "Uji validasi kebutuhan");
  cek("Tombol analisis aktif setelah kebutuhan diisi", document.querySelector("#btn-submit").disabled === false);

  console.log("\nI. PEMERIKSAAN KONSOL");
  cek("Tidak ada error JavaScript yang tercatat", errors.length === 0, errors.join(" | "));

  console.log("\n============================================================");
  console.log(` HASIL AKHIR UI: ${lulus}/${lulus + gagal} pengujian lulus, ${gagal} gagal.`);
  console.log("============================================================");

  dom.window.close();
  if (gagal > 0) process.exitCode = 1;
}

jalankan().catch((error) => {
  console.error("Uji UI gagal dijalankan:", error);
  process.exitCode = 1;
  dom.window.close();
});
