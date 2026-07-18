/** Enum jenis bidang formulir */
export enum JenisField {
  TEKSTO = "TEKSTO",
  EMAIL = "EMAIL",
  AREA_TEKSTO = "AREA_TEKSTO",
  NOMOR = "NOMOR",
}

/** Satu bidang di dalam formulir */
export interface BidangFormulir {
  id: string;
  label: string;
  jenis: JenisField;
  wajib: boolean;
}

/** Konfigurasi tampilan formulir */
export interface KonfigurasiFormulir {
  judul: string;
  deskripsi: string;
}

/** Representasi satu formulir */
export interface Formulir {
  id: string;
  judul: string;
  pemilik: string;
  bidang: BidangFormulir[];
  aktif: boolean;
  jumlahKiriman: number;
  dibuatPada: number;
}

/** Satu kiriman/submission ke formulir */
export interface Kiriman {
  id: string;
  idFormulir: string;
  hashBlob: string;
  dikirimPada: number;
}

/** Hasil unggah ke penyimpanan terdesentralisasi */
export interface HasilUpload {
  hash: string;
  url: string;
}
