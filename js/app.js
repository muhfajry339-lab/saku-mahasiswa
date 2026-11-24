/**
 * ANTARMUKA APLIKASI — SAKU MAHASISWA
 * -----------------------------------
 * Mengatur navigasi, formulir lima indikator, pemanggilan mesin inferensi,
 * render hasil, penyimpanan riwayat di localStorage, serta tema terang/gelap.
 */
(function () {
  "use strict";

  /* ======================================================================
     1. KONFIGURASI & KONSTANTA
     ====================================================================== */

  const STORAGE_KEY = "saku-mahasiswa-riwayat-v1";
  const COMPARISON_KEY = "saku-mahasiswa-perbandingan-v1";
  const THEME_KEY = "saku-tema";
  const MAX_HISTORY = 100;
  const MAX_COMPARISONS = 30;

  const PRIORITAS = {
    P1: {
      kode: "P1",
      nama: "Sangat Prioritas",
      ikon: "i-flame",
      ringkas: "Wajib didahulukan",
      lead: (nama) =>
        `${nama} berada di jalur paling mendesak. Alokasikan dana untuk pengeluaran ini sebelum pengeluaran lainnya.`,
      alasan:
        "Kombinasi indikator menunjukkan kebutuhan pokok atau akademik yang sangat mendesak dan berdampak besar jika ditunda.",
      rekomendasi: [
        "Bayar atau penuhi pengeluaran ini lebih dulu sebelum pengeluaran lain.",
        "Gunakan dana utama atau dana darurat bila nominalnya mendesak.",
        "Tunda pengeluaran P3 dan P4 sampai kebutuhan ini selesai.",
        "Catat pembayaran agar sisa anggaran bulan ini tetap terpantau.",
      ],
    },
    P2: {
      kode: "P2",
      nama: "Prioritas",
      ikon: "i-trending",
      ringkas: "Rencanakan segera",
      lead: (nama) =>
        `${nama} penting untuk menunjang aktivitasmu. Jadwalkan pembayarannya dalam waktu dekat.`,
      alasan:
        "Pengeluaran penting dan perlu disiapkan, tetapi masih ada ruang waktu untuk mengatur anggaran.",
      rekomendasi: [
        "Sisihkan dana khusus untuk pengeluaran ini pada anggaran terdekat.",
        "Tentukan tenggat pribadi agar tidak berubah menjadi kebutuhan mendesak.",
        "Bandingkan harga atau cari alternatif yang tetap menunjang kebutuhan.",
        "Pantau sisa dana setelah kebutuhan P1 terpenuhi.",
      ],
    },
    P3: {
      kode: "P3",
      nama: "Prioritas Rendah",
      ikon: "i-layers",
      ringkas: "Bisa digeser",
      lead: (nama) =>
        `${nama} masih bisa digeser. Utamakan kebutuhan yang lebih mendesak lebih dahulu.`,
      alasan:
        "Pengeluaran masih relevan, tetapi tingkat kepentingan atau dampaknya tidak sebesar P1 dan P2.",
      rekomendasi: [
        "Masukkan pengeluaran ini ke daftar setelah kebutuhan P1 dan P2.",
        "Cari alternatif yang lebih hemat atau tunda beberapa waktu.",
        "Gunakan dana sisa bulanan bila sudah tersedia.",
        "Evaluasi kembali bila kondisi atau tenggat berubah.",
      ],
    },
    P4: {
      kode: "P4",
      nama: "Dapat Ditunda",
      ikon: "i-leaf",
      ringkas: "Tunda bila perlu",
      lead: (nama) =>
        `${nama} sebaiknya ditunda. Penuhi dulu kebutuhan pokok dan akademik yang lebih penting.`,
      alasan:
        "Pengeluaran bersifat keinginan atau tersier dengan dampak rendah terhadap kebutuhan dasar dan perkuliahan.",
      rekomendasi: [
        "Tunda pembelian sampai kebutuhan P1–P3 terpenuhi.",
        "Gunakan hanya dana sisa yang tidak mengganggu kebutuhan pokok.",
        "Pertimbangkan kembali apakah pengeluaran ini benar-benar dibutuhkan.",
        "Alihkan dana ke tabungan atau kebutuhan darurat bila memungkinkan.",
      ],
    },
  };

  const INDIKATOR = [
    {
      key: "kepentingan",
      label: "Kepentingan",
      ikon: "i-target",
      pertanyaan: "Seberapa penting pengeluaran ini bagi hidup dan studimu?",
      opsi: [
        { nilai: "Rendah", ikon: "i-level-low", deskripsi: "Bisa ditunda tanpa mengganggu studi." },
        { nilai: "Sedang", ikon: "i-level-mid", deskripsi: "Penting, tetapi masih ada alternatif." },
        { nilai: "Tinggi", ikon: "i-level-high", deskripsi: "Sangat penting dan sulit digantikan." },
      ],
    },
    {
      key: "urgensi",
      label: "Urgensi",
      ikon: "i-clock",
      pertanyaan: "Seberapa cepat pengeluaran ini harus dilakukan?",
      opsi: [
        { nilai: "Rendah", ikon: "i-level-low", deskripsi: "Masih longgar, lebih dari sebulan." },
        { nilai: "Sedang", ikon: "i-level-mid", deskripsi: "Perlu dalam beberapa pekan." },
        { nilai: "Tinggi", ikon: "i-level-high", deskripsi: "Harus segera, pekan ini." },
      ],
    },
    {
      key: "jenis",
      label: "Jenis Pengeluaran",
      ikon: "i-bag",
      pertanyaan: "Pengeluaran ini termasuk kebutuhan atau keinginan?",
      opsi: [
        { nilai: "Kebutuhan", ikon: "i-bag", deskripsi: "Menunjang kebutuhan dasar atau kuliah." },
        { nilai: "Keinginan", ikon: "i-cart", deskripsi: "Menyenangkan, tetapi tidak wajib." },
      ],
    },
    {
      key: "dampak",
      label: "Dampak Jika Tidak Dibayar",
      ikon: "i-shield",
      pertanyaan: "Apa dampaknya jika pengeluaran ini tidak dibayar?",
      opsi: [
        { nilai: "Rendah", ikon: "i-level-low", deskripsi: "Hampir tidak mengganggu aktivitas." },
        { nilai: "Sedang", ikon: "i-level-mid", deskripsi: "Mengganggu sebagian rencana." },
        { nilai: "Tinggi", ikon: "i-level-high", deskripsi: "Menghambat kuliah atau kebutuhan dasar." },
      ],
    },
    {
      key: "kaitan",
      label: "Kaitan dengan Aktivitas Kuliah",
      ikon: "i-cap",
      pertanyaan: "Seberapa erat kaitannya dengan aktivitas kuliah?",
      opsi: [
        { nilai: "Rendah", ikon: "i-level-low", deskripsi: "Tidak berkaitan dengan kampus." },
        { nilai: "Sedang", ikon: "i-level-mid", deskripsi: "Mendukung studi secara tidak langsung." },
        { nilai: "Tinggi", ikon: "i-level-high", deskripsi: "Langsung menunjang perkuliahan." },
      ],
    },
  ];

  /**
   * Lima contoh kasus untuk demonstrasi.
   * Empat pertama menghasilkan P1–P4; contoh kelima sengaja tidak cocok.
   */
  const CONTOH_KASUS = [
    {
      nama: "Bayar SPP semester",
      nominal: 5000000,
      dana: 6000000,
      kategoriId: "ukt",
      ikon: "i-cap",
      expected: "P1",
      expectedLabel: "P1 · Sangat Prioritas",
      keterangan: "Kebutuhan akademik mendesak dengan dampak tinggi.",
      fakta: {
        kepentingan: "Tinggi",
        urgensi: "Tinggi",
        jenis: "Kebutuhan",
        dampak: "Tinggi",
        kaitan: "Tinggi",
      },
    },
    {
      nama: "Beli buku referensi",
      nominal: 185000,
      dana: 1000000,
      kategoriId: "peralatan",
      ikon: "i-book",
      expected: "P2",
      expectedLabel: "P2 · Prioritas",
      keterangan: "Penunjang akademik penting dengan tenggat longgar.",
      fakta: {
        kepentingan: "Tinggi",
        urgensi: "Sedang",
        jenis: "Kebutuhan",
        dampak: "Sedang",
        kaitan: "Tinggi",
      },
    },
    {
      nama: "Ganti alat tulis rutin",
      nominal: 35000,
      dana: 500000,
      kategoriId: "peralatan",
      ikon: "i-edit",
      expected: "P3",
      expectedLabel: "P3 · Prioritas Rendah",
      keterangan: "Kebutuhan rutin yang waktunya bisa digeser.",
      fakta: {
        kepentingan: "Sedang",
        urgensi: "Rendah",
        jenis: "Kebutuhan",
        dampak: "Rendah",
        kaitan: "Sedang",
      },
    },
    {
      nama: "Nonton bioskop",
      nominal: 60000,
      dana: 300000,
      kategoriId: "lainnya",
      ikon: "i-sparkle",
      expected: "P4",
      expectedLabel: "P4 · Dapat Ditunda",
      keterangan: "Hiburan yang menunggu dana sisa.",
      fakta: {
        kepentingan: "Rendah",
        urgensi: "Sedang",
        jenis: "Keinginan",
        dampak: "Rendah",
        kaitan: "Rendah",
      },
    },
    {
      nama: "Beli jaket edisi terbatas",
      nominal: 450000,
      dana: 500000,
      kategoriId: "lainnya",
      ikon: "i-help",
      expected: null,
      expectedLabel: "Tidak ada aturan",
      keterangan: "Dampak sedang tidak cocok dengan aturan P4 yang tersedia.",
      fakta: {
        kepentingan: "Rendah",
        urgensi: "Rendah",
        jenis: "Keinginan",
        dampak: "Sedang",
        kaitan: "Rendah",
      },
    },
  ];

  const LABEL_INDIKATOR = {
    kepentingan: "Kepentingan",
    urgensi: "Urgensi",
    jenis: "Jenis",
    dampak: "Dampak",
    kaitan: "Kaitan kuliah",
  };

  const VALID_VIEWS = ["beranda", "analisis", "hasil", "riwayat", "tentang"];
  const PAGE_TITLES = {
    beranda: "SAKU MAHASISWA — Sistem Pakar Prioritas Pengeluaran",
    analisis: "Analisis Prioritas — SAKU MAHASISWA",
    hasil: "Hasil Analisis — SAKU MAHASISWA",
    riwayat: "Riwayat Analisis — SAKU MAHASISWA",
    tentang: "Tentang Metode — SAKU MAHASISWA",
  };

  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    currentView: "beranda",
    currentResult: null,
    saved: false,
    history: [],
    historyFilter: "Semua",
    selectedHistory: new Set(),
    comparisons: [],
    comparisonItems: null,
    comparisonRecordId: null,
    selectedKategori: null,
    comboboxItems: [],
    comboboxIndex: -1,
    menuOpen: false,
    analyzing: false,
  };

  let toastTimer = null;
  let confirmResolver = null;

  /* ======================================================================
     2. UTILITAS
     ====================================================================== */

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const icon = (name, extraClass = "") =>
    `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#${name}"></use></svg>`;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatRupiah(value) {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return "Rp" + new Intl.NumberFormat("id-ID").format(number);
  }

  function formatTanggal(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Waktu tidak diketahui";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function isPriority(value) {
    return Object.prototype.hasOwnProperty.call(PRIORITAS, value);
  }

  function penilaianAPI() {
    return window.SAKU_PENILAIAN || null;
  }

  function daftarKategori() {
    const api = penilaianAPI();
    return api && Array.isArray(api.KATEGORI) ? api.KATEGORI : [];
  }

  function hitungSkorItem(item) {
    const api = penilaianAPI();
    if (!api || typeof api.hitungSkor !== "function") return null;
    return api.hitungSkor(item);
  }

  function formatSkor(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return number.toLocaleString("id-ID", {
      minimumFractionDigits: Number.isInteger(number) ? 0 : 1,
      maximumFractionDigits: 1,
    });
  }

  function labelUrgensi(value) {
    return value || "—";
  }

  function prefersReducedMotion() {
    return REDUCED_MOTION;
  }

  function showToast(message, type = "success") {
    const toast = $("#toast");
    if (!toast) return;
    toast.classList.toggle("is-error", type === "error");
    toast.innerHTML = `${icon(type === "error" ? "i-info" : "i-check-circle")}<span>${escapeHtml(message)}</span>`;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3400);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  /* ======================================================================
     3. TEMA TERANG / GELAP
     ====================================================================== */

  function applyTheme(theme, persist = true) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    const toggle = $("#theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap");
      toggle.title = isDark ? "Mode terang" : "Mode gelap";
    }

    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", isDark ? "#061512" : "#0F9D8A");

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, isDark ? "gelap" : "terang");
      } catch (error) {
        /* Penyimpanan tema tidak tersedia; tema tetap berfungsi untuk sesi ini. */
      }
    }
  }

  function initTheme() {
    const initial = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(initial, false);

    const toggle = $("#theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      showToast(next === "dark" ? "Mode gelap diaktifkan." : "Mode terang diaktifkan.");
    });
  }

  /* ======================================================================
     4. NAVIGASI & MENU
     ====================================================================== */

  function readViewFromHash() {
    const raw = window.location.hash.replace(/^#\/?/, "").trim().toLowerCase();
    return VALID_VIEWS.includes(raw) ? raw : "beranda";
  }

  function navigate(view) {
    const safeView = VALID_VIEWS.includes(view) ? view : "beranda";
    const target = `#${safeView}`;
    if (window.location.hash === target) {
      showView(safeView);
    } else {
      window.location.hash = target;
    }
  }

  function setMenu(open) {
    const menu = $("#nav-menu");
    const toggle = $("#nav-toggle");
    if (!menu || !toggle) return;

    state.menuOpen = open;
    menu.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
    document.body.classList.toggle("menu-open", open);
  }

  function closeExamplesPanel() {
    const panel = $("#panel-contoh");
    const button = $("#btn-contoh");
    if (!panel || !button) return;
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
  }

  function showView(view) {
    const activeView = VALID_VIEWS.includes(view) ? view : "beranda";
    const viewEl = document.getElementById(`view-${activeView}`);
    if (!viewEl) return;

    $$(".view").forEach((section) => {
      section.classList.toggle("is-active", section === viewEl);
    });

    $$(".nav-link").forEach((link) => {
      const linkView = link.dataset.nav;
      const isActive = linkView === activeView || (activeView === "hasil" && linkView === "analisis");
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    state.currentView = activeView;
    document.body.dataset.view = activeView;
    document.title = PAGE_TITLES[activeView] || PAGE_TITLES.beranda;

    setMenu(false);
    if (activeView !== "analisis") closeExamplesPanel();

    if (activeView === "hasil") renderResult();
    if (activeView === "riwayat") renderHistory();

    requestAnimationFrame(() => {
      scrollToTop();
      const heading = $(`#view-${activeView} h1`);
      if (heading && activeView !== "beranda") {
        heading.setAttribute("tabindex", "-1");
      }
    });
  }

  function handleRoute() {
    let view = readViewFromHash();

    if (view === "hasil" && !state.currentResult) {
      view = "analisis";
      try {
        history.replaceState(null, "", "#analisis");
      } catch (error) {
        window.location.hash = "#analisis";
      }
    }

    showView(view);
  }

  function initNavigation() {
    window.addEventListener("hashchange", handleRoute);

    const toggle = $("#nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => setMenu(!state.menuOpen));
    }

    const menu = $("#nav-menu");
    if (menu) {
      menu.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenu(false);
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.menuOpen) {
        setMenu(false);
        const navToggle = $("#nav-toggle");
        if (navToggle) navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!state.menuOpen) return;
      const header = $("#site-header");
      if (header && !header.contains(event.target)) setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && state.menuOpen) setMenu(false);
    });

    const header = $("#site-header");
    const onScroll = () => {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ======================================================================
     5. FORMULIR ANALISIS
     ====================================================================== */

  function renderIndicators() {
    const container = $("#form-indicators");
    if (!container) return;

    container.innerHTML = INDIKATOR.map((indikator) => {
      const options = indikator.opsi
        .map(
          (opsi) => `
            <label class="option-card">
              <input class="option-input" type="radio" name="${indikator.key}" value="${escapeHtml(opsi.nilai)}" required>
              <span class="option-icon">${icon(opsi.ikon)}</span>
              <span class="option-text">
                <strong>${escapeHtml(opsi.nilai)}</strong>
                <small>${escapeHtml(opsi.deskripsi)}</small>
              </span>
              <span class="option-check">${icon("i-check")}</span>
            </label>`
        )
        .join("");

      return `
        <fieldset class="indicator-group" data-indicator="${indikator.key}">
          <legend class="sr-only">${escapeHtml(indikator.label)}</legend>
          <div class="indicator-head">
            <span class="indicator-icon">${icon(indikator.ikon)}</span>
            <div class="indicator-title">
              <h3>${escapeHtml(indikator.label)}</h3>
              <p>${escapeHtml(indikator.pertanyaan)}</p>
            </div>
            <span class="indicator-state" data-state>Belum diisi</span>
          </div>
          <div class="options-grid ${indikator.opsi.length === 2 ? "options-grid--2" : ""}">
            ${options}
          </div>
        </fieldset>`;
    }).join("");

    container.addEventListener("change", (event) => {
      if (event.target.matches(".option-input")) {
        syncOptionCards();
        updateFormState();
      }
    });
  }

  function renderProgressList() {
    const list = $("#progress-list");
    if (!list) return;

    list.innerHTML = INDIKATOR.map(
      (indikator) => `
        <li class="progress-item" data-progress="${indikator.key}">
          <span class="progress-dot">${icon("i-check")}</span>
          <span>${escapeHtml(indikator.label)}</span>
        </li>`
    ).join("");
  }

  function syncOptionCards() {
    $$(".option-card").forEach((card) => {
      const input = $(".option-input", card);
      card.classList.toggle("is-selected", Boolean(input && input.checked));
    });

    INDIKATOR.forEach((indikator) => {
      const group = $(`.indicator-group[data-indicator="${indikator.key}"]`);
      if (!group) return;
      const checked = $(`input[name="${indikator.key}"]:checked`);
      const status = $("[data-state]", group);
      group.classList.toggle("is-complete", Boolean(checked));
      if (status) status.textContent = checked ? "Terisi" : "Belum diisi";
    });
  }

  function collectFakta() {
    const fakta = {};
    INDIKATOR.forEach((indikator) => {
      const checked = $(`input[name="${indikator.key}"]:checked`);
      fakta[indikator.key] = checked ? checked.value : null;
    });
    return fakta;
  }

  function readRupiahValue(id) {
    const input = document.getElementById(id);
    if (!input) return null;
    const raw = input.dataset.raw !== undefined ? input.dataset.raw : input.value.replace(/\D/g, "");
    if (!raw) return null;
    const number = Number(raw);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function getNominalNumber() {
    return readRupiahValue("nominal");
  }

  function getDanaNumber() {
    return readRupiahValue("dana");
  }

  function resolveKategoriInput() {
    const api = penilaianAPI();
    const input = $("#nama-pengeluaran");
    const nama = input ? input.value.trim() : "";
    if (!api) return null;

    if (state.selectedKategori && state.selectedKategori.nama === nama) {
      return state.selectedKategori;
    }

    const ditemukan = api.cariKategori(nama);
    if (ditemukan) {
      state.selectedKategori = ditemukan;
      return ditemukan;
    }

    if (state.selectedKategori && state.selectedKategori.nama !== nama) {
      state.selectedKategori = null;
    }
    return null;
  }

  function kategoriAktif() {
    const kategori = resolveKategoriInput();
    if (kategori) return kategori;
    const api = penilaianAPI();
    const input = $("#nama-pengeluaran");
    const nama = input ? input.value.trim() : "";
    return api
      ? Object.assign({}, api.KATEGORI_KHUSUS, { nama: nama || api.KATEGORI_KHUSUS.nama })
      : null;
  }

  function collectFormData() {
    const namaInput = $("#nama-pengeluaran");
    const kategori = kategoriAktif();
    return {
      nama: namaInput ? namaInput.value.trim() : "",
      nominal: getNominalNumber(),
      dana: getDanaNumber(),
      kategori,
      fakta: collectFakta(),
    };
  }

  function isFormComplete(data) {
    // Syarat tombol aktif: nama pengeluaran dan kelima indikator sudah terisi.
    return Boolean(data.nama) && INDIKATOR.every((indikator) => Boolean(data.fakta[indikator.key]));
  }

  function updateFormState() {
    const data = collectFormData();
    const selectedCount = INDIKATOR.filter((indikator) => Boolean(data.fakta[indikator.key])).length;
    const complete = isFormComplete(data);

    const countEl = $("#progress-count");
    const percentEl = $("#progress-percent");
    const fillEl = $("#progress-fill");
    const submit = $("#btn-submit");
    const hint = $("#form-hint");

    if (countEl) countEl.textContent = `${selectedCount} dari 5 indikator terisi`;
    const percent = Math.round((selectedCount / INDIKATOR.length) * 100);
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;

    INDIKATOR.forEach((indikator) => {
      const item = $(`.progress-item[data-progress="${indikator.key}"]`);
      if (item) item.classList.toggle("is-done", Boolean(data.fakta[indikator.key]));
    });

    if (submit) submit.disabled = !complete || state.analyzing;
    if (hint) {
      hint.classList.toggle("is-ready", complete);
      if (complete) {
        hint.textContent = "Semua data lengkap. Tekan Analisis Prioritas untuk melihat hasil dan skor otomatis.";
      } else if (selectedCount === INDIKATOR.length) {
        hint.textContent = "Kebutuhan masih kosong. Pilih kategori atau ketik kebutuhan agar tombol analisis aktif.";
      } else {
        const sisa = INDIKATOR.length - selectedCount;
        hint.textContent = data.nama
          ? `${sisa} indikator lagi belum dipilih. Lengkapi semua indikator untuk mengaktifkan tombol analisis.`
          : "Pilih atau ketik kebutuhan dan lengkapi kelima indikator untuk mengaktifkan tombol analisis.";
      }
    }
  }

  function setAnalyzing(loading) {
    state.analyzing = loading;
    const submit = $("#btn-submit");
    if (!submit) return;
    const label = $(".btn-label", submit);
    submit.classList.toggle("is-loading", loading);
    submit.disabled = loading;
    if (label) label.textContent = loading ? "Menganalisis..." : "Analisis Prioritas";
    if (!loading) updateFormState();
  }

  function formatNominalInput(value) {
    if (value === null || value === undefined || value === "") return "";
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    return new Intl.NumberFormat("id-ID").format(number);
  }

  function setRupiahValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;
    if (value === null || value === undefined || value === "") {
      input.value = "";
      input.dataset.raw = "";
      return;
    }
    const number = Number(value);
    input.dataset.raw = String(number);
    input.value = formatNominalInput(number);
  }

  function setNominalValue(value) {
    setRupiahValue("nominal", value);
  }

  function setDanaValue(value) {
    setRupiahValue("dana", value);
  }

  function initNominalInput() {
    const input = $("#nominal");
    if (!input) return;

    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "").slice(0, 15);
      input.dataset.raw = digits;
      input.value = digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
    });
  }

  function initDanaInput() {
    const input = $("#dana");
    if (!input) return;

    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "").slice(0, 15);
      input.dataset.raw = digits;
      input.value = digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
    });
  }

  /* ======================================================================
     5b. COMBOBOX KATEGORI KEBUTUHAN
     ====================================================================== */

  function updateKategoriHint() {
    const hint = $("#kategori-terpilih");
    const input = $("#nama-pengeluaran");
    if (!hint || !input) return;

    const nama = input.value.trim();
    if (!nama) {
      hint.textContent = "Pilih kategori dari daftar atau ketik kebutuhan sendiri.";
      hint.classList.remove("is-custom", "is-wajib");
      return;
    }

    const kategori = resolveKategoriInput();
    if (kategori) {
      hint.innerHTML = `${icon(kategori.ikon)} <strong>${escapeHtml(kategori.nama)}</strong>${
        kategori.wajib ? ' · <span class="tag-wajib">Kebutuhan wajib</span>' : ""
      }`;
      hint.classList.toggle("is-wajib", Boolean(kategori.wajib));
      hint.classList.remove("is-custom");
    } else {
      hint.innerHTML = `${icon("i-edit")} Kebutuhan khusus: <strong>${escapeHtml(
        nama
      )}</strong> — dinilai seperti kategori lainnya.`;
      hint.classList.add("is-custom");
      hint.classList.remove("is-wajib");
    }
  }

  function renderKategoriOptions(query = "") {
    const list = $("#daftar-kebutuhan");
    if (!list) return;

    const api = penilaianAPI();
    const teksCari = api ? api.normalisasiTeks(query) : String(query).toLowerCase().trim();
    const items = daftarKategori().filter((kategori) => {
      if (!teksCari) return true;
      const gabungan = [kategori.nama, kategori.keterangan]
        .concat(kategori.alias || [])
        .join(" ")
        .toLowerCase();
      return gabungan.includes(teksCari);
    });

    state.comboboxItems = items;
    state.comboboxIndex = items.length ? 0 : -1;

    if (!items.length) {
      list.innerHTML =
        '<li class="combobox-empty">Tidak ada kategori yang cocok. Ketikanmu akan disimpan sebagai kebutuhan khusus.</li>';
      return;
    }

    list.innerHTML = items
      .map(
        (kategori, index) => `
          <li class="combobox-option ${index === 0 ? "is-active" : ""}" role="option" id="opsi-kebutuhan-${index}" data-kategori="${escapeHtml(
          kategori.id
        )}" aria-selected="${index === 0}">
            <span class="combobox-option-icon">${icon(kategori.ikon)}</span>
            <span class="combobox-option-text">
              <strong>${escapeHtml(kategori.nama)}</strong>
              <small>${escapeHtml(kategori.keterangan || "")}</small>
            </span>
            ${kategori.wajib ? '<span class="combobox-tag">Wajib</span>' : ""}
          </li>`
      )
      .join("");
  }

  function setComboboxActive(index) {
    const list = $("#daftar-kebutuhan");
    const input = $("#nama-pengeluaran");
    if (!list || !input) return;

    const options = $$(".combobox-option", list);
    options.forEach((option, i) => {
      const aktif = i === index;
      option.classList.toggle("is-active", aktif);
      option.setAttribute("aria-selected", String(aktif));
    });

    if (index >= 0 && options[index]) {
      input.setAttribute("aria-activedescendant", options[index].id);
      options[index].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function moveCombobox(step) {
    const total = state.comboboxItems.length;
    if (!total) return;
    state.comboboxIndex = (state.comboboxIndex + step + total) % total;
    setComboboxActive(state.comboboxIndex);
  }

  function openCombobox() {
    const list = $("#daftar-kebutuhan");
    const input = $("#nama-pengeluaran");
    const toggle = $("#combobox-toggle");
    const wrap = $("#combobox-kebutuhan");
    if (!list || !input) return;

    renderKategoriOptions(input.value);
    list.hidden = false;
    if (wrap) wrap.classList.add("is-open");
    input.setAttribute("aria-expanded", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (state.comboboxIndex >= 0) {
      input.setAttribute("aria-activedescendant", `opsi-kebutuhan-${state.comboboxIndex}`);
    }
  }

  function closeCombobox() {
    const list = $("#daftar-kebutuhan");
    const input = $("#nama-pengeluaran");
    const toggle = $("#combobox-toggle");
    const wrap = $("#combobox-kebutuhan");
    if (list) list.hidden = true;
    if (wrap) wrap.classList.remove("is-open");
    if (input) {
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function pilihKategori(kategori) {
    const input = $("#nama-pengeluaran");
    if (!input || !kategori) return;

    state.selectedKategori = kategori;
    input.value = kategori.nama;
    closeCombobox();
    updateKategoriHint();
    updateFormState();
    input.focus({ preventScroll: true });
  }

  function initCombobox() {
    const input = $("#nama-pengeluaran");
    const list = $("#daftar-kebutuhan");
    const toggle = $("#combobox-toggle");
    const wrap = $("#combobox-kebutuhan");
    if (!input || !list || !wrap) return;

    input.addEventListener("focus", openCombobox);
    input.addEventListener("click", openCombobox);

    input.addEventListener("input", () => {
      if (state.selectedKategori && state.selectedKategori.nama !== input.value.trim()) {
        state.selectedKategori = null;
      }
      openCombobox();
      renderKategoriOptions(input.value);
      updateKategoriHint();
      updateFormState();
    });

    input.addEventListener("keydown", (event) => {
      const terbuka = !list.hidden;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!terbuka) openCombobox();
        else moveCombobox(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!terbuka) openCombobox();
        else moveCombobox(-1);
      } else if (event.key === "Enter") {
        if (terbuka && state.comboboxIndex >= 0 && state.comboboxItems[state.comboboxIndex]) {
          event.preventDefault();
          pilihKategori(state.comboboxItems[state.comboboxIndex]);
        }
      } else if (event.key === "Escape") {
        if (terbuka) {
          event.preventDefault();
          closeCombobox();
        }
      } else if (event.key === "Tab") {
        closeCombobox();
      }
    });

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (list.hidden) openCombobox();
        else closeCombobox();
        input.focus({ preventScroll: true });
      });
    }

    list.addEventListener("mousedown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => {
      const option = event.target.closest("[data-kategori]");
      if (!option) return;
      const kategori = daftarKategori().find((item) => item.id === option.dataset.kategori);
      if (kategori) pilihKategori(kategori);
    });

    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) closeCombobox();
    });
  }

  function resetCombobox() {
    state.selectedKategori = null;
    state.comboboxItems = [];
    state.comboboxIndex = -1;
    closeCombobox();
    updateKategoriHint();
  }

  function resetFormState() {
    const form = $("#form-analisis");
    if (form) form.reset();
    setNominalValue("");
    setDanaValue("");
    resetCombobox();
    state.currentResult = null;
    state.saved = false;
    syncOptionCards();
    updateFormState();
  }

  function buatHasilAnalisis(data, inference) {
    const kategori =
      data.kategori || (penilaianAPI() ? penilaianAPI().KATEGORI_KHUSUS : null) || {
        id: "khusus",
        nama: data.nama,
        wajib: false,
      };

    const hasil = {
      nama: data.nama,
      nominal: data.nominal,
      dana: data.dana,
      kategori: {
        id: kategori.id,
        nama: kategori.id === "khusus" ? data.nama : kategori.nama,
        wajib: Boolean(kategori.wajib),
        ikon: kategori.ikon || "i-edit",
      },
      kategoriId: kategori.id,
      wajib: Boolean(kategori.wajib),
      fakta: data.fakta,
      inference,
      analyzedAt: new Date().toISOString(),
    };

    hasil.skor = hitungSkorItem(hasil);
    return hasil;
  }

  function initForm() {
    renderIndicators();
    renderProgressList();
    initNominalInput();
    initDanaInput();
    initCombobox();

    const form = $("#form-analisis");
    const nameInput = $("#nama-pengeluaran");
    if (!form) return;

    if (nameInput) nameInput.addEventListener("input", updateFormState);

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        setNominalValue("");
        setDanaValue("");
        resetCombobox();
        state.currentResult = null;
        state.saved = false;
        syncOptionCards();
        updateFormState();
      }, 0);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.analyzing) return;

      const data = collectFormData();
      if (!isFormComplete(data)) {
        updateFormState();
        showToast(
          !data.nama
            ? "Pilih atau ketik kebutuhan dan lengkapi kelima indikator terlebih dahulu."
            : "Lengkapi kelima indikator terlebih dahulu.",
          "error"
        );
        return;
      }

      if (typeof window.infer !== "function") {
        showToast("Mesin inferensi tidak dapat dimuat. Muat ulang halaman.", "error");
        return;
      }

      const hasil = window.infer(data.fakta);
      setAnalyzing(true);

      window.setTimeout(() => {
        state.currentResult = buatHasilAnalisis(data, hasil);
        state.saved = false;
        setAnalyzing(false);
        autoSaveCurrentResult();
        navigate("hasil");
      }, 560);
    });

    syncOptionCards();
    updateFormState();
  }

  /* ======================================================================
     6. CONTOH KASUS
     ====================================================================== */

  function renderExamples() {
    const grid = $("#example-grid");
    if (!grid) return;

    grid.innerHTML = CONTOH_KASUS.map((contoh, index) => {
      const isNoMatch = !contoh.expected;
      return `
        <button type="button" class="example-card" data-example="${index}">
          <span class="example-icon">${icon(contoh.ikon)}</span>
          <span class="example-expected ${isNoMatch ? "is-none" : ""}">${escapeHtml(contoh.expectedLabel)}</span>
          <h3>${escapeHtml(contoh.nama)}</h3>
          <p>${escapeHtml(contoh.keterangan)}</p>
        </button>`;
    }).join("");

    grid.addEventListener("click", (event) => {
      const card = event.target.closest("[data-example]");
      if (!card) return;
      const contoh = CONTOH_KASUS[Number(card.dataset.example)];
      if (contoh) fillExample(contoh);
    });
  }

  function fillExample(contoh) {
    const form = $("#form-analisis");
    const nameInput = $("#nama-pengeluaran");
    if (!form || !nameInput) return;

    state.currentResult = null;
    state.saved = false;

    nameInput.value = contoh.nama;
    setNominalValue(contoh.nominal);
    setDanaValue(contoh.dana);

    const api = penilaianAPI();
    state.selectedKategori =
      api && contoh.kategoriId ? api.kategoriById(contoh.kategoriId) : null;
    updateKategoriHint();
    closeCombobox();

    Object.entries(contoh.fakta).forEach(([key, value]) => {
      const input = form.querySelector(`input[name="${key}"][value="${value}"]`);
      if (input) input.checked = true;
    });

    syncOptionCards();
    updateFormState();

    const panel = $("#panel-contoh");
    const button = $("#btn-contoh");
    if (panel) panel.hidden = true;
    if (button) button.setAttribute("aria-expanded", "false");

    showToast(`Contoh "${contoh.nama}" dimuat. Tekan Analisis Prioritas.`);
    window.setTimeout(() => {
      form.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      nameInput.focus({ preventScroll: true });
    }, 120);
  }

  function initExamples() {
    renderExamples();
    const button = $("#btn-contoh");
    const panel = $("#panel-contoh");
    if (!button || !panel) return;

    button.addEventListener("click", () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      button.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) {
        window.setTimeout(() => {
          panel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
        }, 40);
      }
    });
  }

  /* ======================================================================
     7. RENDER HASIL
     ====================================================================== */

  function factChips(fakta) {
    return INDIKATOR.map(
      (indikator) => `
        <span class="fact-chip">
          <strong>${escapeHtml(indikator.label)}</strong>
          ${escapeHtml(fakta[indikator.key] || "—")}
        </span>`
    ).join("");
  }

  function summaryFactGrid(fakta) {
    return `
      <div class="fact-grid">
        ${INDIKATOR.map(
          (indikator) => `
            <div class="fact-item">
              <span>${escapeHtml(indikator.label)}</span>
              <strong>${escapeHtml(fakta[indikator.key] || "—")}</strong>
            </div>`
        ).join("")}
      </div>`;
  }

  function renderScorePanel(skor) {
    if (!skor || !skor.komponen) return "";

    const komponen = ["kebutuhan", "urgensi", "manfaat", "harga"]
      .map((key) => skor.komponen[key])
      .filter(Boolean);
    const netral = skor.komponen.harga && skor.komponen.harga.netral;

    return `
      <section class="result-panel score-panel">
        <div class="score-panel-head">
          <h3>${icon("i-trending")} Skor Prioritas Otomatis</h3>
          <div class="score-total"><strong>${formatSkor(skor.total)}</strong><span>/100</span></div>
        </div>
        <div class="score-bars">
          ${komponen
            .map(
              (k) => `
            <div class="score-row">
              <div class="score-row-head">
                <span>${escapeHtml(k.label)} <small>(${k.bobot}%)</small></span>
                <span><strong>${formatSkor(k.kontribusi)}</strong> / ${k.bobot}</span>
              </div>
              <div class="score-track" role="img" aria-label="${escapeHtml(k.label)} ${k.nilai} dari 100">
                <span style="width:${Math.max(0, Math.min(100, k.nilai))}%"></span>
              </div>
            </div>`
            )
            .join("")}
        </div>
        <p class="score-note">${icon("i-info")} Bobot tetap: tingkat kebutuhan 35%, urgensi 30%, manfaat perkuliahan 25%, kesesuaian harga 10%.${
          skor.wajib
            ? " Kategori ini termasuk kebutuhan wajib sehingga skor tingkat kebutuhan minimal 90."
            : ""
        }${netral ? " Dana tersedia belum diisi, sehingga kesesuaian harga dinilai netral (60/100)." : ""}</p>
      </section>`;
  }

  function renderNoMatch(result) {
    return `
      <article class="result-card no-match">
        <div class="no-match-hero">
          <span class="no-match-icon">${icon("i-help")}</span>
          <div class="no-match-copy">
            <span class="eyebrow">Informasi sistem</span>
            <h2>Tidak ditemukan aturan yang cocok dengan kombinasi kondisi yang dimasukkan</h2>
            <p>Mesin inferensi tidak menemukan aturan yang seluruh kondisinya terpenuhi. Sistem tidak menebak hasil. Tinjau kembali indikator yang paling tidak yakin, lalu ubah satu atau dua jawaban agar sesuai dengan kondisi sebenarnya.</p>
          </div>
        </div>

        <section class="result-panel result-summary">
          <h3>${icon("i-receipt")} Ringkasan masukan</h3>
          <div class="result-meta">
            <span class="meta-pill">${icon("i-receipt")} ${escapeHtml(result.nama)}</span>
            <span class="meta-pill">${icon("i-bag")} ${escapeHtml(
              (result.kategori && result.kategori.nama) || "Kebutuhan"
            )}</span>
            <span class="meta-pill">${icon("i-wallet")} ${formatRupiah(result.nominal)}</span>
            <span class="meta-pill">${icon("i-calendar")} ${escapeHtml(formatTanggal(result.analyzedAt))}</span>
          </div>
          <div class="result-summary">
            ${summaryFactGrid(result.fakta)}
          </div>
        </section>

        ${renderScorePanel(result.skor)}

        <section class="result-panel suggestion-panel">
          <h3>${icon("i-lightbulb")} Saran meninjau masukan</h3>
          <ul class="suggestion-list">
            <li>Periksa kembali <strong>kepentingan</strong> dan <strong>urgensi</strong>; dua indikator ini paling menentukan prioritas.</li>
            <li>Pastikan penggolongan <strong>kebutuhan</strong> atau <strong>keinginan</strong> sesuai kenyataan, bukan harapan.</li>
            <li>Nilai <strong>dampak</strong> berdasarkan akibat nyata bila pengeluaran tidak dilakukan.</li>
            <li>Ubah satu indikator yang paling meragukan, lalu analisis kembali.</li>
          </ul>
        </section>

        <div class="result-actions">
          <button class="btn btn-primary" type="button" data-action="edit">
            ${icon("i-edit")} Ubah Masukan
          </button>
        </div>
      </article>`;
  }

  function renderSuccess(result) {
    const aturan = result.inference.aturan;
    const priority = PRIORITAS[aturan.hasil];
    if (!priority) return "";

    const saved = state.saved;
    const safeName = escapeHtml(result.nama);
    const normalizedRule = escapeHtml(aturan.hasil.toLowerCase());

    return `
      <article class="result-card result-success priority-${normalizedRule}">
        <div class="result-hero">
          <div class="result-badge" aria-label="Prioritas ${escapeHtml(aturan.hasil)} ${escapeHtml(priority.nama)}">
            ${icon(priority.ikon)}
            <strong>${escapeHtml(aturan.hasil)}</strong>
            <span>${escapeHtml(priority.nama)}</span>
          </div>
          <div class="result-headline">
            <span class="eyebrow">${icon("i-sparkle")} Kesimpulan sistem pakar</span>
            <h2>${safeName}</h2>
            <p class="result-lead">${escapeHtml(priority.lead(result.nama))}</p>
            <div class="result-meta">
              <span class="meta-pill is-rule">${icon("i-rule")} Aturan ${escapeHtml(aturan.id)}</span>
              <span class="meta-pill">${icon("i-bag")} ${escapeHtml(
                (result.kategori && result.kategori.nama) || "Kebutuhan"
              )}</span>
              <span class="meta-pill">${icon("i-calendar")} ${escapeHtml(formatTanggal(result.analyzedAt))}</span>
              <span class="meta-pill">${icon("i-wallet")} ${formatRupiah(result.nominal)}</span>
            </div>
          </div>
        </div>

        <div class="result-grid">
          <section class="result-panel">
            <h3>${icon("i-lightbulb")} Rekomendasi tindakan</h3>
            <p>${escapeHtml(priority.alasan)}</p>
            <ul class="rec-list">
              ${priority.rekomendasi.map((item) => `<li>${icon("i-check")} ${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>

          <section class="result-panel rule-panel">
            <h3>${icon("i-rule")} Aturan yang Digunakan</h3>
            <div class="rule-top">
              <span class="rule-id">${icon("i-rule")} ${escapeHtml(aturan.id)}</span>
              <span class="rule-result">${icon("i-check-circle")} ${escapeHtml(aturan.hasil)} · ${escapeHtml(priority.nama)}</span>
            </div>
            <div class="rule-block">
              <span class="rule-key">IF</span>
              <div class="rule-chips">${factChips(result.fakta)}</div>
            </div>
            <div class="rule-block">
              <span class="rule-key">THEN</span>
              <div class="rule-chips">
                <span class="fact-chip"><strong>Prioritas</strong> ${escapeHtml(aturan.hasil)} · ${escapeHtml(priority.nama)}</span>
              </div>
            </div>
            <p class="rule-desc"><strong>Keterangan aturan:</strong> ${escapeHtml(aturan.deskripsi)}</p>
          </section>
        </div>

        ${renderScorePanel(result.skor)}

        <section class="result-panel result-summary">
          <h3>${icon("i-receipt")} Ringkasan masukan pengguna</h3>
          ${summaryFactGrid(result.fakta)}
        </section>

        <div class="result-actions">
          <button class="btn btn-primary" type="button" data-action="save" ${saved ? "disabled" : ""}>
            ${icon(saved ? "i-check-circle" : "i-save")} ${saved ? "Tersimpan di Riwayat" : "Simpan ke Riwayat"}
          </button>
          <button class="btn btn-ghost" type="button" data-action="again">
            ${icon("i-reset")} Analisis Lagi
          </button>
          <span class="spacer"></span>
          ${saved ? `<span class="saved-note">${icon("i-check-circle")} Hasil tersimpan di perangkat ini.</span>` : ""}
        </div>
      </article>`;
  }

  function renderResult() {
    const container = $("#hasil-content");
    if (!container) return;

    if (!state.currentResult) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-illustration">${icon("i-chart")}</span>
          <h2>Belum ada hasil analisis</h2>
          <p>Isi data pengeluaran dan lima indikator terlebih dahulu agar mesin inferensi dapat menentukan prioritas.</p>
          <a class="btn btn-primary" href="#analisis">Mulai Analisis ${icon("i-arrow-right")}</a>
        </div>`;
      return;
    }

    const result = state.currentResult;
    if (!result.inference || result.inference.status === "tidak_cocok") {
      container.innerHTML = renderNoMatch(result);
    } else {
      container.innerHTML = renderSuccess(result);
    }
  }

  function initResultActions() {
    const container = $("#hasil-content");
    if (!container) return;

    container.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.dataset.action;
      if (action === "save") {
        saveCurrentResult();
      } else if (action === "again") {
        resetFormState();
        closeExamplesPanel();
        navigate("analisis");
        showToast("Formulir direset. Silakan mulai analisis baru.");
      } else if (action === "edit") {
        navigate("analisis");
      }
    });
  }

  /* ======================================================================
     8. RIWAYAT & LOCALSTORAGE
     ====================================================================== */

  function angkaAtauNull(value) {
    const number = Number(value);
    return value === null || value === undefined || value === "" || !Number.isFinite(number)
      ? null
      : number;
  }

  function normalizeHistoryItem(item) {
    if (!item || typeof item !== "object") return null;
    if (typeof item.nama !== "string" || !item.nama.trim()) return null;

    const punyaPrioritas = isPriority(item.priority);
    const status = punyaPrioritas
      ? "cocok"
      : item.status === "tidak_cocok"
      ? "tidak_cocok"
      : null;
    if (!status) return null;

    const fakta = item.fakta && typeof item.fakta === "object" ? item.fakta : {};
    const api = penilaianAPI();
    const kategori =
      (api && item.kategoriId && api.kategoriById(item.kategoriId)) ||
      (api ? api.cariKategori(item.nama) : null) ||
      (api ? api.KATEGORI_KHUSUS : null);

    const hasil = {
      id: String(item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      nama: item.nama.slice(0, 120),
      kategoriId:
        typeof item.kategoriId === "string"
          ? item.kategoriId
          : kategori
          ? kategori.id
          : "khusus",
      kategoriNama:
        typeof item.kategoriNama === "string" && item.kategoriNama
          ? item.kategoriNama
          : kategori
          ? kategori.nama
          : "Kebutuhan Khusus",
      wajib:
        typeof item.wajib === "boolean" ? item.wajib : Boolean(kategori && kategori.wajib),
      nominal: angkaAtauNull(item.nominal),
      dana: angkaAtauNull(item.dana),
      priority: punyaPrioritas ? item.priority : null,
      status,
      ruleId: typeof item.ruleId === "string" ? item.ruleId : null,
      ruleDesc: typeof item.ruleDesc === "string" ? item.ruleDesc : "",
      fakta,
      createdAt:
        typeof item.createdAt === "string" && !Number.isNaN(new Date(item.createdAt).getTime())
          ? item.createdAt
          : new Date().toISOString(),
    };

    hasil.skor = hitungSkorItem(hasil);
    return hasil;
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeHistoryItem).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function persistHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
      return true;
    } catch (error) {
      showToast("Riwayat tidak dapat disimpan di browser ini.", "error");
      return false;
    }
  }

  function buildHistoryItem(result) {
    const aturan = result.inference && result.inference.aturan;
    const kategori = result.kategori || {};
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nama: result.nama,
      kategoriId: kategori.id || result.kategoriId || "khusus",
      kategoriNama: kategori.nama || result.nama,
      wajib: Boolean(result.wajib || kategori.wajib),
      nominal: angkaAtauNull(result.nominal),
      dana: angkaAtauNull(result.dana),
      priority: aturan ? aturan.hasil : null,
      status: aturan ? "cocok" : "tidak_cocok",
      ruleId: aturan ? aturan.id : null,
      ruleDesc: aturan
        ? aturan.deskripsi
        : "Tidak ada aturan yang cocok; kebutuhan perlu ditinjau ulang.",
      fakta: { ...result.fakta },
      createdAt: new Date().toISOString(),
    };
    item.skor = result.skor || hitungSkorItem(item);
    return item;
  }

  function addHistoryItem(item) {
    state.history = [item, ...state.history].slice(0, MAX_HISTORY);
    if (!persistHistory()) {
      state.history = state.history.filter((historyItem) => historyItem.id !== item.id);
      return false;
    }
    return true;
  }

  function autoSaveCurrentResult() {
    const result = state.currentResult;
    if (!result) return;

    const item = buildHistoryItem(result);
    if (!addHistoryItem(item)) return;

    state.saved = true;
    renderHistory();

    const aturan = result.inference && result.inference.aturan;
    showToast(
      aturan
        ? `"${result.nama}" (${aturan.hasil}) tersimpan otomatis di Riwayat.`
        : `"${result.nama}" tersimpan otomatis di Riwayat untuk ditinjau.`
    );
  }

  function saveCurrentResult() {
    const result = state.currentResult;
    if (!result) return;
    if (state.saved) {
      showToast("Hasil ini sudah tersimpan di riwayat.");
      return;
    }

    autoSaveCurrentResult();
    renderResult();
  }

  function sortedHistory(items) {
    const urutan = { P1: 1, P2: 2, P3: 3, P4: 4 };
    return [...items].sort((a, b) => {
      const aPunya = isPriority(a.priority);
      const bPunya = isPriority(b.priority);
      if (aPunya !== bPunya) return aPunya ? -1 : 1;

      const skorA = a.skor && Number.isFinite(a.skor.total) ? a.skor.total : -1;
      const skorB = b.skor && Number.isFinite(b.skor.total) ? b.skor.total : -1;
      if (skorA !== skorB) return skorB - skorA;

      const priorityDiff = (urutan[a.priority] || 99) - (urutan[b.priority] || 99);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  function renderHistoryStats() {
    const container = $("#riwayat-stats");
    if (!container) return;

    if (!state.history.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = Object.keys(PRIORITAS)
      .map((kode) => {
        const items = state.history.filter((item) => item.priority === kode);
        const total = items.reduce((sum, item) => sum + (Number.isFinite(item.nominal) ? item.nominal : 0), 0);
        const priority = PRIORITAS[kode];
        const active = state.historyFilter === kode;
        return `
          <button class="stat-card ${active ? "is-active" : ""}" type="button" data-priority="${kode}" data-filter-priority="${kode}" aria-pressed="${active}">
            <span class="stat-icon">${icon(priority.ikon)}</span>
            <span class="stat-body">
              <span class="stat-label">${kode} · ${escapeHtml(priority.nama)}</span>
              <strong>${formatRupiah(total)}</strong>
              <small>${items.length} kebutuhan</small>
            </span>
          </button>`;
      })
      .join("");
  }

  function renderHistoryItem(item, index) {
    const priority = PRIORITAS[item.priority];
    const api = penilaianAPI();
    const terpilih = state.selectedHistory.has(item.id);
    const skor = item.skor ? formatSkor(item.skor.total) : "—";
    const urgensi = item.fakta && item.fakta.urgensi ? item.fakta.urgensi : "—";
    const alasanTeks = api ? api.alasan(item, sortedHistory(state.history)) : "";
    const komponen =
      item.skor && item.skor.komponen
        ? ["kebutuhan", "urgensi", "manfaat", "harga"]
            .map((key) => item.skor.komponen[key])
            .filter(Boolean)
        : [];

    return `
      <article class="history-item ${terpilih ? "is-selected" : ""}" data-priority="${item.priority || "none"}" data-id="${escapeHtml(item.id)}">
        <div class="history-priority">
          <strong>${priority ? escapeHtml(item.priority) : "?"}</strong>
          <span>${priority ? escapeHtml(priority.nama) : "Perlu tinjauan"}</span>
          <span class="history-score">${skor}<small>/100</small></span>
        </div>
        <div class="history-main">
          <div class="history-top">
            <h3 class="history-name"><span class="history-rank">#${index + 1}</span> ${escapeHtml(item.nama)}</h3>
            <span class="history-amount">${formatRupiah(item.nominal)}</span>
          </div>
          <div class="history-meta">
            <span>${icon("i-bag")} ${escapeHtml(item.kategoriNama || "Kebutuhan")}</span>
            <span>${icon("i-clock")} Urgensi ${escapeHtml(labelUrgensi(urgensi))}</span>
            <span>${icon("i-calendar")} ${escapeHtml(formatTanggal(item.createdAt))}</span>
            ${
              item.ruleId
                ? `<span>${icon("i-rule")} Aturan ${escapeHtml(item.ruleId)}</span>`
                : `<span>${icon("i-help")} Tanpa aturan</span>`
            }
          </div>
          <p class="history-reason">${escapeHtml(alasanTeks)}</p>
        </div>
        <div class="history-actions">
          <label class="history-select" title="Pilih untuk dibandingkan">
            <input type="checkbox" data-select="${escapeHtml(item.id)}" ${terpilih ? "checked" : ""} aria-label="Pilih ${escapeHtml(item.nama)} untuk dibandingkan">
            <span class="history-select-box">${icon("i-check")}</span>
          </label>
          <button class="icon-btn history-delete" type="button" data-delete="${escapeHtml(item.id)}" aria-label="Hapus riwayat ${escapeHtml(item.nama)}">
            ${icon("i-trash")}
          </button>
        </div>
        <details class="history-details">
          <summary>Lihat rincian indikator &amp; skor</summary>
          <div class="history-facts">
            ${INDIKATOR.map(
              (indikator) => `
                <span><strong>${escapeHtml(indikator.label)}:</strong> ${escapeHtml(item.fakta[indikator.key] || "—")}</span>`
            ).join("")}
          </div>
          ${
            komponen.length
              ? `<div class="history-score-breakdown">
                  ${komponen
                    .map(
                      (k) =>
                        `<span>${escapeHtml(k.label)}: <strong>${formatSkor(k.kontribusi)}</strong>/${k.bobot}</span>`
                    )
                    .join("")}
                </div>`
              : ""
          }
        </details>
      </article>`;
  }

  function pruneSelection() {
    const ids = new Set(state.history.map((item) => item.id));
    Array.from(state.selectedHistory).forEach((id) => {
      if (!ids.has(id)) state.selectedHistory.delete(id);
    });
  }

  function updateCompareBar() {
    const bar = $("#compare-bar");
    const count = $("#compare-count");
    const compareButton = $("#btn-bandingkan");
    const resetButton = $("#btn-reset-pilihan");
    const total = state.selectedHistory.size;

    if (bar) bar.classList.toggle("has-selection", total > 0);
    if (count) count.textContent = `${total} dipilih`;
    if (compareButton) compareButton.disabled = total < 2;
    if (resetButton) resetButton.hidden = total === 0;
  }

  function renderHistory() {
    const list = $("#riwayat-list");
    const count = $("#riwayat-count");
    const clearButton = $("#btn-hapus-semua");
    if (!list) return;

    pruneSelection();
    renderHistoryStats();
    renderSavedComparisons();
    updateCompareBar();

    const filtered =
      state.historyFilter === "Semua"
        ? sortedHistory(state.history)
        : sortedHistory(state.history.filter((item) => item.priority === state.historyFilter));

    $$(".chip[data-filter]").forEach((chip) => {
      const active = chip.dataset.filter === state.historyFilter;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });

    if (count) {
      if (!state.history.length) {
        count.textContent = "";
      } else if (state.historyFilter === "Semua") {
        count.textContent = `${state.history.length} analisis tersimpan`;
      } else {
        count.textContent = `${filtered.length} dari ${state.history.length} analisis`;
      }
    }

    if (clearButton) clearButton.hidden = state.history.length === 0;

    if (!state.history.length) {
      closeComparison();
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-illustration">${icon("i-wallet")}</span>
          <h2>Belum ada analisis yang disimpan</h2>
          <p>Hasil analisis pertamamu akan tersimpan otomatis di sini agar prioritas kebutuhan mudah dipantau kembali. Data disimpan lokal di browser ini.</p>
          <a class="btn btn-primary" href="#analisis">Mulai Analisis ${icon("i-arrow-right")}</a>
        </div>`;
      return;
    }

    if (!filtered.length) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-illustration">${icon("i-filter")}</span>
          <h2>Tidak ada riwayat ${escapeHtml(state.historyFilter)}</h2>
          <p>Belum ada analisis dengan prioritas ini. Pilih filter lain atau mulai analisis baru.</p>
          <button class="btn btn-ghost" type="button" data-reset-filter>${icon("i-filter")} Tampilkan Semua</button>
        </div>`;
      return;
    }

    list.innerHTML = filtered.map((item, index) => renderHistoryItem(item, index)).join("");
  }

  function setHistoryFilter(filter) {
    const valid = filter === "Semua" || isPriority(filter);
    state.historyFilter = valid ? filter : "Semua";
    renderHistory();
  }

  /* ======================================================================
     8b. PERBANDINGAN PRIORITAS (DI DALAM MENU RIWAYAT)
     ====================================================================== */

  function loadComparisons() {
    try {
      const raw = localStorage.getItem(COMPARISON_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(
          (record) =>
            record && typeof record.id === "string" && Array.isArray(record.itemIds)
        )
        .map((record) => ({
          id: record.id,
          itemIds: record.itemIds.map(String),
          judul:
            typeof record.judul === "string" && record.judul
              ? record.judul.slice(0, 160)
              : "Perbandingan kebutuhan",
          createdAt:
            typeof record.createdAt === "string" &&
            !Number.isNaN(new Date(record.createdAt).getTime())
              ? record.createdAt
              : new Date().toISOString(),
        }))
        .slice(0, MAX_COMPARISONS);
    } catch (error) {
      return [];
    }
  }

  function persistComparisons() {
    try {
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(state.comparisons));
      return true;
    } catch (error) {
      showToast("Perbandingan tidak dapat disimpan di browser ini.", "error");
      return false;
    }
  }

  function saveComparison(itemIds) {
    const ids = itemIds.map(String);
    const kunci = [...ids].sort().join("|");
    const nama = ids
      .map((id) => {
        const item = state.history.find((historyItem) => historyItem.id === id);
        return item ? item.nama : null;
      })
      .filter(Boolean);
    const judul = nama.join(" vs ").slice(0, 160) || "Perbandingan kebutuhan";
    const sekarang = new Date().toISOString();

    const sudahAda = state.comparisons.find(
      (record) => [...record.itemIds].sort().join("|") === kunci
    );

    if (sudahAda) {
      sudahAda.itemIds = ids;
      sudahAda.judul = judul;
      sudahAda.createdAt = sekarang;
      state.comparisons = [
        sudahAda,
        ...state.comparisons.filter((record) => record.id !== sudahAda.id),
      ].slice(0, MAX_COMPARISONS);
      persistComparisons();
      return sudahAda.id;
    }

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      itemIds: ids,
      judul,
      createdAt: sekarang,
    };
    state.comparisons = [record, ...state.comparisons].slice(0, MAX_COMPARISONS);
    persistComparisons();
    return record.id;
  }

  function closeComparison() {
    const panel = $("#riwayat-perbandingan");
    if (panel) {
      panel.hidden = true;
      panel.innerHTML = "";
    }
    state.comparisonItems = null;
    state.comparisonRecordId = null;
  }

  function renderComparison(items, recordId) {
    const panel = $("#riwayat-perbandingan");
    const api = penilaianAPI();
    if (!panel || !api) return;

    const ranked = api.bandingkan(items);
    if (ranked.length < 2) {
      closeComparison();
      return;
    }

    const saran = api.rekomendasi(ranked);
    state.comparisonItems = ranked;
    state.comparisonRecordId = recordId || null;

    const baris = ranked
      .map((item, index) => {
        const skor = item.skor || api.hitungSkor(item);
        const priority = PRIORITAS[item.priority];
        const urgensi = item.fakta && item.fakta.urgensi ? item.fakta.urgensi : "—";

        return `
          <tr class="${index === 0 ? "is-top" : ""}">
            <td><span class="compare-rank">${index + 1}</span></td>
            <td>
              <div class="compare-name">
                <strong>${escapeHtml(item.nama)}</strong>
                <small>${escapeHtml(item.kategoriNama || "Kebutuhan")}${
          item.wajib ? " · Wajib" : ""
        }</small>
              </div>
            </td>
            <td class="compare-num">${formatRupiah(item.nominal)}</td>
            <td><span class="urgency-badge urgency-${String(urgensi).toLowerCase()}">${escapeHtml(
          urgensi
        )}</span></td>
            <td class="compare-score-cell"><strong>${formatSkor(skor.total)}</strong><small>/100</small></td>
            <td>${
              priority
                ? `<span class="compare-priority priority-${item.priority.toLowerCase()}">${escapeHtml(
                    item.priority
                  )}</span>`
                : '<span class="compare-priority is-none">—</span>'
            }</td>
          </tr>`;
      })
      .join("");

    const alasan = ranked
      .map(
        (item, index) => `
          <li class="compare-reason ${index === 0 ? "is-top" : ""}">
            <div class="compare-reason-head">
              <span class="compare-rank">${index + 1}</span>
              <strong>${escapeHtml(item.nama)}</strong>
              <span class="compare-reason-score">${formatSkor(item.skor.total)}/100</span>
            </div>
            <p>${escapeHtml(api.alasan(item, ranked))}</p>
          </li>`
      )
      .join("");

    panel.innerHTML = `
      <div class="compare-head">
        <div>
          <span class="eyebrow">Hasil perbandingan</span>
          <h2>${ranked.length} Kebutuhan Dibandingkan</h2>
          <p>Diurutkan dari skor prioritas tertinggi ke terendah dengan bobot tetap 35% / 30% / 25% / 10%.</p>
        </div>
        <button class="icon-btn" type="button" data-close-comparison aria-label="Tutup perbandingan">
          ${icon("i-close")}
        </button>
      </div>

      ${
        saran
          ? `<div class="compare-recommend">
              <span class="feature-icon gold">${icon("i-lightbulb")}</span>
              <div>
                <span class="eyebrow">Rekomendasi utama</span>
                <h3>${escapeHtml(saran.utama.nama)}</h3>
                <p>${escapeHtml(saran.alasan)}</p>
              </div>
            </div>`
          : ""
      }

      <div class="compare-table-wrap">
        <table class="compare-table">
          <caption class="sr-only">Perbandingan prioritas kebutuhan</caption>
          <thead>
            <tr>
              <th scope="col">Urutan</th>
              <th scope="col">Kebutuhan</th>
              <th scope="col">Nominal</th>
              <th scope="col">Urgensi</th>
              <th scope="col">Skor</th>
              <th scope="col">Prioritas</th>
            </tr>
          </thead>
          <tbody>${baris}</tbody>
        </table>
      </div>

      <h3 class="compare-reason-title">${icon("i-info")} Mengapa urutannya seperti ini?</h3>
      <ol class="compare-reasons">${alasan}</ol>
      <p class="compare-note">${icon("i-save")} Perbandingan ini otomatis tersimpan dan dapat dibuka kembali dari daftar Perbandingan Tersimpan.</p>`;

    panel.hidden = false;
    renderSavedComparisons();
  }

  function renderSavedComparisons() {
    const section = $("#saved-comparisons");
    const list = $("#saved-comparison-list");
    if (!section || !list) return;

    if (!state.comparisons.length) {
      section.hidden = true;
      list.innerHTML = "";
      return;
    }

    section.hidden = false;
    list.innerHTML = state.comparisons
      .map((record) => {
        const items = record.itemIds
          .map((id) => state.history.find((item) => item.id === id))
          .filter(Boolean);
        const bisaDibuka = items.length >= 2;

        return `
          <article class="saved-comparison-item">
            <span class="saved-comparison-icon">${icon("i-chart")}</span>
            <div class="saved-comparison-body">
              <strong>${escapeHtml(record.judul)}</strong>
              <small>${items.length} kebutuhan · ${escapeHtml(formatTanggal(record.createdAt))}</small>
            </div>
            <div class="saved-comparison-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-open-comparison="${escapeHtml(
                record.id
              )}" ${bisaDibuka ? "" : "disabled"}>
                ${icon("i-arrow-up-right")} Buka
              </button>
              <button class="icon-btn" type="button" data-delete-comparison="${escapeHtml(
                record.id
              )}" aria-label="Hapus perbandingan ${escapeHtml(record.judul)}">
                ${icon("i-trash")}
              </button>
            </div>
          </article>`;
      })
      .join("");
  }

  function openSavedComparison(id) {
    const record = state.comparisons.find((item) => item.id === id);
    if (!record) return;

    const items = record.itemIds
      .map((itemId) => state.history.find((item) => item.id === itemId))
      .filter(Boolean);

    if (items.length < 2) {
      showToast("Sebagian kebutuhan pada perbandingan ini sudah dihapus.", "error");
      return;
    }

    renderComparison(items, record.id);
    const panel = $("#riwayat-perbandingan");
    if (panel) {
      panel.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  function deleteSavedComparison(id) {
    const record = state.comparisons.find((item) => item.id === id);
    if (!record) return;

    askConfirm({
      title: "Hapus perbandingan?",
      message: `"${record.judul}" akan dihapus dari daftar perbandingan tersimpan. Riwayat analisisnya tetap ada.`,
      confirmLabel: "Hapus",
    }).then((confirmed) => {
      if (!confirmed) return;
      state.comparisons = state.comparisons.filter((item) => item.id !== id);
      if (!persistComparisons()) return;
      if (state.comparisonRecordId === id) closeComparison();
      renderSavedComparisons();
      showToast("Perbandingan berhasil dihapus.");
    });
  }

  function deleteHistoryItem(id) {
    const item = state.history.find((historyItem) => historyItem.id === id);
    if (!item) return;

    const label = item.priority ? ` (${item.priority})` : "";
    askConfirm({
      title: "Hapus riwayat?",
      message: `"${item.nama}"${label} akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus",
    }).then((confirmed) => {
      if (!confirmed) return;
      state.history = state.history.filter((historyItem) => historyItem.id !== id);
      state.selectedHistory.delete(id);
      if (state.comparisonItems && state.comparisonItems.some((comp) => comp.id === id)) {
        closeComparison();
      }
      if (!persistHistory()) return;
      renderHistory();
      showToast("Riwayat berhasil dihapus.");
    });
  }

  function clearHistory() {
    if (!state.history.length) return;
    askConfirm({
      title: "Hapus semua riwayat?",
      message: `Seluruh ${state.history.length} riwayat analisis dan perbandingan tersimpannya akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus Semua",
    }).then((confirmed) => {
      if (!confirmed) return;
      state.history = [];
      state.historyFilter = "Semua";
      state.selectedHistory.clear();
      state.comparisons = [];
      closeComparison();
      if (!persistHistory()) return;
      persistComparisons();
      renderHistory();
      showToast("Semua riwayat berhasil dihapus.");
    });
  }

  function initHistory() {
    state.history = loadHistory();
    state.comparisons = loadComparisons();

    const filterContainer = $("#riwayat-filter");
    if (filterContainer) {
      filterContainer.addEventListener("click", (event) => {
        const chip = event.target.closest("[data-filter]");
        if (chip) setHistoryFilter(chip.dataset.filter);
      });
    }

    const stats = $("#riwayat-stats");
    if (stats) {
      stats.addEventListener("click", (event) => {
        const stat = event.target.closest("[data-filter-priority]");
        if (stat) setHistoryFilter(stat.dataset.filterPriority);
      });
    }

    const list = $("#riwayat-list");
    if (list) {
      list.addEventListener("click", (event) => {
        const deleteButton = event.target.closest("[data-delete]");
        if (deleteButton) {
          deleteHistoryItem(deleteButton.dataset.delete);
          return;
        }
        if (event.target.closest("[data-reset-filter]")) {
          setHistoryFilter("Semua");
        }
      });

      list.addEventListener("change", (event) => {
        const checkbox = event.target.closest("[data-select]");
        if (!checkbox) return;

        const id = checkbox.dataset.select;
        if (checkbox.checked) state.selectedHistory.add(id);
        else state.selectedHistory.delete(id);

        const item = checkbox.closest(".history-item");
        if (item) item.classList.toggle("is-selected", checkbox.checked);
        updateCompareBar();
      });
    }

    const compareButton = $("#btn-bandingkan");
    if (compareButton) {
      compareButton.addEventListener("click", () => {
        const items = state.history.filter((item) => state.selectedHistory.has(item.id));
        if (items.length < 2) {
          showToast("Pilih minimal dua kebutuhan untuk dibandingkan.", "error");
          return;
        }

        const recordId = saveComparison(items.map((item) => item.id));
        renderComparison(items, recordId);
        renderSavedComparisons();
        showToast("Perbandingan dibuat dan disimpan di Riwayat.");

        const panel = $("#riwayat-perbandingan");
        if (panel) {
          panel.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }
      });
    }

    const resetSelection = $("#btn-reset-pilihan");
    if (resetSelection) {
      resetSelection.addEventListener("click", () => {
        state.selectedHistory.clear();
        $$("[data-select]").forEach((checkbox) => {
          checkbox.checked = false;
          const item = checkbox.closest(".history-item");
          if (item) item.classList.remove("is-selected");
        });
        updateCompareBar();
      });
    }

    const comparisonPanel = $("#riwayat-perbandingan");
    if (comparisonPanel) {
      comparisonPanel.addEventListener("click", (event) => {
        if (event.target.closest("[data-close-comparison]")) closeComparison();
      });
    }

    const savedList = $("#saved-comparison-list");
    if (savedList) {
      savedList.addEventListener("click", (event) => {
        const openButton = event.target.closest("[data-open-comparison]");
        if (openButton) {
          openSavedComparison(openButton.dataset.openComparison);
          return;
        }
        const deleteButton = event.target.closest("[data-delete-comparison]");
        if (deleteButton) deleteSavedComparison(deleteButton.dataset.deleteComparison);
      });
    }

    const clearButton = $("#btn-hapus-semua");
    if (clearButton) clearButton.addEventListener("click", clearHistory);

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        state.history = loadHistory();
        pruneSelection();
        if (state.currentView === "riwayat") renderHistory();
      }
      if (event.key === COMPARISON_KEY) {
        state.comparisons = loadComparisons();
        if (state.currentView === "riwayat") renderSavedComparisons();
      }
      if (event.key === THEME_KEY && event.newValue) {
        applyTheme(event.newValue === "gelap" ? "dark" : "light", false);
      }
    });
  }

  /* ======================================================================
     9. DIALOG KONFIRMASI
     ====================================================================== */

  function askConfirm({ title, message, confirmLabel }) {
    const dialog = $("#confirm-dialog");
    if (!dialog) return Promise.resolve(window.confirm(message));

    if (typeof dialog.showModal !== "function") {
      return Promise.resolve(window.confirm(message));
    }

    $("#confirm-title").textContent = title;
    $("#confirm-message").textContent = message;
    $("#confirm-accept").textContent = confirmLabel || "Hapus";
    dialog.returnValue = "";

    if (dialog.open) dialog.close("cancel");
    dialog.showModal();

    return new Promise((resolve) => {
      confirmResolver = resolve;
    });
  }

  function initConfirmDialog() {
    const dialog = $("#confirm-dialog");
    if (!dialog) return;

    $("#confirm-cancel").addEventListener("click", () => dialog.close("cancel"));
    $("#confirm-accept").addEventListener("click", () => dialog.close("confirm"));

    dialog.addEventListener("close", () => {
      if (typeof confirmResolver === "function") {
        confirmResolver(dialog.returnValue === "confirm");
        confirmResolver = null;
      }
    });
  }

  /* ======================================================================
     10. ANIMASI REVEAL
     ====================================================================== */

  function initReveal() {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    const selector = [
      ".section-head",
      ".step-card",
      ".priority-card",
      ".mini-card",
      ".cta-band",
      ".page-head",
      ".about-card",
      ".about-section",
      ".example-panel",
      ".team-card",
      ".course-card",
    ].join(",");

    const elements = $$(selector);
    if (!elements.length) return;

    elements.forEach((element, index) => {
      element.classList.add("reveal");
      element.style.transitionDelay = `${Math.min(index % 5, 4) * 45}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
  }

  /* ======================================================================
     11. INISIALISASI
     ====================================================================== */

  function init() {
    initTheme();
    initNavigation();
    initForm();
    initExamples();
    initResultActions();
    initHistory();
    initConfirmDialog();
    initReveal();

    handleRoute();

    // Simpan referensi kecil untuk keperluan demonstrasi di console pengembang.
    window.SakuMahasiswa = {
      prioritas: PRIORITAS,
      indikator: INDIKATOR.map(({ key, label }) => ({ key, label })),
      kategori: daftarKategori().map(({ id, nama, wajib }) => ({ id, nama, wajib })),
      penilaian: penilaianAPI(),
      contohKasus: CONTOH_KASUS,
      versi: "1.1.0",
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
