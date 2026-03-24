'use client';

import React, { useState } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useGlobalContext } from '../context/GlobalContext';
import { GlobalConfig } from '../types/config';
import { supabase } from '../lib/supabase';
import { Moon, Sun, Info } from 'lucide-react';

export default function SetelanPage() {
  const { config, setConfig } = useGlobalContext();
  const [namaMasjid, setNamaMasjid] = useState(config.nama_masjid);
  const [alamat, setAlamat] = useState(config.alamat || '');
  const [isDarkMode, setIsDarkMode] = useState(config.is_dark_mode || false);
  const [temaWarna, setTemaWarna] = useState(config.tema_warna || 'default');
  const [isSoftUi, setIsSoftUi] = useState(config.is_soft_ui || false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSimpan = async () => {
    setSaving(true);
    const payload = { 
      nama_masjid: namaMasjid, 
      alamat, 
      is_dark_mode: isDarkMode,
      tema_warna: temaWarna,
      is_soft_ui: isSoftUi,
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

      {/* Tema Tampilan */}
      <Card className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[3px] mb-2 text-muted-foreground">
          Tema & Tampilan
        </h3>
        
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-800 dark:text-slate-200">Tema Warna</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTemaWarna('default')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${temaWarna === 'default' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span className="text-xs font-black">Default Blue</span>
              </div>
            </button>
            <button
              onClick={() => setTemaWarna('neumorph')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${temaWarna === 'neumorph' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-inner"></div>
                <span className="text-xs font-black">Neumorph Style</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
          <div>
            <p className="text-xs font-black text-slate-800 dark:text-white">Soft UI Efficiency</p>
            <p className="text-[10px] font-bold text-slate-500">Gunakan desain yang lebih lembut dan modern.</p>
          </div>
          <button 
            onClick={() => setIsSoftUi(!isSoftUi)}
            className={`w-12 h-6 rounded-full transition-all relative ${isSoftUi ? 'bg-primary' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isSoftUi ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white">Mode Gelap</p>
              <p className="text-[10px] font-bold text-slate-500">Aktifkan tema gelap untuk kenyamanan mata.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-primary' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </Card>

      {/* Info Masjid */}
      <Card className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[3px] mb-2 text-muted-foreground">
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


