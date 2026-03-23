export interface Muzaki {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  total_bayar_idr: number;
  total_infaq_idr: number;
  total_bayar_beras_kg: number;
  total_bayar_beras_liter: number;
}

export interface Mustahik {
  id: string;
  nama: string;
  alamat: string;
  asnaf: string;
  keterangan: string;
  total_terima_idr: number;
  total_terima_beras_kg: number;
  total_terima_beras_liter: number;
}

export interface Transaksi {
  id: string;
  tipe: 'masuk' | 'keluar' | 'baznas_setoran';
  muzaki_id?: string;
  mustahik_id?: string;
  jenis_zakat: string;
  satuan: 'uang' | 'beras';
  unit_beras: 'kg' | 'liter';
  jumlah: number;
  waktu: string;
  is_baznas_settled: boolean;
  muzaki?: { nama: string; alamat?: string; telepon?: string };
  mustahik?: { nama: string; alamat?: string; asnaf?: string };
}

export interface CartItem {
  id: string;
  jenis_zakat: string;
  satuan: 'uang' | 'beras';
  unit_beras?: 'kg' | 'liter';
  jumlah: number;
}

export type Tab = 'kalkulator' | 'muzaki' | 'mustahik' | 'penerimaan' | 'penyaluran' | 'baznas' | 'laporan' | 'pengaturan';
