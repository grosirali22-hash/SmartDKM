'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Download, Upload, Trash2, Loader2, Plus, X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import NexusDataTable from '../components/ui/NexusDataTable';


interface Aset {
  id: string;
  nama: string;
  kondisi: 'Baik' | 'Perlu Servis' | 'Rusak';
  lokasi: string;
  tahun: string;
}

export default function InventarisPage() {
  const { config } = useGlobalContext();
  const [assets, setAssets] = useState<Aset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ nama: '', kondisi: 'Baik', lokasi: '', tahun: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inventaris').select('*').order('nama');
    if (!error && data) setAssets(data);
    setLoading(false);
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('inventaris').insert([formData]);
    if (error) {
      alert('Gagal menyimpan aset: ' + error.message);
    } else {
      setShowAdd(false);
      setFormData({ nama: '', kondisi: 'Baik', lokasi: '', tahun: '' });
      fetchAssets();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus aset ini dari inventaris?')) return;
    const { error } = await supabase.from('inventaris').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus aset: ' + error.message);
    } else {
      fetchAssets();
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([['Nama', 'Kondisi (Baik/Perlu Servis/Rusak)', 'Lokasi', 'Tahun']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_inventaris.xlsx');
  };

  const handleExport = () => {
    if (assets.length === 0) return;
    const rows = assets.map(a => ({ Nama: a.nama, Kondisi: a.kondisi, Lokasi: a.lokasi, Tahun: a.tahun }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaris');
    XLSX.writeFile(wb, `inventaris_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);

      const newRecords = rows.map(r => ({
        nama: r['Nama']?.toString() || '',
        kondisi: (r['Kondisi (Baik/Perlu Servis/Rusak)'] || r['Kondisi'] || 'Baik') as any,
        lokasi: r['Lokasi']?.toString() || '',
        tahun: r['Tahun']?.toString() || ''
      })).filter(r => r.nama);

      if (newRecords.length === 0) return alert('Tidak ada data yang valid di file.');
      const { error } = await supabase.from('inventaris').insert(newRecords);
      if (error) {
        alert('Gagal mengimpor inventaris: ' + error.message);
      } else {
        fetchAssets();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const kondisiVariant: Record<string, 'success' | 'warning' | 'danger'> = {
    Baik: 'success',
    'Perlu Servis': 'warning',
    Rusak: 'danger',
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionTitle title="Inventaris" subtitle="Aset & Barang Masjid" />
        <div className="flex items-center gap-2">
          <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all">
            <FileSpreadsheet size={14} /> Template
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-muted-foreground text-xs font-bold hover:bg-muted transition-all">
            <Upload size={14} /> Import XLS
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-muted-foreground text-xs font-bold hover:bg-muted transition-all">
            <Download size={14} /> Export XLS
          </button>
          <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? "danger" : "primary"} className="!py-2 !px-4">
            {showAdd ? <X size={16} /> : <Plus size={16} />}
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="!p-5 border-2 border-blue-100">
          <form onSubmit={handleSimpan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Nama Barang</label>
              <input required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Kondisi</label>
              <select value={formData.kondisi} onChange={e => setFormData({...formData, kondisi: e.target.value as any})} className="w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold appearance-none">
                <option>Baik</option>
                <option>Perlu Servis</option>
                <option>Rusak</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Lokasi</label>
              <input required value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Tahun Perolehan</label>
              <input required value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} className="w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" placeholder="2024" />
            </div>
            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="w-full">Simpan Aset</Button>
            </div>
          </form>
        </Card>
      )}

      <NexusDataTable
        title="Daftar Inventaris"
        data={assets}
        isLoading={loading}
        itemsPerPage={10}
        onDelete={(item) => handleDelete(item.id)}
        columns={[
          { header: 'Nama Barang', accessor: (item) => <span className="text-xs font-bold">{item.nama}</span>, sortable: true },
          { 
            header: 'Kondisi', 
            width: '100px',
            accessor: (item) => (
              <Badge variant={kondisiVariant[item.kondisi] || 'info'}>
                <span className="text-[10px] uppercase font-black tracking-widest leading-none">{item.kondisi}</span>
              </Badge>
            )
          },
          { header: 'Lokasi', accessor: (item) => <span className="text-xs opacity-70">{item.lokasi}</span>, sortable: true, width: '130px' },
          { header: 'Tahun', accessor: (item) => <span className="text-xs font-black opacity-50">{item.tahun}</span>, sortable: true, width: '70px' }
        ]}
      />
    </div>
  );
}
