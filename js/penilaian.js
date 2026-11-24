/**
 * SISTEM PENILAIAN PRIORITAS — SAKU MAHASISWA
 * -------------------------------------------
 * Menghitung skor prioritas 0–100 dari empat kriteria berbobot tetap:
 *   - Tingkat kebutuhan ............... 35%
 *   - Tingkat urgensi ................. 30%
 *   - Manfaat untuk perkuliahan ....... 25%
 *   - Kesesuaian harga dengan dana .... 10%
 * Total bobot = 100%.
 *
 * Skor ini melengkapi (bukan menggantikan) inferensi forward chaining.
 * Kategori wajib (UKT, uang makan, transportasi, kos) menaikkan skor
 * tingkat kebutuhan minimal 90 agar kebutuhan pokok tidak terabaikan.
 *
 * Fungsi utama:
 *   hitungSkor(item)        -> { total, komponen, wajib, ... }
 *   bandingkan(daftarItem)  -> daftar terurut skor tertinggi
 *   alasan(item, daftar)    -> penjelasan yang mudah dipahami
 *   rekomendasi(daftar)     -> kebutuhan yang sebaiknya dipenuhi dahulu
 */
(function (root) {
  "use strict";

  const BOBOT = Object.freeze({
    kebutuhan: 35,
    urgensi: 30,
    manfaat: 25,
    harga: 10,
  });

  const SKALA_NILAI = Object.freeze({
    Rendah: 40,
    Sedang: 70,
    Tinggi: 100,
  });

  const SKOR_HARGA_NETRAL = 60;
  const SKOR_WAJIB_MINIMAL = 90;

  const KATEGORI = Object.freeze([
    {
      id: "ukt",
      nama: "UKT Perkuliahan",
      wajib: true,
      ikon: "i-cap",
      alias: ["ukt", "spp", "biaya kuliah", "semester"],
      keterangan: "Biaya wajib perkuliahan setiap semester.",
    },
    {
      id: "peralatan",
      nama: "Peralatan Kuliah",
      wajib: false,
      ikon: "i-edit",
      alias: ["alat tulis", "buku", "peralatan", "stationery"],
      keterangan: "Alat tulis, buku, atau perlengkapan belajar.",
    },
    {
      id: "laptop",
      nama: "Beli Laptop",
      wajib: false,
      ikon: "i-book",
      alias: ["laptop", "komputer", "pc", "notebook"],
      keterangan: "Perangkat utama untuk menunjang perkuliahan.",
    },
    {
      id: "skincare",
      nama: "Skincare (Perempuan)",
      wajib: false,
      ikon: "i-heart",
      alias: ["skincare", "perawatan wajah", "kosmetik"],
      keterangan: "Opsional; siapa pun tetap boleh mengetik kebutuhan serupa.",
    },
    {
      id: "makan",
      nama: "Uang Makan",
      wajib: true,
      ikon: "i-bag",
      alias: ["makan", "makanan", "uang makan", "konsumsi"],
      keterangan: "Kebutuhan pokok harian.",
    },
    {
      id: "transportasi",
      nama: "Uang Transportasi",
      wajib: true,
      ikon: "i-cart",
      alias: ["transport", "transportasi", "ongkos", "bensin", "ojek"],
      keterangan: "Biaya mobilitas menuju kampus dan kegiatan kuliah.",
    },
    {
      id: "kos",
      nama: "Bayar Kos",
      wajib: true,
      ikon: "i-wallet",
      alias: ["kos", "kost", "sewa", "tempat tinggal"],
      keterangan: "Tempat tinggal yang menunjang aktivitas kuliah.",
    },
    {
      id: "kuota",
      nama: "Kuota/Internet",
      wajib: false,
      ikon: "i-sparkle",
      alias: ["kuota", "internet", "data", "wifi", "pulsa"],
      keterangan: "Akses internet untuk pembelajaran daring.",
    },
    {
      id: "lainnya",
      nama: "Kebutuhan Lainnya",
      wajib: false,
      ikon: "i-help",
      alias: ["lainnya", "lain", "kebutuhan lain"],
      keterangan: "Kebutuhan lain yang tidak termasuk kategori di atas.",
    },
  ]);

  const KATEGORI_KHUSUS = Object.freeze({
    id: "khusus",
    nama: "Kebutuhan Khusus",
    wajib: false,
    ikon: "i-edit",
    alias: [],
    keterangan: "Kebutuhan yang diketik sendiri oleh pengguna.",
  });

  function normalisasiTeks(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function kategoriById(id) {
    return KATEGORI.find((kategori) => kategori.id === id) || null;
  }

  function cariKategori(nama) {
    const teks = normalisasiTeks(nama);
    if (!teks) return null;

    const persis = KATEGORI.find((kategori) => normalisasiTeks(kategori.nama) === teks);
    if (persis) return persis;

    return (
      KATEGORI.find((kategori) =>
        (kategori.alias || []).some((alias) => {
          const a = normalisasiTeks(alias);
          return a && (teks === a || teks.includes(a));
        })
      ) || null
    );
  }

  function resolveKategori(item) {
    if (item && item.kategori && typeof item.kategori === "object") {
      return item.kategori;
    }
    if (item && typeof item.kategoriId === "string") {
      const dariId = kategoriById(item.kategoriId);
      if (dariId) return dariId;
    }
    return cariKategori(item && item.nama) || KATEGORI_KHUSUS;
  }

  function nilaiSkala(nilai) {
    return Object.prototype.hasOwnProperty.call(SKALA_NILAI, nilai)
      ? SKALA_NILAI[nilai]
      : 50;
  }

  function angkaPositif(value) {
    const angka = Number(value);
    return Number.isFinite(angka) && angka > 0 ? angka : null;
  }

  function skorKesesuaianHarga(nominal, dana) {
    const harga = angkaPositif(nominal);
    const anggaran = angkaPositif(dana);
    if (!harga || !anggaran) return SKOR_HARGA_NETRAL;

    const rasio = harga / anggaran;
    if (rasio <= 0.1) return 100;
    if (rasio <= 0.25) return 85;
    if (rasio <= 0.5) return 70;
    if (rasio <= 0.75) return 55;
    if (rasio <= 1) return 40;
    return 20;
  }

  function bulatkan(value) {
    return Math.round(value * 10) / 10;
  }

  function komponen(label, bobot, nilai, tambahan) {
    return Object.assign(
      {
        label,
        bobot,
        nilai: Math.round(nilai),
        kontribusi: bulatkan((nilai * bobot) / 100),
      },
      tambahan || {}
    );
  }

  function hitungSkor(item) {
    const sumber = item && typeof item === "object" ? item : {};
    const fakta = sumber.fakta && typeof sumber.fakta === "object" ? sumber.fakta : {};
    const kategori = resolveKategori(sumber);
    const wajib =
      typeof sumber.wajib === "boolean" ? sumber.wajib : Boolean(kategori && kategori.wajib);

    const dasarKebutuhan = nilaiSkala(fakta.kepentingan);
    const nilaiKebutuhan = wajib
      ? Math.max(dasarKebutuhan, SKOR_WAJIB_MINIMAL)
      : dasarKebutuhan;
    const nilaiUrgensi = nilaiSkala(fakta.urgensi);
    const nilaiManfaat = nilaiSkala(fakta.kaitan);
    const nilaiHarga = skorKesesuaianHarga(sumber.nominal, sumber.dana);

    const komponenSkor = {
      kebutuhan: komponen("Tingkat kebutuhan", BOBOT.kebutuhan, nilaiKebutuhan, {
        wajib,
        dasar: Math.round(dasarKebutuhan),
      }),
      urgensi: komponen("Tingkat urgensi", BOBOT.urgensi, nilaiUrgensi),
      manfaat: komponen("Manfaat perkuliahan", BOBOT.manfaat, nilaiManfaat),
      harga: komponen("Kesesuaian harga", BOBOT.harga, nilaiHarga, {
        netral: !(angkaPositif(sumber.nominal) && angkaPositif(sumber.dana)),
      }),
    };

    const totalMentah =
      (nilaiKebutuhan * BOBOT.kebutuhan +
        nilaiUrgensi * BOBOT.urgensi +
        nilaiManfaat * BOBOT.manfaat +
        nilaiHarga * BOBOT.harga) /
      100;

    return {
      total: bulatkan(totalMentah),
      komponen: komponenSkor,
      wajib,
      kategoriId: kategori ? kategori.id : KATEGORI_KHUSUS.id,
      kategoriNama: kategori ? kategori.nama : KATEGORI_KHUSUS.nama,
      dana: angkaPositif(sumber.dana),
      nominal: angkaPositif(sumber.nominal),
      bobot: Object.assign({}, BOBOT),
    };
  }

  const URUTAN_PRIORITAS = { P1: 1, P2: 2, P3: 3, P4: 4 };

  function bandingkan(daftarItem) {
    const daftar = Array.isArray(daftarItem) ? daftarItem : [];
    return daftar
      .map((item) => {
        const skor =
          item && item.skor && typeof item.skor.total === "number"
            ? item.skor
            : hitungSkor(item);
        return Object.assign({}, item, { skor });
      })
      .sort((a, b) => {
        const aPunya = isPriority(a.priority);
        const bPunya = isPriority(b.priority);
        if (aPunya !== bPunya) return aPunya ? -1 : 1;

        const selisihSkor = (b.skor.total || 0) - (a.skor.total || 0);
        if (selisihSkor !== 0) return selisihSkor;

        const selisihPrioritas =
          (URUTAN_PRIORITAS[a.priority] || 99) - (URUTAN_PRIORITAS[b.priority] || 99);
        if (selisihPrioritas !== 0) return selisihPrioritas;

        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }

  function isPriority(value) {
    return Object.prototype.hasOwnProperty.call(URUTAN_PRIORITAS, value);
  }

  function labelKekuatan(komponenSkor, nilai) {
    if (nilai >= 85) return `sangat ${komponenSkor}`;
    if (nilai >= 70) return komponenSkor;
    return "";
  }

  function gabungDaftar(daftar) {
    if (daftar.length <= 1) return daftar.join("");
    if (daftar.length === 2) return `${daftar[0]} dan ${daftar[1]}`;
    return `${daftar.slice(0, -1).join(", ")}, dan ${daftar[daftar.length - 1]}`;
  }

  function alasan(item, semua) {
    const skor = item && item.skor ? item.skor : hitungSkor(item);
    const k = skor.komponen;
    const nama = (item && item.nama) || "Kebutuhan ini";

    const kuat = [];
    if (k.kebutuhan.nilai >= 85) kuat.push("tingkat kebutuhan sangat tinggi");
    else if (k.kebutuhan.nilai >= 70) kuat.push("tingkat kebutuhan tinggi");

    if (k.urgensi.nilai >= 85) kuat.push("urgensi sangat mendesak");
    else if (k.urgensi.nilai >= 70) kuat.push("urgensi tinggi");

    if (k.manfaat.nilai >= 85) kuat.push("manfaat untuk perkuliahan sangat besar");
    else if (k.manfaat.nilai >= 70) kuat.push("manfaat untuk perkuliahan besar");

    if (k.harga.nilai >= 85) kuat.push("harga sangat sesuai dengan dana tersedia");
    else if (k.harga.nilai >= 70) kuat.push("harga masih sesuai dengan dana tersedia");

    if (skor.wajib) kuat.push("termasuk kebutuhan wajib");

    const lemah = [];
    if (k.kebutuhan.nilai < 50) lemah.push("tingkat kebutuhan rendah");
    if (k.urgensi.nilai < 50) lemah.push("urgensi rendah");
    if (k.manfaat.nilai < 50) lemah.push("manfaat perkuliahan rendah");
    if (k.harga.nilai < 50) lemah.push("harga relatif berat dibanding dana");

    let teks = `${nama} memperoleh skor ${skor.total}/100`;
    teks += kuat.length ? ` karena ${gabungDaftar(kuat)}` : " berdasarkan penilaian empat kriteria";
    teks += ".";
    if (lemah.length) teks += ` Yang perlu diperhatikan: ${gabungDaftar(lemah)}.`;

    if (Array.isArray(semua) && semua.length > 1) {
      const peringkat = semua.findIndex((lain) => lain.id && item.id && lain.id === item.id);
      if (peringkat > 0) {
        const teratas = semua[0];
        const selisih = bulatkan((teratas.skor.total || 0) - skor.total);
        teks += ` Skor ini ${selisih} poin di bawah ${teratas.nama} yang berada di urutan pertama.`;
      }
    }

    return teks;
  }

  function rekomendasi(daftar) {
    if (!Array.isArray(daftar) || !daftar.length) return null;
    const teratas = daftar[0];
    const skor = teratas.skor || hitungSkor(teratas);
    const k = skor.komponen;

    let teks = `${teratas.nama} sebaiknya dipenuhi lebih dahulu karena memiliki skor prioritas tertinggi (${skor.total}/100).`;
    if (skor.wajib) {
      teks += " Kategori ini termasuk kebutuhan wajib yang sebaiknya tidak ditunda.";
    }
    if (k.urgensi.nilai >= 85) {
      teks += " Urgensinya sangat mendesak sehingga penundaan berisiko mengganggu aktivitas.";
    } else if (k.kebutuhan.nilai >= 85) {
      teks += " Tingkat kebutuhannya sangat tinggi dan sulit digantikan.";
    }
    if (daftar.length > 1) {
      const berikutnya = daftar[1];
      const selisih = bulatkan(skor.total - (berikutnya.skor ? berikutnya.skor.total : hitungSkor(berikutnya).total));
      if (selisih > 0) {
        teks += ` Skornya ${selisih} poin lebih tinggi daripada ${berikutnya.nama}.`;
      }
    }
    return { utama: teratas, alasan: teks, skor };
  }

  const API = {
    BOBOT,
    SKALA_NILAI,
    SKOR_HARGA_NETRAL,
    SKOR_WAJIB_MINIMAL,
    KATEGORI,
    KATEGORI_KHUSUS,
    kategoriById,
    cariKategori,
    resolveKategori,
    nilaiSkala,
    skorKesesuaianHarga,
    hitungSkor,
    bandingkan,
    alasan,
    rekomendasi,
    isPriority,
    normalisasiTeks,
  };

  root.SAKU_PENILAIAN = API;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  }
})(typeof window !== "undefined" ? window : globalThis);
