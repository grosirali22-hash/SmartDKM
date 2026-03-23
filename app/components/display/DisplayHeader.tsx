'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

// Nama hari Islam
const ISLAMIC_DAYS: Record<number, string> = {
  0: 'Al-Ahad',      // Minggu
  1: 'Al-Itsnain',   // Senin
  2: "Ats-Tsulasa'", // Selasa
  3: "Al-Arbi'a",    // Rabu
  4: 'Al-Khamis',    // Kamis
  5: "Al-Jumu'ah",   // Jumat
  6: 'As-Sabt',      // Sabtu
};

// Mapping WMO weather code → icon component & label
function getWeatherInfo(code: number): { Icon: React.ElementType; label: string } {
  if (code === 0 || code === 1) return { Icon: Sun, label: 'Cerah' };
  if (code <= 3)                return { Icon: Cloud, label: 'Berawan' };
  if (code <= 67)               return { Icon: CloudRain, label: 'Hujan' };
  if (code <= 77)               return { Icon: CloudSnow, label: 'Salju' };
  if (code <= 82)               return { Icon: CloudRain, label: 'Hujan Lebat' };
  return { Icon: CloudLightning, label: 'Badai Petir' };
}

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  code: number;
}

export default function DisplayHeader() {
  const { config } = useGlobalContext();
  const [time, setTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState('');
  const [islamicDay, setIslamicDay] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mounted, setMounted] = useState(false);

  // Tick clock
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hijriah + nama hari Islam
  useEffect(() => {
    try {
      const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const parts = fmt.formatToParts(time);
      const day   = parts.find(p => p.type === 'day')?.value   || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year  = parts.find(p => p.type === 'year')?.value  || '';

      const hijriMonths: Record<string, string> = {
        'محرم': 'Muharram', 'صفر': 'Safar',
        'ربيع الأول': "Rabi'ul Awal", 'ربيع الآخر': "Rabi'ul Akhir",
        'جمادى الأولى': 'Jumadil Awal', 'جمادى الآخرة': 'Jumadil Akhir',
        'رجب': 'Rajab', 'شعبان': "Sya'ban", 'رمضان': 'Ramadan',
        'شوال': 'Syawal', 'ذو القعدة': "Dzulqa'dah", 'ذو الحجة': 'Dzulhijjah',
      };

      const monthId = hijriMonths[month] || month;
      setHijriDate(`${day} ${monthId} ${year} H`);
      setIslamicDay(ISLAMIC_DAYS[time.getDay()] || '');
    } catch {
      setHijriDate(new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        day: 'numeric', month: 'long', year: 'numeric',
      }).format(time));
    }
  }, [time]);

  // Fetch weather via Open-Meteo (free, no API key)
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
        );
        const json = await res.json();
        const c = json.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          humidity: c.relative_humidity_2m,
          wind: Math.round(c.wind_speed_10m),
          code: c.weather_code,
        });
      } catch {
        // Diam-diam gagal, tidak tampilkan cuaca
      }
    };

    const tryGeo = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
          ()  => fetchWeather(-6.9175, 106.9274) // Fallback: Sukabumi
        );
      } else {
        fetchWeather(-6.9175, 106.9274);
      }
    };

    tryGeo();
    // Refresh cuaca tiap 15 menit
    const iv = setInterval(tryGeo, 15 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const { Icon: WeatherIcon, label: weatherLabel } = weather
    ? getWeatherInfo(weather.code)
    : { Icon: Cloud, label: '—' };

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden relative rounded-lg transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-white/10' 
          : 'bg-white border-slate-200'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/0 via-primary to-primary/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-4 -top-4 opacity-[0.05] ${config.is_dark_mode ? 'text-primary' : 'text-slate-900'}`}>
        <Clock className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-3">

        {/* Masjid identity — CENTER */}
        <div className="text-center mb-2">
          <h1 className={`text-2xl font-black tracking-tighter leading-tight transition-all duration-500
            ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}
          >
            {config.nama_masjid || 'Masjid Al-Istiqomah'}
          </h1>
          <p className={`text-xs font-black uppercase tracking-[2px] mt-1 transition-all duration-500
            ${config.is_dark_mode ? 'text-primary' : 'text-blue-600'}`}
          >
            📍 {config.alamat || 'Sukabumi, Jawa Barat'}
          </p>
        </div>

        {/* Separator */}
        <div className={`w-full h-px mb-2 ${config.is_dark_mode ? 'bg-white/10' : 'bg-slate-200'}`} />

        {/* Main layout: weather icon kiri | jam + tanggal tengah-kanan */}
        <div className="flex-1 flex gap-3 min-h-0">

          {/* Cuaca — kiri, tanpa border/card */}
          <div className="w-20 shrink-0 flex flex-col items-center justify-center gap-2">
            {weather ? (
              <>
                <WeatherIcon className={`w-10 h-10 ${config.is_dark_mode ? 'text-sky-400' : 'text-blue-500'}`} />
                <p className={`text-2xl font-black tabular-nums leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
                  {weather.temp}°
                </p>
                <p className={`text-[9px] font-black uppercase tracking-[1px] text-center leading-tight ${config.is_dark_mode ? 'text-sky-400' : 'text-blue-500'}`}>
                  {weatherLabel}
                </p>
                <div className={`flex flex-col items-center gap-0.5 text-[8px] font-black ${config.is_dark_mode ? 'text-white/40' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{weather.humidity}%</span>
                  <span className="flex items-center gap-0.5"><Wind className="w-2.5 h-2.5" />{weather.wind}km/h</span>
                </div>
              </>
            ) : (
              <Cloud className={`w-8 h-8 animate-pulse ${config.is_dark_mode ? 'text-white/20' : 'text-slate-200'}`} />
            )}
          </div>

          {/* Jam + Tanggal — kanan, rata tengah */}
          <div className="flex-1 flex flex-col justify-center items-center min-w-0 text-center">
            {/* Clock */}
            <p className={`text-5xl font-black tracking-tighter tabular-nums leading-none transition-all duration-500
              ${config.is_dark_mode 
                  ? 'text-white drop-shadow-[0_0_16px_rgba(16,185,129,0.35)]' 
                  : 'text-slate-900'
              }`}
            >
              {mounted ? formatTime(time) : '--:--:--'}
            </p>

            {/* Date rows */}
            <div className="mt-2 space-y-1">
              <p className={`text-xs font-black uppercase tracking-[1px] leading-none transition-all duration-500
                ${config.is_dark_mode ? 'text-white/60' : 'text-slate-500'}`}
              >
                {mounted ? formatDate(time) : '...'}
              </p>
              <p className={`text-xs font-black uppercase tracking-[2px] leading-none transition-all duration-500
                ${config.is_dark_mode ? 'text-primary' : 'text-blue-600'}`}
              >
                {mounted && islamicDay && <span className="mr-1.5 opacity-70">{islamicDay} •</span>}
                {mounted ? hijriDate : '...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
