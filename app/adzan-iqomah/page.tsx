'use client';

import React, { useState, useEffect } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FileUpload from '../components/FileUpload';
import { supabase } from '../lib/supabase';
import { deleteMedia } from '../lib/uploadMedia';
import AdzanOverlay from '../components/AdzanOverlay';
import { Image as ImageIcon, Video, Palette, Play } from 'lucide-react';

export default function AdzanSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form State
  const [id, setId] = useState<string | null>(null);
  const [bgType, setBgType] = useState<'color' | 'image' | 'video'>('color');
  const [bgValue, setBgValue] = useState('bg-blue-950');
  const [pesanIqomah, setPesanIqomah] = useState('Mohon luruskan shaf dan matikan alat komunikasi');
  const [iqomahTime, setIqomahTime] = useState(10);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('adzan_settings').select('*').single();
    if (data) {
      setId(data.id);
      setBgType(data.bg_type);
      setBgValue(data.bg_value);
      setPesanIqomah(data.pesan_iqomah);
      setIqomahTime(data.iqomah_time);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      bg_type: bgType,
      bg_value: bgValue,
      pesan_iqomah: pesanIqomah,
      iqomah_time: iqomahTime,
    };

    let error;
    if (id) {
      const res = await supabase.from('adzan_settings').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabase.from('adzan_settings').insert(payload).select().single();
      error = res.error;
      if (res.data) setId(res.data.id);
    }
    setSaving(false);
    if (error) {
      alert('Gagal menyimpan pengaturan: ' + error.message);
    } else {
      alert('Pengaturan Adzan & Iqomah berhasil disimpan!');
    }
  };

  const handleUpload = (url: string, file: File) => {
    // Kalo sebelumnya ada file gambar/video lama, hapus dulu dari storage (opsional/best-practice)
    if (bgValue && bgValue.startsWith('http')) {
      deleteMedia(bgValue);
    }

    if (file.type.startsWith('video/')) {
      setBgType('video');
    } else {
      setBgType('image');
    }
    setBgValue(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Adzan & Iqomah" subtitle="Pengaturan Layar Peringatan Adzan" />
        <Button onClick={() => setShowPreview(true)} variant="outline">
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4" /> Preview
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-6 pt-4">
          <Card className="space-y-4">
            <h3 className="font-bold text-foreground border-b border-border pb-2">Background Layar</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => { setBgType('color'); setBgValue('bg-blue-950'); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  bgType === 'color' ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-blue-200'
                }`}
              >
                <Palette className={`w-6 h-6 ${bgType === 'color' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold text-muted-foreground">Solid Color</span>
              </button>
              <button
                onClick={() => setBgType('image')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  bgType === 'image' ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-blue-200'
                }`}
              >
                <ImageIcon className={`w-6 h-6 ${bgType === 'image' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold text-muted-foreground">Gambar</span>
              </button>
              <button
                onClick={() => setBgType('video')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  bgType === 'video' ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-blue-200'
                }`}
              >
                <Video className={`w-6 h-6 ${bgType === 'video' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold text-muted-foreground">Video Loop</span>
              </button>
            </div>

            {bgType === 'color' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pilih Warna Tailwind</label>
                <select 
                  value={bgValue} 
                  onChange={(e) => setBgValue(e.target.value)}
                  className="w-full border-border rounded-lg bg-muted px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bg-blue-950">blue 950 (Default)</option>
                  <option value="bg-slate-950">Slate 950 (Gelap)</option>
                  <option value="bg-blue-950">Blue 950</option>
                  <option value="bg-indigo-950">Indigo 950</option>
                  <option value="bg-black">Full Black</option>
                </select>
              </div>
            )}

            {(bgType === 'image' || bgType === 'video') && (
              <>
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-blue-700">
                    {bgType === 'image'
                      ? 'Rekomendasi: 1920 × 1080px (16:9) • Maks 5 MB • Format: JPG, PNG'
                      : 'Rekomendasi: 1920 × 1080px (16:9) • Maks 30 MB • Format: MP4, WebM'}
                  </p>
                </div>
                <FileUpload 
                  accept={bgType === 'image' ? 'image/*' : 'video/*'} 
                  folder="adzan_bg" 
                  onUploaded={handleUpload}
                  label={`Upload ${bgType === 'image' ? 'Gambar' : 'Video'}`}
                />
              </>
            )}

            {(bgType === 'image' || bgType === 'video') && bgValue.startsWith('http') && (
              <div className="mt-4 p-2 border border-border rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground mb-2 font-bold">Media Aktif:</p>
                {bgType === 'video' ? (
                  <video src={bgValue} className="w-full h-32 object-cover rounded-lg" muted loop playsInline autoPlay />
                ) : (
                  <img src={bgValue} alt="bg" className="w-full h-32 object-cover rounded-lg" />
                )}
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold text-foreground border-b border-border pb-2">Pengaturan Konten</h3>
            <Input
              label="Waktu Hitung Mundur Iqomah (Menit)"
              type="number"
              value={iqomahTime.toString()}
              onChange={(e) => setIqomahTime(Number(e.target.value))}
            />
            <Input
              label="Teks Peringatan di Layar"
              value={pesanIqomah}
              onChange={(e) => setPesanIqomah(e.target.value)}
            />
          </Card>

          <Button variant="success" onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-[72px]">
            <Card className="bg-blue-50 border-blue-100">
              <h3 className="font-black text-blue-800 mb-2">Info Cara Kerja</h3>
              <p className="text-blue-700 text-sm leading-relaxed mb-4">
                Layar peringatan ini akan menutupi seluruh layar secara otomatis ketika waktu shalat tiba, berdasarkan jadwal Kemenag (lokasi GPS perangkat penampil).
              </p>
              <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
                <li>Timer Iqomah akan langsung berjalan mundur.</li>
                <li>Gunakan <b>Video Loop</b> berukuran kecil untuk memberikan efek dinamis.</li>
                <li>Layar akan otomatis tertutup 15 menit setelah waktu shalat masuk.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {showPreview && (
        <AdzanOverlay
          visible={true}
          namaShalat="MAGHRIB (PREVIEW)"
          iqomahTime={iqomahTime}
          onClose={() => setShowPreview(false)}
          customBgType={bgType}
          customBgValue={bgValue}
          customPesan={pesanIqomah}
        />
      )}
    </div>
  );
}



