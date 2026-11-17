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
  const THEME_KEY = "saku-tema";
  const MAX_HISTORY = 100;

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

  function getNominalNumber() {
    const input = $("#nominal");
    if (!input) return null;
    const raw = input.dataset.raw !== undefined ? input.dataset.raw : input.value.replace(/\D/g, "");
    if (!raw) return null;
    const number = Number(raw);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function collectFormData() {
    const namaInput = $("#nama-pengeluaran");
    return {
      nama: namaInput ? namaInput.value.trim() : "",
      nominal: getNominalNumber(),
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
        hint.textContent = "Semua data lengkap. Tekan Analisis Prioritas untuk melihat hasil.";
      } else if (selectedCount === INDIKATOR.length) {
        hint.textContent = "Nama pengeluaran masih kosong. Isi nama agar tombol analisis aktif.";
      } else {
        const sisa = INDIKATOR.length - selectedCount;
        hint.textContent = data.nama
          ? `${sisa} indikator lagi belum dipilih. Lengkapi semua indikator untuk mengaktifkan tombol analisis.`
          : "Isi nama pengeluaran dan lengkapi kelima indikator untuk mengaktifkan tombol analisis.";
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

  function setNominalValue(value) {
    const input = $("#nominal");
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

  function initNominalInput() {
    const input = $("#nominal");
    if (!input) return;

    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "").slice(0, 15);
      input.dataset.raw = digits;
      input.value = digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
    });
  }

  function resetFormState() {
    const form = $("#form-analisis");
    if (form) form.reset();
    setNominalValue("");
    state.currentResult = null;
    state.saved = false;
    syncOptionCards();
    updateFormState();
  }

  function initForm() {
    renderIndicators();
    renderProgressList();
    initNominalInput();

    const form = $("#form-analisis");
    const nameInput = $("#nama-pengeluaran");
    if (!form) return;

    if (nameInput) nameInput.addEventListener("input", updateFormState);

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        setNominalValue("");
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
            ? "Isi nama pengeluaran dan lengkapi kelima indikator terlebih dahulu."
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
        state.currentResult = {
          nama: data.nama,
          nominal: data.nominal,
          fakta: data.fakta,
          inference: hasil,
          analyzedAt: new Date().toISOString(),
        };
        state.saved = false;
        setAnalyzing(false);
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
            <span class="meta-pill">${icon("i-wallet")} ${formatRupiah(result.nominal)}</span>
            <span class="meta-pill">${icon("i-calendar")} ${escapeHtml(formatTanggal(result.analyzedAt))}</span>
          </div>
          <div class="result-summary">
            ${summaryFactGrid(result.fakta)}
          </div>
        </section>

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

  function normalizeHistoryItem(item) {
    if (!item || typeof item !== "object") return null;
    if (typeof item.nama !== "string" || !isPriority(item.priority)) return null;

    const nominalNumber = Number(item.nominal);
    const nominal =
      item.nominal === null || item.nominal === undefined || item.nominal === "" || !Number.isFinite(nominalNumber)
        ? null
        : nominalNumber;

    const fakta = item.fakta && typeof item.fakta === "object" ? item.fakta : {};

    return {
      id: String(item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      nama: item.nama.slice(0, 120),
      nominal,
      priority: item.priority,
      ruleId: typeof item.ruleId === "string" ? item.ruleId : null,
      ruleDesc: typeof item.ruleDesc === "string" ? item.ruleDesc : "",
      fakta,
      createdAt:
        typeof item.createdAt === "string" && !Number.isNaN(new Date(item.createdAt).getTime())
          ? item.createdAt
          : new Date().toISOString(),
    };
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

  function saveCurrentResult() {
    const result = state.currentResult;
    if (!result || !result.inference || result.inference.status !== "cocok") return;
    if (state.saved) {
      showToast("Hasil ini sudah tersimpan di riwayat.");
      return;
    }

    const aturan = result.inference.aturan;
    const priority = PRIORITAS[aturan.hasil];
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nama: result.nama,
      nominal: result.nominal,
      priority: aturan.hasil,
      ruleId: aturan.id,
      ruleDesc: aturan.deskripsi,
      fakta: { ...result.fakta },
      createdAt: new Date().toISOString(),
    };

    state.history = [item, ...state.history].slice(0, MAX_HISTORY);
    if (!persistHistory()) {
      state.history = state.history.filter((historyItem) => historyItem.id !== item.id);
      return;
    }

    state.saved = true;
    renderResult();
    renderHistory();
    showToast(`"${result.nama}" (${aturan.hasil} · ${priority.nama}) disimpan ke riwayat.`);
  }

  function sortedHistory(items) {
    const urutan = { P1: 1, P2: 2, P3: 3, P4: 4 };
    return [...items].sort((a, b) => {
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
              <small>${items.length} pengeluaran</small>
            </span>
          </button>`;
      })
      .join("");
  }

  function renderHistoryItem(item) {
    const priority = PRIORITAS[item.priority];
    return `
      <article class="history-item" data-priority="${item.priority}">
        <div class="history-priority">
          <strong>${item.priority}</strong>
          <span>${escapeHtml(priority.nama)}</span>
        </div>
        <div class="history-main">
          <div class="history-top">
            <h3 class="history-name">${escapeHtml(item.nama)}</h3>
            <span class="history-amount">${formatRupiah(item.nominal)}</span>
          </div>
          <div class="history-meta">
            <span>${icon("i-calendar")} ${escapeHtml(formatTanggal(item.createdAt))}</span>
            ${item.ruleId ? `<span>${icon("i-rule")} Aturan ${escapeHtml(item.ruleId)}</span>` : ""}
          </div>
          ${item.ruleDesc ? `<p class="history-desc">${escapeHtml(item.ruleDesc)}</p>` : ""}
        </div>
        <div class="history-actions">
          <button class="icon-btn history-delete" type="button" data-delete="${escapeHtml(item.id)}" aria-label="Hapus riwayat ${escapeHtml(item.nama)}">
            ${icon("i-trash")}
          </button>
        </div>
        <details class="history-details">
          <summary>Lihat rincian indikator</summary>
          <div class="history-facts">
            ${INDIKATOR.map(
              (indikator) => `
                <span><strong>${escapeHtml(indikator.label)}:</strong> ${escapeHtml(item.fakta[indikator.key] || "—")}</span>`
            ).join("")}
          </div>
        </details>
      </article>`;
  }

  function renderHistory() {
    const stats = $("#riwayat-stats");
    const list = $("#riwayat-list");
    const count = $("#riwayat-count");
    const clearButton = $("#btn-hapus-semua");
    if (!list) return;

    renderHistoryStats();

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
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-illustration">${icon("i-wallet")}</span>
          <h2>Belum ada analisis yang disimpan</h2>
          <p>Simpan hasil analisis pertamamu agar prioritas pengeluaran mudah dipantau kembali. Data disimpan lokal di browser ini.</p>
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

    list.innerHTML = filtered.map(renderHistoryItem).join("");
  }

  function setHistoryFilter(filter) {
    const valid = filter === "Semua" || isPriority(filter);
    state.historyFilter = valid ? filter : "Semua";
    renderHistory();
  }

  function deleteHistoryItem(id) {
    const item = state.history.find((historyItem) => historyItem.id === id);
    if (!item) return;

    askConfirm({
      title: "Hapus riwayat?",
      message: `"${item.nama}" (${item.priority}) akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus",
    }).then((confirmed) => {
      if (!confirmed) return;
      state.history = state.history.filter((historyItem) => historyItem.id !== id);
      if (!persistHistory()) return;
      renderHistory();
      showToast("Riwayat berhasil dihapus.");
    });
  }

  function clearHistory() {
    if (!state.history.length) return;
    askConfirm({
      title: "Hapus semua riwayat?",
      message: `Seluruh ${state.history.length} riwayat analisis akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus Semua",
    }).then((confirmed) => {
      if (!confirmed) return;
      state.history = [];
      state.historyFilter = "Semua";
      if (!persistHistory()) return;
      renderHistory();
      showToast("Semua riwayat berhasil dihapus.");
    });
  }

  function initHistory() {
    state.history = loadHistory();

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
    }

    const clearButton = $("#btn-hapus-semua");
    if (clearButton) clearButton.addEventListener("click", clearHistory);

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        state.history = loadHistory();
        if (state.currentView === "riwayat") renderHistory();
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
      contohKasus: CONTOH_KASUS,
      versi: "1.0.0",
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
