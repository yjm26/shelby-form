import { describe, expect, expectTypeOf, it } from "vitest";
import {
  JenisField,
  type Formulir,
  type Kiriman,
  type BidangFormulir,
  type KonfigurasiFormulir,
  type HasilUpload,
} from "../scripts/tipe.ts";

describe("JenisField enum", () => {
  it("memiliki 4 nilai: TEKSTO, EMAIL, AREA_TEKSTO, NOMOR", () => {
    expect(JenisField.TEKSTO).toBe("TEKSTO");
    expect(JenisField.EMAIL).toBe("EMAIL");
    expect(JenisField.AREA_TEKSTO).toBe("AREA_TEKSTO");
    expect(JenisField.NOMOR).toBe("NOMOR");
    expect(Object.values(JenisField)).toHaveLength(4);
  });
});

describe("Formulir type", () => {
  it("memiliki field wajib: id, judul, pemilik, bidang, aktif, jumlahKiriman, dibuatPada", () => {
    const formulir = {
      id: "form-1",
      judul: "Formulir Test",
      pemilik: "0xabc",
      bidang: [] as BidangFormulir[],
      aktif: true,
      jumlahKiriman: 0,
      dibuatPada: Date.now(),
    } satisfies Formulir;

    expect(formulir.id).toBe("form-1");
    expect(formulir.judul).toBe("Formulir Test");
    expect(formulir.pemilik).toBe("0xabc");
    expect(formulir.bidang).toEqual([]);
    expect(formulir.aktif).toBe(true);
    expect(formulir.jumlahKiriman).toBe(0);
    expect(typeof formulir.dibuatPada).toBe("number");

    expectTypeOf(formulir).toEqualTypeOf<Formulir>();
  });
});

describe("Kiriman type", () => {
  it("memiliki field wajib: id, idFormulir, hashBlob, dikirimPada", () => {
    const kiriman = {
      id: "kir-1",
      idFormulir: "form-1",
      hashBlob: "sha256:abc123",
      dikirimPada: Date.now(),
    } satisfies Kiriman;

    expect(kiriman.id).toBe("kir-1");
    expect(kiriman.idFormulir).toBe("form-1");
    expect(kiriman.hashBlob).toBe("sha256:abc123");
    expect(typeof kiriman.dikirimPada).toBe("number");

    expectTypeOf(kiriman).toEqualTypeOf<Kiriman>();
  });
});

describe("HasilUpload type", () => {
  it("memiliki field hash dan url", () => {
    const hasil = {
      hash: "sha256:def456",
      url: "https://example.com/file.txt",
    } satisfies HasilUpload;

    expect(hasil.hash).toBe("sha256:def456");
    expect(hasil.url).toBe("https://example.com/file.txt");

    expectTypeOf(hasil).toEqualTypeOf<HasilUpload>();
  });
});

describe("KonfigurasiFormulir type", () => {
  it("bisa dibuat dengan judul dan deskripsi", () => {
    const config: KonfigurasiFormulir = {
      judul: "Formulir Kontak",
      deskripsi: "Silakan isi formulir ini",
    };

    expect(config.judul).toBe("Formulir Kontak");
    expect(config.deskripsi).toBe("Silakan isi formulir ini");
  });
});

describe("BidangFormulir type", () => {
  it("memiliki field wajib: id, label, jenis, wajib", () => {
    const bidang: BidangFormulir = {
      id: "bid-1",
      label: "Nama Lengkap",
      jenis: JenisField.TEKSTO,
      wajib: true,
    };

    expect(bidang.id).toBe("bid-1");
    expect(bidang.label).toBe("Nama Lengkap");
    expect(bidang.jenis).toBe(JenisField.TEKSTO);
    expect(bidang.wajib).toBe(true);
  });
});
