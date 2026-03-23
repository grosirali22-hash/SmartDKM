'use client';

import React, { useState } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useGlobalContext } from '../context/GlobalContext';
import { supabase } from '../lib/supabase';
import { Moon, Sun, Info } from 'lucide-react';

export default function SetelanPage() {
  const { config, setConfig } = useGlobalContext();
  const [namaMasjid, setNamaMasjid] = useState(config.nama_masjid);
  const [alamat, setAlamat] = useState(config.alamat || '');
  const [isDarkMode, setIsDarkMode] = useState(config.is_dark_mode || false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSimpan = async () => {
    setSaving(true);
    const payload = { 
      nama_masjid: namaMasjid, 
      alamat, 
      is_dark_mode: isDarkMode,
    };

    setConfig({ ...config, ...payload });

    const { error } = await supabase
      .from('settings')
      .update(payload)
      .eq('id', (config as any).id || 1);

    setSaving(false);
    if (error) {
      alert('Gagal menyimpan ke database: ' + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Setelan" subtitle="Pengaturan Masjid & Tampilan" />

      {/* Info Masjid */}
      <Card className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-[3px] mb-4 text-muted-foreground">
          Informasi Masjid
        </h3>
        <Input
          label="Nama Masjid"
          placeholder="Masjid Al-Istiqomah"
          value={namaMasjid}
          onChange={(e) => setNamaMasjid(e.target.value)}
        />
        <Input
          label="Alamat"
          placeholder="Sukabumi, Jawa Barat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
        />

        {/* Running Text Note */}
        <div className="flex items-center gap-3 rounded-lg p-3 bg-blue-50 border border-blue-200">
          <Info className="w-4 h-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-xs font-black text-blue-800">Running Text</p>
            <p className="text-xs font-bold text-blue-600">
              Running text dikelola di halaman{' '}
              <a href="/running-text" className="underline font-black">Running Text →</a>
            </p>
          </div>
        </div>
      </Card>





      {saved && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-700 font-black text-sm">✅ Pengaturan berhasil disimpan!</p>
        </div>
      )}

      <Button variant="success" onClick={handleSimpan} disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>

      {/* App Info */}
      <Card>
        <SectionTitle title="Informasi Aplikasi" subtitle="Versi & Lisensi" />
        <div className="space-y-2 mt-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Versi</span>
            <span className="font-bold text-foreground text-sm">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Framework</span>
            <span className="font-bold text-foreground text-sm">Next.js 14</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Database</span>
            <span className="font-bold text-foreground text-sm">Supabase</span>
          </div>
        </div>
      </Card>
    </div>
  );
}


