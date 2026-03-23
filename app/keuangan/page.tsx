'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import SectionTitle from '../components/ui/SectionTitle';
import InputKeuangan from '../components/InputKeuangan';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { Download, Upload, Trash2, Loader2, Plus, Wallet, Heart, Hammer, Coins, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import NexusDataTable from '../components/ui/NexusDataTable';


interface Dompet {
  id: string;
  nama: string;
  ikon?: string;
}

interface Transaksi {
  id: string;
  tipe: 'debit' | 'kredit';
  nominal: number;
  keterangan: string;
  waktu: string;
  dompet_id: string;
}

export default function KeuanganPage() {
  const { config } = useGlobalContext();
  const [dompets, setDompets] = useState<Dompet[]>([]);
  const [selectedDompetId, setSelectedDompetId] = useState<string | null>(null);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [activeTipe, setActiveTipe] = useState<'debit' | 'kredit'>('debit');
  const [loading, setLoading] = useState(true);
  const [showAddDompet, setShowAddDompet] = useState(false);
  const [newDompetName, setNewDompetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDompets();
  }, []);

  useEffect(() => {
    if (selectedDompetId) {
      fetchTransaksi();
    }
  }, [selectedDompetId]);

  const fetchDompets = async () => {
    const { data, error } = await supabase.from('dompet').select('*').order('created_at');
    if (!error && data) {
      setDompets(data);
      if (data.length > 0 && !selectedDompetId) {
        setSelectedDompetId(data[0].id);
      }
    }
  };

  const fetchTransaksi = async () => {
    if (!selectedDompetId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('keuangan')
      .select('*')
      .eq('dompet_id', selectedDompetId)
      .order('waktu', { ascending: false });

    if (!error && data) {
      setTransaksi(data);
    }
    setLoading(false);
  };

  const handleSimpan = async (data: { nominal: string; keterangan: string }) => {
    if (!selectedDompetId) return;
    const baru = {
      tipe: activeTipe,
      nominal: parseInt(data.nominal),
      keterangan: data.keterangan,
      waktu: new Date().toISOString(),
      dompet_id: selectedDompetId
    };

    const { error } = await supabase.from('keuangan').insert([baru]);
    if (error) {
      alert('Gagal menyimpan transaksi: ' + error.message);
    } else {
      fetchTransaksi();
    }
  };

  const handleCreateDompet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDompetName.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('dompet')
      .insert([{ nama: newDompetName, ikon: 'Wallet' }])
      .select();

    if (error) {
      alert('Gagal membuat dompet: ' + error.message);
      setLoading(false);
      return;
    }

    if (data && data[0]) {
      setDompets([...dompets, data[0]]);
      setSelectedDompetId(data[0].id);
      setNewDompetName('');
      setShowAddDompet(false);
    } else {
      // Jika data kosong tapi tidak error, coba refresh list
      fetchDompets();
      setShowAddDompet(false);
    }
    setLoading(false);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([['Tipe (debit/kredit)', 'Nominal', 'Keterangan', 'Waktu']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_kas_masjid.xlsx');
  };

  const handleExport = () => {
    if (transaksi.length === 0) return;
    const walletName = dompets.find(d => d.id === selectedDompetId)?.nama || 'kas';
    const rows = transaksi.map(t => ({
      Tipe: t.tipe,
      Nominal: t.nominal,
      Keterangan: t.keterangan,
      Waktu: t.waktu,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kas');
    XLSX.writeFile(wb, `kas_${walletName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDompetId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);

      const newRecords = rows.map(r => ({
        tipe: (r['Tipe (debit/kredit)'] || r['Tipe'] || 'debit').toString().toLowerCase() as 'debit' | 'kredit',
        nominal: parseInt(r['Nominal']) || 0,
        keterangan: r['Keterangan']?.toString() || '',
        waktu: r['Waktu']?.toString() || new Date().toISOString(),
        dompet_id: selectedDompetId
      })).filter(r => r.nominal > 0);

      if (newRecords.length === 0) return alert('Tidak ada data yang valid di file.');
      const { error } = await supabase.from('keuangan').insert(newRecords);
      if (error) {
        alert('Gagal mengimpor data: ' + error.message);
      } else {
        fetchTransaksi();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClearAll = async () => {
    if (!selectedDompetId) return;
    if (!confirm('Hapus semua riwayat transaksi untuk dompet ini?')) return;
    const { error } = await supabase.from('keuangan').delete().eq('dompet_id', selectedDompetId);
    if (error) {
      alert('Gagal menghapus data: ' + error.message);
    } else {
      fetchTransaksi();
    }
  };

  const handleDeleteDompet = async (e: React.MouseEvent, dompetId: string, dompetName: string) => {
    e.stopPropagation(); // prevent selecting the wallet
    if (!confirm(`Apakah Anda yakin ingin menghapus dompet "${dompetName}"? Semua riwayat transaksi di dalamnya juga akan terhapus!`)) return;

    // Supabase will cascade delete transactions if foreign key is set up with ON DELETE CASCADE
    // But just to be safe, delete from dompet table first:
    const { error } = await supabase.from('dompet').delete().eq('id', dompetId);
    if (error) {
      alert('Gagal menghapus dompet: ' + error.message);
    } else {
      if (selectedDompetId === dompetId) {
        setSelectedDompetId(null);
      }
      fetchDompets();
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    const { error } = await supabase.from('keuangan').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus transaksi: ' + error.message);
    } else {
      fetchTransaksi();
    }
  };

  const getIkon = (name?: string) => {
    switch (name) {
      case 'Heart': return <Heart size={18} />;
      case 'Hammer': return <Hammer size={18} />;
      default: return <Wallet size={18} />;
    }
  };

  const totalSaldo = transaksi.reduce((acc, curr) =>
    curr.tipe === 'debit' ? acc + curr.nominal : acc - curr.nominal, 0
  );

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionTitle title="Kas Masjid" subtitle="Pilih & Kelola Dompet Keuangan" />
        <div className="flex items-center gap-3">
          <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition-all duration-500 bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100"
          >
            <FileSpreadsheet size={14} /> Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition-all duration-500 bg-card border border-border text-muted-foreground hover:bg-muted"
          >
            <Upload size={14} /> Import XLS
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition-all duration-500 bg-card border border-border text-muted-foreground hover:bg-muted"
          >
            <Download size={14} /> Export XLS
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-500 bg-rose-50 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Wallet Switcher */}
      <div className="flex gap-3 overflow-x-auto pt-4 pb-2 scrollbar-hide">
        {dompets.map(dompet => {
          const isActive = selectedDompetId === dompet.id;
          return (
            <div key={dompet.id} className="relative group shrink-0">
              <button
                onClick={() => setSelectedDompetId(dompet.id)}
                className={`flex items-center gap-3 px-5 py-3 min-w-[160px] rounded-lg transition-all border-2 w-full
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-1' : 'bg-card border-border text-muted-foreground hover:border-border'}
                `}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-card/20' : 'bg-muted'}`}>
                  {getIkon(dompet.ikon)}
                </div>
                <div className="text-left">
                  <p className={`text-[10px] font-black uppercase tracking-widest opacity-70`}>Dompet</p>
                  <p className="font-black text-sm">{dompet.nama}</p>
                </div>
              </button>
              <button
                onClick={(e) => handleDeleteDompet(e, dompet.id, dompet.nama)}
                title="Hapus Dompet"
                className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
        <button
          onClick={() => setShowAddDompet(true)}
          className="flex items-center gap-3 px-5 py-3 min-w-[160px] rounded-lg shrink-0 border-2 border-solid transition-all bg-muted border-border text-muted-foreground hover:border-blue-300 hover:text-blue-500"
        >
          <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
            <Plus size={20} />
          </div>
          <p className="font-black text-sm">Tambah</p>
        </button>
      </div>

        <Card className="!p-4 animate-in fade-in slide-in-from-top-4 border-2 border-blue-100">
          <form onSubmit={handleCreateDompet} className="flex gap-3">
            <input
              autoFocus
              value={newDompetName}
              onChange={e => setNewDompetName(e.target.value)}
              placeholder="Nama dompet baru..."
              className="flex-1 px-5 py-3 rounded-lg outline-none font-black text-sm transition-all duration-500 bg-muted border-none focus:ring-2 focus:ring-blue-500 text-foreground"
            />
            <button type="submit" className="px-6 py-3 rounded-lg font-black text-sm transition-all duration-500 bg-blue-600 text-white hover:bg-blue-700">Buat</button>
            <button onClick={() => setShowAddDompet(false)} className="px-4 py-3 font-black text-sm transition-all duration-500 text-muted-foreground hover:text-muted-foreground">Batal</button>
          </form>
        </Card>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-none relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Coins size={80} className="text-white" />
          </div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[3px] mb-2">Total Saldo</p>
          <p className="text-3xl font-black text-white">Rp {totalSaldo.toLocaleString('id-ID')}</p>
        </Card>

        {/* Toggle Tipe (Moved inside for better flow) */}
        <div className="md:col-span-2 flex gap-2 h-full">
          <button
            onClick={() => setActiveTipe('debit')}
            className={`flex-1 flex flex-col justify-center px-5 rounded-lg font-black text-xs uppercase tracking-widest transition-all
              ${activeTipe === 'debit'
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 transform scale-102'
                : 'bg-card text-muted-foreground border border-border'
              }`}
          >
            <span className="text-lg mb-1">+</span>
            Pemasukan
          </button>
          <button
            onClick={() => setActiveTipe('kredit')}
            className={`flex-1 flex flex-col justify-center px-5 rounded-lg font-black text-xs uppercase tracking-widest transition-all
              ${activeTipe === 'kredit'
                ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 transform scale-102'
                : 'bg-card text-muted-foreground border border-border'
              }`}
          >
            <span className="text-lg mb-1">-</span>
            Pengeluaran
          </button>
        </div>
      </div>

      <InputKeuangan tipe={activeTipe} onSimpan={handleSimpan} />

      <NexusDataTable
        title="Riwayat Transaksi"
        subtitle={`Dompet ${dompets.find(d => d.id === selectedDompetId)?.nama || ''}`}
        data={transaksi}
        isLoading={loading}
        itemsPerPage={10}
        onDelete={(item) => handleDeleteTransaction(item.id)}
        columns={[
          { 
            header: 'Waktu', 
            width: '100px',
            accessor: (t) => (
              <div>
                <p className="text-[11px] font-black">{new Date(t.waktu).toLocaleDateString('id-ID')}</p>
                <p className="text-[9px] opacity-40 font-bold uppercase">{new Date(t.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ),
            sortable: true
          },
          { header: 'Keterangan', accessor: 'keterangan', sortable: true },
          { 
            header: 'Tipe', 
            width: '80px',
            accessor: (t) => (
              <Badge variant={t.tipe === 'debit' ? 'success' : 'danger'}>
                <span className="text-[10px] uppercase font-black tracking-widest leading-none">{t.tipe === 'debit' ? 'Masuk' : 'Keluar'}</span>
              </Badge>
            )
          },
          { 
            header: 'Nominal', 
            width: '120px',
            accessor: (t) => (
              <p className={`font-black text-sm tabular-nums ${t.tipe === 'debit' ? 'text-blue-600' : 'text-rose-600'}`}>
                Rp {t.nominal.toLocaleString('id-ID')}
              </p>
            ),
            className: 'text-right'
          }
        ]}
      />
    </div>
  );
}
