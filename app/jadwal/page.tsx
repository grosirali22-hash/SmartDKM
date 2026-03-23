'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useJadwalShalat } from '../hooks/useJadwalShalat';
import { useGlobalContext } from '../context/GlobalContext';
import { Clock, Pencil, Trash2, Eye, EyeOff, CalendarDays, Save, Loader2 } from 'lucide-react';
import Badge from '../components/ui/Badge';


interface JadwalRow {
  id: string;
  tanggal: string;
  imsyak: string;
  subuh: string;
  syuruq: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  koreksi_menit: number;
  tampilkan: boolean;
}

const WAKTU_KEYS = [
  { key: 'imsyak', label: 'Imsyak', color: 'text-indigo-600' },
  { key: 'subuh', label: 'Subuh', color: 'text-blue-600' },
  { key: 'syuruq', label: 'Syuruq', color: 'text-amber-500' },
  { key: 'dhuha', label: 'Dhuha', color: 'text-orange-500' },
  { key: 'dzuhur', label: 'Dzuhur', color: 'text-blue-600' },
  { key: 'ashar', label: 'Ashar', color: 'text-teal-600' },
  { key: 'maghrib', label: 'Maghrib', color: 'text-rose-500' },
  { key: 'isya', label: 'Isya', color: 'text-purple-600' },
] as const;

export default function JadwalPage() {
  const { jadwal: apiJadwal, lokasiNama, isLoading: apiLoading } = useJadwalShalat();
  const [manualJadwal, setManualJadwal] = useState<JadwalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [koreksiOffsets, setKoreksiOffsets] = useState<Record<string, number>>({
    imsyak: 0, subuh: 0, syuruq: 0, dhuha: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0
  });
  const [isSavingKoreksi, setIsSavingKoreksi] = useState(false);
  const { config } = useGlobalContext();

  const today = new Date();
  const hariIni = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fetchJadwal = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('jadwal_shalat')
      .select('*')
      .order('tanggal', { ascending: false });
    if (data) setManualJadwal(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  // Initial sync from manual data if exists (but typically we adjust from API)
  useEffect(() => {
    const todayStr2 = new Date().toISOString().split('T')[0];
    const found = manualJadwal.find((j) => j.tanggal === todayStr2);
    if (!found) {
      setKoreksiOffsets({
        imsyak: 0, subuh: 0, syuruq: 0, dhuha: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0
      });
    }
  }, [manualJadwal]);

  // Find today's manual jadwal (if exists, override API)
  const todayStr = today.toISOString().split('T')[0];
  const todayManual = manualJadwal.find((j) => j.tanggal === todayStr);

  const handleSave = async (data: any) => {
    let error;
    if (data.id) {
      const res = await supabase.from('jadwal_shalat').update(data).eq('id', data.id);
      error = res.error;
    } else {
      const res = await supabase.from('jadwal_shalat').insert(data);
      error = res.error;
    }
    if (error) {
      alert('Gagal menyimpan jadwal: ' + error.message);
    } else {
      fetchJadwal();
    }
  };


  // Save koreksi menit from inline input on API card
  const handleSaveKoreksi = async () => {
    if (!apiJadwal) return;
    setIsSavingKoreksi(true);
    const todayStr2 = new Date().toISOString().split('T')[0];
    const existing = manualJadwal.find((j) => j.tanggal === todayStr2);
    
    // Bake the offsets into the time strings
    const payload = {
      tanggal: todayStr2,
      imsyak: applyKoreksi(apiJadwal.imsyak, koreksiOffsets.imsyak),
      subuh: applyKoreksi(apiJadwal.subuh, koreksiOffsets.subuh),
      syuruq: applyKoreksi(apiJadwal.syuruq, koreksiOffsets.syuruq),
      dhuha: applyKoreksi(apiJadwal.dhuha, koreksiOffsets.dhuha),
      dzuhur: applyKoreksi(apiJadwal.dzuhur, koreksiOffsets.dzuhur),
      ashar: applyKoreksi(apiJadwal.ashar, koreksiOffsets.ashar),
      maghrib: applyKoreksi(apiJadwal.maghrib, koreksiOffsets.maghrib),
      isya: applyKoreksi(apiJadwal.isya, koreksiOffsets.isya),
      koreksi_menit: 0, // Reset since values are baked in
      tampilkan: true,
    };
    if (existing) {
      await supabase.from('jadwal_shalat').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('jadwal_shalat').insert(payload);
    }
    await fetchJadwal();
    setIsSavingKoreksi(false);
  };


  // Apply koreksi menit to time string
  const applyKoreksi = (time: string | undefined, koreksi: number): string => {
    if (!time) return '--:--';
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + koreksi;
    const newH = Math.floor(((total % 1440) + 1440) % 1440 / 60);
    const newM = ((total % 60) + 60) % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  // Active jadwal: hari ini manual > API
  const activeJadwal = todayManual || (apiJadwal ? {
    imsyak: apiJadwal.imsyak || '--:--',
    subuh: apiJadwal.subuh || '--:--',
    syuruq: apiJadwal.syuruq || '--:--',
    dhuha: apiJadwal.dhuha || '--:--',
    dzuhur: apiJadwal.dzuhur || '--:--',
    ashar: apiJadwal.ashar || '--:--',
    maghrib: apiJadwal.maghrib || '--:--',
    isya: apiJadwal.isya || '--:--',
    koreksi_menit: 0,
    tampilkan: true,
  } : null);

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Jadwal Shalat" subtitle={apiLoading ? 'Mencari lokasi...' : lokasiNama} />

      {/* Tanggal hari ini */}
      <div className="flex items-center gap-4 rounded-lg p-5 transition-all duration-500 bg-blue-50 border border-blue-100">
        <CalendarDays className="w-6 h-6 transition-all duration-500 text-blue-600" />
        <p className="font-black text-sm transition-all duration-500 text-blue-800">{hariIni}</p>
      </div>

      {/* Jadwal Hari Ini */}
      {apiLoading && !todayManual ? (
        <Card className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Mengambil jadwal shalat...</p>
        </Card>
      ) : activeJadwal ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Jadwal Hari Ini {todayManual ? '(Koleksi Tersimpan)' : '(API)'}
            </h3>
            <button
              onClick={handleSaveKoreksi}
              disabled={isSavingKoreksi || !!todayManual}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {isSavingKoreksi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {todayManual ? 'Tersimpan' : 'Simpan Koreksi'}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WAKTU_KEYS.map(({ key, label, color }) => {
              const waktu = (activeJadwal as any)[key];
              const offset = todayManual ? 0 : (koreksiOffsets[key] || 0);
              const displayWaktu = applyKoreksi(waktu, offset);

              return (
                <div
                  key={key}
                  className="relative rounded-lg p-5 text-center transition-all duration-500 overflow-hidden bg-muted border border-border hover:bg-blue-50"
                >
                  <p className="text-[10px] font-black uppercase tracking-[2px] mb-2 transition-all duration-500 text-muted-foreground">
                    {label}
                  </p>
                  <p className={`text-2xl font-black ${color}`}>
                    {displayWaktu}
                  </p>
                  
                  {/* Plus/Minus Controls - only if no manual entry today */}
                  {!todayManual && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                       <button
                         onClick={() => setKoreksiOffsets(prev => ({ ...prev, [key]: prev[key] - 1 }))}
                         className="w-8 h-8 flex items-center justify-center text-xl font-black transition-all text-muted-foreground hover:text-amber-600 hover:scale-125"
                       >−</button>
                       <span className={`text-[11px] font-black min-w-[24px] ${offset !== 0 ? 'text-amber-600' : 'text-muted-foreground opacity-40'}`}>
                         {offset > 0 ? `+${offset}` : offset}
                       </span>
                       <button
                         onClick={() => setKoreksiOffsets(prev => ({ ...prev, [key]: prev[key] + 1 }))}
                         className="w-8 h-8 flex items-center justify-center text-xl font-black transition-all text-muted-foreground hover:text-blue-600 hover:scale-125"
                       >+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <p className="text-muted-foreground italic">Belum ada jadwal tersedia</p>
        </Card>
      )}


      {/* Sumber Data */}
      <div className="rounded-lg p-6 transition-all duration-500 bg-blue-50 border border-blue-100">
        <p className="text-xs font-black uppercase tracking-[3px] mb-2 transition-all duration-500 text-blue-700">Sumber Data</p>
        <p className="font-black text-xs leading-relaxed transition-all duration-500 text-blue-900">
          API EQuran.id (Data Kemenag RI) — Koreksi menit disimpan untuk hari ini
        </p>
      </div>
    </div>
  );
}


