'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import PHBIForm from '../components/PHBIForm';
import { supabase } from '../lib/supabase';
import { useGlobalContext } from '../context/GlobalContext';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import NexusDataTable from '../components/ui/NexusDataTable';

interface PHBI {
  id: string;
  nama: string;
  tanggal: string;
}

// ─── Hijriah Conversion (Khaled Moslem algorithm) ──────────────────────────
function gregorianToHijri(gYear: number, gMonth: number, gDay: number) {
  const jd =
    Math.floor((1461 * (gYear + 4800 + Math.floor((gMonth - 14) / 12))) / 4) +
    Math.floor((367 * (gMonth - 2 - 12 * Math.floor((gMonth - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((gYear + 4900 + Math.floor((gMonth - 14) / 12)) / 100)) / 4) +
    gDay - 32075;

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hMonth = Math.floor((24 * l3) / 709);
  const hDay = l3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;
  return { hYear, hMonth, hDay };
}

function hijriMonthDays(hMonth: number, hYear: number): number {
  // Simplified: odd months = 30, even = 29, except leap year last month
  if (hMonth % 2 === 1) return 30;
  if (hMonth === 12 && ((11 * hYear + 14) % 30 < 11)) return 30;
  return 29;
}

function hijriMonthStart(hMonth: number, hYear: number): Date {
  // Binary search to find the Gregorian date that corresponds to 1st of hMonth/hYear
  let low = new Date(1900, 0, 1);
  let high = new Date(2100, 0, 1);
  for (let i = 0; i < 50; i++) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const { hYear: y, hMonth: m, hDay: d } = gregorianToHijri(
      mid.getFullYear(), mid.getMonth() + 1, mid.getDate()
    );
    if (y < hYear || (y === hYear && m < hMonth)) low = mid;
    else if (y > hYear || (y === hYear && m > hMonth)) high = mid;
    else {
      // Found month, roll back to day 1
      const diff = d - 1;
      return new Date(mid.getFullYear(), mid.getMonth(), mid.getDate() - diff);
    }
  }
  return low;
}

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir',
  'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
  'Ramadhan', 'Syawwal', 'Dzulqa\'dah', 'Dzulhijjah'
];

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function PHBIPage() {
  const [items, setItems] = useState<PHBI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<PHBI | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | null>(null);
  const { config } = useGlobalContext();

  // Current Hijriah month/year
  const todayHijri = gregorianToHijri(
    new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()
  );
  const [viewHMonth, setViewHMonth] = useState(todayHijri.hMonth);
  const [viewHYear, setViewHYear] = useState(todayHijri.hYear);
  const [holidays, setHolidays] = useState<any[]>([]);

  const fetchHolidays = useCallback(async (year: number) => {
    try {
      const res = await fetch(`https://libur.deno.dev/api?year=${year}`);
      const data = await res.json();
      if (Array.isArray(data)) setHolidays(data);
    } catch (err) {
      console.error("Gagal mengambil data hari libur:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('phbi_events')
      .select('*')
      .order('tanggal', { ascending: true });
    if (data) setItems(data);
    
    // Fetch Gregorian year based on viewHYear
    const currentGYear = new Date().getFullYear(); 
    fetchHolidays(currentGYear); 
    if (viewHMonth === 12 || viewHMonth === 1) {
       // Also fetch adjacent years if spanning
       fetchHolidays(currentGYear - 1);
       fetchHolidays(currentGYear + 1);
    }

    setLoading(false);
  }, [viewHMonth, fetchHolidays]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (data: any) => {
    let error;
    if (data.id) {
      const res = await supabase.from('phbi_events').update(data).eq('id', data.id);
      error = res.error;
    } else {
      const res = await supabase.from('phbi_events').insert(data);
      error = res.error;
    }
    if (error) {
      alert('Gagal menyimpan PHBI: ' + error.message);
    } else {
      setEditData(null);
      setPrefillDate(null);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus peringatan PHBI ini?')) return;
    const { error } = await supabase.from('phbi_events').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus PHBI: ' + error.message);
    } else {
      fetchData();
    }
  };

  // Build calendar days for current Hijri month
  const monthStart = hijriMonthStart(viewHMonth, viewHYear);
  const daysInMonth = hijriMonthDays(viewHMonth, viewHYear);
  const startDayOfWeek = monthStart.getDay(); // 0=Sun

  // Map PHBI events to hijri dates for quick lookup
  const phbiByGregorian = new Map<string, PHBI[]>();
  items.forEach(item => {
    const key = item.tanggal.split('T')[0];
    if (!phbiByGregorian.has(key)) phbiByGregorian.set(key, []);
    phbiByGregorian.get(key)!.push(item);
  });

  const holsByGregorian = new Map<string, any[]>();
  holidays.forEach(h => {
    if (!h.date) return;
    if (!holsByGregorian.has(h.date)) holsByGregorian.set(h.date, []);
    holsByGregorian.get(h.date)!.push(h);
  });

  // Build calendar grid
  const calendarCells: (null | { gDate: Date; hDay: number })[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarCells.push(null);
  for (let d = 0; d < daysInMonth; d++) {
    const gDate = new Date(monthStart);
    gDate.setDate(monthStart.getDate() + d);
    calendarCells.push({ gDate, hDay: d + 1 });
  }

  const prevMonth = () => {
    if (viewHMonth === 1) { setViewHMonth(12); setViewHYear(y => y - 1); fetchData(); }
    else { setViewHMonth(m => m - 1); fetchData(); }
  };
  const nextMonth = () => {
    if (viewHMonth === 12) { setViewHMonth(1); setViewHYear(y => y + 1); fetchData(); }
    else { setViewHMonth(m => m + 1); fetchData(); }
  };

  const isToday = (gDate: Date) => {
    const t = new Date();
    return gDate.getFullYear() === t.getFullYear() &&
      gDate.getMonth() === t.getMonth() &&
      gDate.getDate() === t.getDate();
  };

  const clickDay = (gDate: Date) => {
    const iso = `${gDate.getFullYear()}-${String(gDate.getMonth() + 1).padStart(2, '0')}-${String(gDate.getDate()).padStart(2, '0')}`;
    setPrefillDate(iso);
    setEditData(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Hari Besar Islam (PHBI)" subtitle="Kalender Hijriah" />

      {/* Month Header */}
      <div className="rounded-lg p-5 relative overflow-hidden bg-blue-600 shadow-lg shadow-blue-100 text-white">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 rounded-lg bg-card/10 hover:bg-card/20 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[3px] text-blue-100">
              Kalender Hijriah
            </p>
            <h2 className="text-2xl font-black text-white">
              {HIJRI_MONTHS[viewHMonth - 1]} {viewHYear} H
            </h2>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-lg bg-card/10 hover:bg-card/20 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tambah Button */}
      <button
        onClick={() => { setEditData(null); setPrefillDate(null); setShowForm(true); }}
        className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-black transition-all border-2 border-solid border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100"
      >
        <Plus className="w-4 h-4" /> Tambah PHBI Baru
      </button>

      {/* Calendar Grid */}
      <div className="rounded-lg overflow-hidden bg-card border border-border shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map(d => (
            <div key={d} className={`py-3 text-center text-[10px] font-black uppercase tracking-widest ${
              d === 'Jum' ? 'text-blue-600' : 'text-muted-foreground'
            }`}>{d}</div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7">
          {calendarCells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} className="aspect-square sm:aspect-auto sm:min-h-[80px] border-b border-r border-border" />;
            const gKey = `${cell.gDate.getFullYear()}-${String(cell.gDate.getMonth() + 1).padStart(2, '0')}-${String(cell.gDate.getDate()).padStart(2, '0')}`;
            const events = phbiByGregorian.get(gKey) || [];
            const hols = holsByGregorian.get(gKey) || [];
            const today = isToday(cell.gDate);
            const isFriday = cell.gDate.getDay() === 5;
            const isSunday = cell.gDate.getDay() === 0;
            const isRedDay = isSunday || hols.length > 0;

            return (
              <div
                key={gKey}
                onClick={() => clickDay(cell.gDate)}
                className={`border-b border-r border-border p-1.5 sm:p-2 min-h-[70px] sm:min-h-[90px] cursor-pointer transition-all group ${
                  today
                    ? 'bg-blue-50 ring-1 ring-inset ring-blue-400'
                    : hols.length > 0
                       ? 'bg-rose-50/30'
                       : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                   <span className={`text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center leading-none ${
                    today
                      ? 'bg-blue-600 text-white'
                      : isRedDay
                        ? 'text-rose-500'
                        : isFriday
                          ? 'text-blue-600'
                          : 'text-foreground'
                  }`}>
                    {cell.hDay}
                  </span>
                  <span className={`text-[9px] font-bold ${isRedDay ? 'text-rose-400' : 'text-slate-300'}`}>
                    {cell.gDate.getDate()}
                  </span>
                </div>

                {/* Holidays (Tanggal Merah) */}
                {hols.map((h, idx) => (
                   <div key={`hol-${idx}`} className="flex items-center gap-1 mb-0.5 group/hol">
                     <div className="text-[8px] font-black px-1 py-0 bg-rose-500 text-white rounded-[2px] uppercase shrink-0">LIBUR</div>
                     <div className="text-[9px] font-bold text-rose-600 truncate flex-1 uppercase tracking-tighter" title={h.name}>{h.name}</div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleSave({ nama: h.name, tanggal: h.date }); }}
                       className="hidden group-hover/hol:block text-[8px] bg-rose-500 text-white px-1 rounded hover:bg-rose-600 transition-colors"
                       title="Impor ke PHBI"
                     >
                       Impor
                     </button>
                   </div>
                ))}

                {/* Events */}
                {events.map(ev => (
                  <div key={ev.id} className="group/ev relative">
                    <div className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md mb-0.5 truncate bg-blue-100 text-blue-800">
                      {ev.nama}
                    </div>
                    <div className="absolute top-0 right-0 hidden group-hover/ev:flex gap-0.5 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditData(ev); setShowForm(true); }}
                        className="p-0.5 bg-blue-500 text-white rounded"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                        className="p-0.5 bg-red-500 text-white rounded"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add indicator on hover */}
                {events.length === 0 && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-slate-300 font-bold">
                    + Tambah
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming PHBI List */}
      <NexusDataTable
        title="Daftar Hari Besar (PHBI)"
        data={items}
        isLoading={loading}
        itemsPerPage={10}
        onEdit={(item) => { setEditData(item); setShowForm(true); }}
        onDelete={(item) => handleDelete(item.id)}
        columns={[
          { header: 'NO', accessor: (item) => items.indexOf(item) + 1, width: '50px' },
          { header: 'Nama Acara', accessor: 'nama', sortable: true },
          { 
            header: 'Tanggal (Hijriah)', 
            width: '200px',
            accessor: (item) => {
              const d = new Date(item.tanggal + 'T00:00');
              const { hYear, hMonth, hDay } = gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
              return (
                <p className="text-xs font-black">
                  {hDay} {HIJRI_MONTHS[hMonth - 1]} {hYear} H
                </p>
              );
            }
          },
          { 
            header: 'Masehi', 
            width: '150px',
            accessor: (item) => (
              <p className="text-xs font-bold text-muted-foreground">
                {new Date(item.tanggal + 'T00:00').toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            ),
            sortable: true
          }
        ]}
      />

      <div className="rounded-lg p-5 bg-muted border border-border">
        <p className="text-xs font-black uppercase tracking-[3px] mb-1 text-muted-foreground">Catatan</p>
        <p className="text-xs font-bold leading-relaxed text-muted-foreground">
          Klik pada tanggal di kalender untuk menambahkan PHBI. Konversi Hijriah dihitung secara otomatis. Tanggal disesuaikan dengan keputusan pemerintah & ru'yatul hilal.
        </p>
      </div>

      <PHBIForm
        visible={showForm}
        onClose={() => { setShowForm(false); setEditData(null); setPrefillDate(null); }}
        onSave={handleSave}
        initialData={editData ? editData : prefillDate ? { tanggal: prefillDate } as any : null}
      />
    </div>
  );
}




