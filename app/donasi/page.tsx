'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FileUpload from '../components/FileUpload';
import { supabase } from '../lib/supabase';
import { deleteMedia } from '../lib/uploadMedia';
import { Plus, Pencil, Trash2, Copy, X, CreditCard, Smartphone, QrCode, Check } from 'lucide-react';
import NexusDataTable from '../components/ui/NexusDataTable';
import Badge from '../components/ui/Badge';

interface DonasiInfo {
  id: string;
  jenis: string;
  nama_bank: string;
  no_rekening: string;
  atas_nama: string;
  qris_url: string;
  aktif: boolean;
}

const JENIS_OPTIONS = [
  { value: 'bank', label: 'Bank', icon: CreditCard },
  { value: 'ewallet', label: 'E-Wallet', icon: Smartphone },
  { value: 'qris', label: 'QRIS', icon: QrCode },
];

const JENIS_COLORS: Record<string, string> = {
  bank: 'bg-blue-100 text-blue-700',
  ewallet: 'bg-blue-100 text-blue-700',
  qris: 'bg-purple-100 text-purple-700',
};

export default function DonasiPage() {
  const [items, setItems] = useState<DonasiInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<DonasiInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formJenis, setFormJenis] = useState('bank');
  const [formNamaBank, setFormNamaBank] = useState('');
  const [formNoRek, setFormNoRek] = useState('');
  const [formAtasNama, setFormAtasNama] = useState('');
  const [formQrisUrl, setFormQrisUrl] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('donasi_info')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormJenis('bank');
    setFormNamaBank('');
    setFormNoRek('');
    setFormAtasNama('');
    setFormQrisUrl('');
    setEditData(null);
    setShowForm(false);
  };

  const openEdit = (item: DonasiInfo) => {
    setEditData(item);
    setFormJenis(item.jenis);
    setFormNamaBank(item.nama_bank || '');
    setFormNoRek(item.no_rekening || '');
    setFormAtasNama(item.atas_nama || '');
    setFormQrisUrl(item.qris_url || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      jenis: formJenis,
      nama_bank: formNamaBank,
      no_rekening: formNoRek,
      atas_nama: formAtasNama,
      qris_url: formQrisUrl,
      aktif: true,
    };

    let error;
    if (editData?.id) {
      const res = await supabase.from('donasi_info').update(payload).eq('id', editData.id);
      error = res.error;
    } else {
      const res = await supabase.from('donasi_info').insert(payload);
      error = res.error;
    }

    if (error) {
      alert('Gagal menyimpan info donasi: ' + error.message);
    } else {
      resetForm();
      fetchData();
    }
  };

  const handleDelete = async (item: DonasiInfo) => {
    if (!confirm('Hapus info donasi ini?')) return;
    if (item.qris_url) await deleteMedia(item.qris_url);
    const { error } = await supabase.from('donasi_info').delete().eq('id', item.id);
    if (error) {
      alert('Gagal menghapus info donasi: ' + error.message);
    } else {
      fetchData();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Donasi" subtitle="Informasi Rekening & QRIS Masjid" />

      {/* Header Info */}
      <div className="bg-blue-600 rounded-lg p-5 text-white">
        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Sedekah Jariyah</p>
        <h2 className="text-xl font-black mb-2">Mari Berdonasi untuk Kemakmuran Masjid</h2>
        <p className="text-blue-100 text-sm">Setiap rupiah yang Anda donasikan akan dipertanggungjawabkan dengan transparan.</p>
      </div>

      {/* Tombol Tambah */}
      <Button variant="outline" onClick={() => { resetForm(); setShowForm(true); }}>
        <span className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Info Donasi
        </span>
      </Button>

      <NexusDataTable
        title="Daftar Info Donasi"
        data={items}
        isLoading={loading}
        itemsPerPage={10}
        onEdit={(item) => openEdit(item)}
        onDelete={(item) => handleDelete(item)}
        columns={[
          { 
            header: 'Jenis', 
            width: '70px',
            accessor: (item) => (
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${JENIS_COLORS[item.jenis]}`}>
                {item.jenis}
              </span>
            )
          },
          { header: 'Bank / E-Wallet', accessor: 'nama_bank', sortable: true, width: '130px' },
          { 
            header: 'Nomor Rekening', 
            width: '180px',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <p className="font-black text-blue-700 tracking-wider font-mono text-xs">{item.no_rekening}</p>
                <button
                  onClick={() => copyToClipboard(item.no_rekening, item.id)}
                  className="p-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            )
          },
          { header: 'Atas Nama', accessor: 'atas_nama', sortable: true },
          { 
            header: 'QRIS', 
            width: '60px',
            accessor: (item) => item.qris_url ? (
              <img src={item.qris_url} alt="QRIS" className="w-8 h-8 object-cover rounded-md border border-border mx-auto" />
            ) : null
          }
        ]}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-card rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-foreground">
                {editData ? 'Edit Info Donasi' : 'Tambah Info Donasi'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-secondary rounded-md">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Jenis */}
            <div className="mb-4">
              <label className="block text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Jenis</label>
              <div className="flex gap-2">
                {JENIS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormJenis(opt.value)}
                    className={`flex-1 py-3 rounded-md font-black text-xs uppercase tracking-widest transition-all ${
                      formJenis === opt.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Nama Bank / E-Wallet" placeholder="BRI, Mandiri, GoPay..." value={formNamaBank} onChange={(e) => setFormNamaBank(e.target.value)} />
            <Input label="Nomor Rekening" placeholder="1234567890" value={formNoRek} onChange={(e) => setFormNoRek(e.target.value)} />
            <Input label="Atas Nama" placeholder="DKM Masjid Al-Istiqomah" value={formAtasNama} onChange={(e) => setFormAtasNama(e.target.value)} />

            {formJenis === 'qris' && (
              <FileUpload
                accept="image/*"
                folder="qris"
                onUploaded={(url) => setFormQrisUrl(url)}
                label="Upload Gambar QRIS"
              />
            )}

            <Button variant="success" onClick={handleSave}>
              {editData ? 'Simpan Perubahan' : 'Tambah Donasi'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


