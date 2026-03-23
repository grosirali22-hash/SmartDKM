import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGlobalContext } from '../context/GlobalContext';

interface AdzanOverlayProps {
  visible: boolean;
  namaShalat: string;
  iqomahTime?: number; // fallback
  onClose: () => void;
  // Props untuk custom preview
  customBgType?: 'color' | 'image' | 'video';
  customBgValue?: string;
  customPesan?: string;
}

export default function AdzanOverlay({
  visible,
  namaShalat,
  iqomahTime = 10,
  onClose,
  customBgType,
  customBgValue,
  customPesan,
}: AdzanOverlayProps) {
  const { config } = useGlobalContext();
  const isDark = config.is_dark_mode;

  // DB Settings State
  const [bgType, setBgType] = useState<'color' | 'image' | 'video'>('color');
  const [bgValue, setBgValue] = useState('bg-blue-950');
  const [pesan, setPesan] = useState('Antara adzan dan iqomah adalah waktu mustajab untuk berdoa. Mohon luruskan shaf dan matikan alat komunikasi.');
  const [dbIqomahTime, setDbIqomahTime] = useState(iqomahTime);

  // Timer State
  const [seconds, setSeconds] = useState(dbIqomahTime * 60);

  // Fetch settins dari Supabase saat overlay pertama kali muncul
  useEffect(() => {
    if (visible) {
      const fetchSettings = async () => {
        const { data } = await supabase.from('adzan_settings').select('*').single();
        if (data) {
          setBgType(data.bg_type || 'color');
          setBgValue(data.bg_value || 'bg-blue-950');
          setPesan(data.pesan_iqomah || pesan);
          setDbIqomahTime(data.iqomah_time || iqomahTime);
          setSeconds((data.iqomah_time || iqomahTime) * 60);
        } else {
          setSeconds(iqomahTime * 60);
        }
      };
      // Jika mode preview dari props, tidak perlu fetch DB
      if (customBgType) {
        setBgType(customBgType);
        setBgValue(customBgValue || 'bg-blue-950');
        setPesan(customPesan || pesan);
        setSeconds(iqomahTime * 60);
      } else {
        fetchSettings();
      }
    }
  }, [visible, iqomahTime, customBgType, customBgValue, customPesan]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;
    const timer = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [visible, seconds]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!visible) return null;

  const finalBgColor = bgType === 'color' 
    ? (bgValue === 'bg-blue-950' && !isDark ? 'bg-blue-600' : bgValue) 
    : 'bg-black';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-700 
      ${bgType === 'color' ? finalBgColor : 'bg-black'}`}>
      {/* Custom Background Media */}
      {bgType === 'video' && (
        <video src={bgValue} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
      )}
      {bgType === 'image' && (
        <img src={bgValue} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      )}

      {/* Animasi Pulsa hanya jika background color */}
      {bgType === 'color' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-white/10 animate-pulse-ring" />
        </div>
      )}

      {/* Konten overlay selalu di atas (z-10) */}
      <div className="relative z-10 flex flex-col items-center px-10 text-center drop-shadow-2xl">
        <p className="text-white/80 text-xs font-black uppercase tracking-[10px] mb-4">
          Waktu Shalat
        </p>
        <h1 className="text-white text-8xl font-black mb-12 tracking-tighter drop-shadow-md">{namaShalat}</h1>

        <div className={`${isDark ? 'bg-black/30 border-white/20' : 'bg-white/20 border-white/40'} border px-12 py-8 rounded-[50px] backdrop-blur-xl`}>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">
            Menuju Iqomah
          </p>
          <p className="text-white text-9xl font-black tabular-nums tracking-tighter drop-shadow-md">
            {formatTime(seconds)}
          </p>
        </div>

        <p className={`mt-20 text-white leading-6 max-w-lg font-medium text-lg drop-shadow-md ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/10 border-white/20'} px-5 py-3 rounded-lg backdrop-blur-md border`}>
          "{pesan}"
        </p>

        <button
          onClick={onClose}
          className="mt-8 text-white/50 hover:text-white text-xs uppercase tracking-widest transition-all bg-black/20 px-4 py-2 rounded-full"
        >
          Tutup Layar
        </button>
      </div>
    </div>
  );
}


