/**
 * UJI ASAP ANTARMUKA — SAKU MAHASISWA
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

async function jalankan() {
  await tunggu(80);

  console.log("A. PEMUATAN AWAL");
  cek("Halaman beranda aktif", document.querySelector(".view.is-active")?.id === "view-beranda");
  cek("Lima kelompok indikator dibuat", document.querySelectorAll(".indicator-group").length === 5);
  cek("Lima contoh kasus tersedia", document.querySelectorAll("[data-example]").length === 5);
  cek("Tombol analisis awalnya nonaktif", document.querySelector("#btn-submit").disabled === true);
  cek("Mesin inferensi global tersedia", typeof window.infer === "function");

  console.log("\nB. CONTOH KASUS & ANALISIS P1");
  klik(document.querySelector("#btn-contoh"));
  cek("Panel contoh kasus terbuka", document.querySelector("#panel-contoh").hidden === false);
  klik(document.querySelector('[data-example="0"]'));
  await tunggu(30);
  cek("Formulir terisi nama contoh", document.querySelector("#nama-pengeluaran").value === "Bayar SPP semester");
  cek("Nominal contoh tetap terisi", document.querySelector("#nominal").value === "5.000.000");
  cek(
    "Kelima indikator terpilih",
    ["kepentingan", "urgensi", "jenis", "dampak", "kaitan"].every(
      (key) => document.querySelector(`input[name="${key}"]:checked`)
    )
  );
  cek("Tombol analisis aktif setelah data lengkap", document.querySelector("#btn-submit").disabled === false);

  document.querySelector("#form-analisis").dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true })
  );
  await tunggu(750);
  cek("Berpindah ke halaman hasil", window.location.hash === "#hasil");
  cek("Kesimpulan P1 tampil", Boolean(document.querySelector("#hasil-content .priority-p1")));
  cek(
    "Aturan pendukung R01 ditampilkan",
    (document.querySelector("#hasil-content .rule-id")?.textContent || "").includes("R01")
  );
  cek(
    "Judul Aturan yang Digunakan tampil",
    (document.querySelector("#hasil-content")?.textContent || "").includes("Aturan yang Digunakan")
  );
  cek(
    "Ringkasan masukan pengguna tampil",
    (document.querySelector("#hasil-content")?.textContent || "").includes("Ringkasan masukan pengguna")
  );

  console.log("\nC. SIMPAN & RIWAYAT");
  klik(document.querySelector('[data-action="save"]'));
  await tunggu(50);
  const tersimpan = JSON.parse(window.localStorage.getItem("saku-mahasiswa-riwayat-v1") || "[]");
  cek("Hasil tersimpan di localStorage", tersimpan.length === 1 && tersimpan[0].priority === "P1");
  cek("Tombol simpan berubah menjadi tersimpan", Boolean(document.querySelector('[data-action="save"]:disabled')));

  klik(document.querySelector('.nav-link[data-nav="riwayat"]'));
  await tunggu(100);
  cek("Halaman riwayat aktif", document.querySelector(".view.is-active")?.id === "view-riwayat");
  cek("Satu item riwayat tampil", document.querySelectorAll(".history-item").length === 1);
  cek("Empat kartu total per prioritas tampil", document.querySelectorAll(".stat-card").length === 4);

  console.log("\nD. HAPUS RIWAYAT");
  klik(document.querySelector("[data-delete]"));
  await tunggu(20);
  cek("Dialog konfirmasi terbuka", document.querySelector("#confirm-dialog").open === true);
  klik(document.querySelector("#confirm-accept"));
  await tunggu(50);
  cek("Riwayat kosong setelah dihapus", document.querySelectorAll(".history-item").length === 0);
  cek("Empty state riwayat tampil", Boolean(document.querySelector(".empty-state")));
  cek("localStorage ikut dikosongkan", JSON.parse(window.localStorage.getItem("saku-mahasiswa-riwayat-v1")).length === 0);

  console.log("\nE. TEMA GELAP");
  klik(document.querySelector("#theme-toggle"));
  cek("Tema gelap aktif", document.documentElement.getAttribute("data-theme") === "dark");
  cek("Preferensi tema tersimpan", window.localStorage.getItem("saku-tema") === "gelap");
  klik(document.querySelector("#theme-toggle"));
  cek("Tema kembali terang", document.documentElement.getAttribute("data-theme") === "light");

  console.log("\nF. KASUS TIDAK ADA ATURAN COCOK");
  klik(document.querySelector('.nav-link[data-nav="analisis"]'));
  await tunggu(80);
  klik(document.querySelector("#btn-contoh"));
  klik(document.querySelector('[data-example="4"]'));
  await tunggu(30);
  document.querySelector("#form-analisis").dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true })
  );
  await tunggu(750);
  cek("Hasil tanpa aturan cocok tampil", Boolean(document.querySelector("#hasil-content .no-match")));
  cek(
    "Pesan tidak ditemukan aturan cocok tampil",
    (document.querySelector("#hasil-content")?.textContent || "").includes(
      "Tidak ditemukan aturan yang cocok"
    )
  );
  cek("Tombol Ubah Masukan tersedia", Boolean(document.querySelector('[data-action="edit"]')));
  cek("Tidak ada tombol simpan pada kondisi tanpa aturan", !document.querySelector('[data-action="save"]'));

  console.log("\nG. VALIDASI NAMA WAJIB");
  klik(document.querySelector('.nav-link[data-nav="analisis"]'));
  await tunggu(80);
  const namaInput = document.querySelector("#nama-pengeluaran");
  const formAnalisis = document.querySelector("#form-analisis");
  namaInput.value = "";
  namaInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  cek("Tombol analisis nonaktif saat nama dikosongkan", document.querySelector("#btn-submit").disabled === true);
  cek(
    "Petunjuk meminta nama pengeluaran",
    (document.querySelector("#form-hint")?.textContent || "").includes("Nama pengeluaran masih kosong")
  );
  formAnalisis.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await tunggu(50);
  cek("Submit tanpa nama tidak berpindah ke hasil", window.location.hash === "#analisis");
  namaInput.value = "Uji validasi nama";
  namaInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  cek("Tombol analisis aktif setelah nama diisi", document.querySelector("#btn-submit").disabled === false);

  console.log("\nH. PEMERIKSAAN KONSOL");
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
