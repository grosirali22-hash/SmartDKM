'use client';

import React, { useState } from 'react';
import { Database, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SQL_SCRIPTS = [
  {
    title: '1. Inisialisasi Tabel Zakat',
    description: 'Jalankan script ini untuk membuat tabel zakat_settings, zakat_muzaki, zakat_mustahik, dan zakat_transaksi.',
    code: `-- 1. Zakat Settings
CREATE TABLE IF NOT EXISTS zakat_settings (
    id SERIAL PRIMARY KEY,
    harga_beras_per_kg NUMERIC DEFAULT 15000,
    nisab_maal_idr NUMERIC DEFAULT 85000000,
    baznas_zakat_percent NUMERIC DEFAULT 20,
    baznas_infaq_percent NUMERIC DEFAULT 80,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO zakat_settings (id, harga_beras_per_kg, nisab_maal_idr) 
VALUES (1, 15000, 85000000)
ON CONFLICT (id) DO NOTHING;

-- 2. Muzaki
CREATE TABLE IF NOT EXISTS zakat_muzaki (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    alamat TEXT,
    telepon TEXT,
    total_bayar_idr NUMERIC DEFAULT 0,
    total_infaq_idr NUMERIC DEFAULT 0,
    total_bayar_beras_kg NUMERIC DEFAULT 0,
    total_bayar_beras_liter NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Mustahik
CREATE TABLE IF NOT EXISTS zakat_mustahik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    alamat TEXT,
    asnaf TEXT CHECK (asnaf IN ('Fakir', 'Miskin', 'Amil', 'Muallaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnu Sabil')),
    keterangan TEXT,
    total_terima_idr NUMERIC DEFAULT 0,
    total_terima_beras_kg NUMERIC DEFAULT 0,
    total_terima_beras_liter NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transaksi
CREATE TABLE IF NOT EXISTS zakat_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe TEXT CHECK (tipe IN ('masuk', 'keluar', 'baznas_setoran')),
    muzaki_id UUID REFERENCES zakat_muzaki(id) ON DELETE SET NULL,
    mustahik_id UUID REFERENCES zakat_mustahik(id) ON DELETE SET NULL,
    jenis_zakat TEXT DEFAULT 'Fitrah',
    satuan TEXT CHECK (satuan IN ('uang', 'beras')),
    unit_beras TEXT CHECK (unit_beras IN ('kg', 'liter')) DEFAULT 'kg',
    jumlah NUMERIC NOT NULL,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_baznas_settled BOOLEAN DEFAULT FALSE,
    keterangan TEXT
);`
  },
  {
    title: '2. Otomatisasi & Realtime',
    description: 'Jalankan script ini untuk mengaktifkan trigger hitung otomatis dan update realtime.',
    code: `CREATE OR REPLACE FUNCTION update_zakat_totals() RETURNS TRIGGER AS $$
DECLARE
    target_muzaki_id UUID;
    target_mustahik_id UUID;
BEGIN
    target_muzaki_id := COALESCE(NEW.muzaki_id, OLD.muzaki_id);
    target_mustahik_id := COALESCE(NEW.mustahik_id, OLD.mustahik_id);

    IF (target_muzaki_id IS NOT NULL) THEN
        UPDATE zakat_muzaki SET
            total_bayar_idr = (SELECT COALESCE(SUM(jumlah), 0) FROM zakat_transaksi WHERE muzaki_id = target_muzaki_id AND tipe = 'masuk' AND satuan = 'uang' AND jenis_zakat != 'Infaq'),
            total_infaq_idr = (SELECT COALESCE(SUM(jumlah), 0) FROM zakat_transaksi WHERE muzaki_id = target_muzaki_id AND tipe = 'masuk' AND satuan = 'uang' AND jenis_zakat = 'Infaq'),
            total_bayar_beras_kg = (SELECT COALESCE(SUM(jumlah), 0) FROM zakat_transaksi WHERE muzaki_id = target_muzaki_id AND tipe = 'masuk' AND satuan = 'beras' AND unit_beras = 'kg'),
            total_bayar_beras_liter = (SELECT COALESCE(SUM(jumlah), 0) FROM zakat_transaksi WHERE muzaki_id = target_muzaki_id AND tipe = 'masuk' AND satuan = 'beras' AND unit_beras = 'liter')
        WHERE id = target_muzaki_id;
    END IF;

    IF (target_mustahik_id IS NOT NULL) THEN
        UPDATE zakat_mustahik SET
            total_terima_idr = (SELECT COALESCE(SUM(jumlah), 0) FROM zakat_transaksi WHERE mustahik_id = target_mustahik_id AND tipe = 'keluar' AND satuan = 'uang'),
            total_terima_beras_kg = (SELECT COALESCE(SUM(jumlah), 0) FROM zakat_transaksi WHERE mustahik_id = target_mustahik_id AND tipe = 'keluar' AND satuan = 'beras' AND unit_beras = 'kg'),
            total_terima_beras_liter = (SELECT COALESCE(SUM(jumlah), 0) FROM zakat_transaksi WHERE mustahik_id = target_mustahik_id AND tipe = 'keluar' AND satuan = 'beras' AND unit_beras = 'liter')
        WHERE id = target_mustahik_id;
    END IF;

    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_zakat_totals ON zakat_transaksi;
CREATE TRIGGER trg_update_zakat_totals
AFTER INSERT OR UPDATE OR DELETE ON zakat_transaksi
FOR EACH ROW EXECUTE FUNCTION update_zakat_totals();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE zakat_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE zakat_muzaki;
ALTER PUBLICATION supabase_realtime ADD TABLE zakat_mustahik;
ALTER PUBLICATION supabase_realtime ADD TABLE zakat_transaksi;`
  }
];

export default function SetupGuidePage() {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href="/dashboard/zakat" 
          className="p-2 hover:bg-secondary rounded-full transition-all text-muted-foreground hover:text-muted-foreground"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Database Setup Guide</h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[4px] mt-1">Langkah-langkah inisialisasi modul zakat</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 flex gap-6 items-start">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-amber-900">Perhatian: SQL Editor Diperlukan</h3>
          <p className="text-sm text-amber-700 leading-relaxed font-bold">
            Gunakan <strong>SQL Editor</strong> di dashboard Supabase Anda untuk menjalankan script di bawah ini. 
            Script ini akan membuat tabel-tabel yang diperlukan agar modul Zakat dapat berfungsi.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {SQL_SCRIPTS.map((script, index) => (
          <div key={index} className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">{script.title}</h2>
                <p className="text-sm text-muted-foreground font-bold mt-1">{script.description}</p>
              </div>
              <button 
                onClick={() => handleCopy(script.code, index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                  copied === index ? 'bg-blue-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-slate-200'
                }`}
              >
                {copied === index ? (
                  <><CheckCircle className="w-4 h-4" /> Tersalin!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Salin SQL</>
                )}
              </button>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 shadow-inner overflow-x-auto">
              <pre className="text-xs font-mono text-blue-400/90 leading-relaxed">
                <code>{script.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-border text-center">
        <p className="text-muted-foreground text-sm font-bold">
          Setelah menjalankan kedua script di atas, silakan kembali ke halaman Zakat dan klik "Coba Lagi".
        </p>
      </div>
    </div>
  );
}


