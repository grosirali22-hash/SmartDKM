'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FileUpload from '../components/FileUpload';
import { supabase } from '../lib/supabase';
import { deleteMedia } from '../lib/uploadMedia';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Image as ImageIcon, Film, ChevronUp, ChevronDown } from 'lucide-react';
import NexusDataTable from '../components/ui/NexusDataTable';
import Badge from '../components/ui/Badge';


interface SliderItem {
  id: string;
  judul: string;
  image_url: string;
  aktif: boolean;
  urutan: number;
}

export default function SliderPage() {
  const [items, setItems] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<SliderItem | null>(null);

  // Form state
  const [formJudul, setFormJudul] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('slider')
      .select('*')
      .order('urutan', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormJudul('');
    setFormImageUrl('');
    setEditData(null);
    setShowForm(false);
  };

  const openEdit = (item: SliderItem) => {
    setEditData(item);
    setFormJudul(item.judul || '');
    setFormImageUrl(item.image_url);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formImageUrl) {
      alert('Silakan upload gambar terlebih dahulu.');
      return;
    }
    const urutan = editData
      ? editData.urutan
      : items.length > 0
        ? Math.max(0, ...items.map((i) => Number(i.urutan) || 0)) + 1
        : 0;

    const payload = {
      judul: formJudul,
      image_url: formImageUrl,
      aktif: true,
      urutan,
    };

    let error;
    if (editData?.id) {
      const res = await supabase.from('slider').update(payload).eq('id', editData.id);
      error = res.error;
    } else {
      const res = await supabase.from('slider').insert(payload);
      error = res.error;
    }

    if (error) {
      alert('Gagal menyimpan slide: ' + error.message);
    } else {
      resetForm();
      fetchData();
    }
  };

  const handleDelete = async (item: SliderItem) => {
    if (!confirm(`Hapus slide "${item.judul || 'ini'}"?`)) return;
    await deleteMedia(item.image_url);
    const { error } = await supabase.from('slider').delete().eq('id', item.id);
    if (error) {
      alert('Gagal menghapus slide: ' + error.message);
    } else {
      fetchData();
    }
  };

  const toggleAktif = async (id: string, current: boolean) => {
    const { error } = await supabase.from('slider').update({ aktif: !current }).eq('id', id);
    if (error) {
      alert('Gagal merubah status: ' + error.message);
    } else {
      fetchData();
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const current = items[index];
    const prev = items[index - 1];
    const res1 = await supabase.from('slider').update({ urutan: prev.urutan }).eq('id', current.id);
    const res2 = await supabase.from('slider').update({ urutan: current.urutan }).eq('id', prev.id);
    if (res1.error || res2.error) {
      alert('Gagal merubah urutan: ' + (res1.error?.message || res2.error?.message));
    } else {
      fetchData();
    }
  };

  const moveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const current = items[index];
    const next = items[index + 1];
    const res1 = await supabase.from('slider').update({ urutan: next.urutan }).eq('id', current.id);
    const res2 = await supabase.from('slider').update({ urutan: current.urutan }).eq('id', next.id);
    if (res1.error || res2.error) {
      alert('Gagal merubah urutan: ' + (res1.error?.message || res2.error?.message));
    } else {
      fetchData();
    }
  };

  const handleUploaded = (url: string, file: File) => {
    setFormImageUrl(url);
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Konten Slider" subtitle="Kelola Slide Display" />

      {/* Image Size Info */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />
        <div>
          <p className="text-xs font-black text-blue-800 uppercase tracking-wider mb-0.5">Panduan Upload Gambar</p>
          <p className="text-xs font-bold text-blue-700">Rekomendasi: <strong>1920 × 1080px</strong> (16:9 Full HD) • Maks <strong>3 MB</strong> • Format: JPG, PNG, WebP</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
          <p className="text-2xl font-black text-blue-700">{items.filter((i) => i.aktif).length}</p>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Aktif</p>
        </div>
        <div className="bg-muted rounded-lg p-4 border border-border text-center">
          <p className="text-2xl font-black text-muted-foreground">{items.length}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Slide</p>
        </div>
      </div>

      {/* Tombol Tambah */}
      <Button variant="outline" onClick={() => { resetForm(); setShowForm(true); }}>
        <span className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Slide
        </span>
      </Button>

      <NexusDataTable
        title="Daftar Slide"
        data={items}
        isLoading={loading}
        itemsPerPage={10}
        onEdit={(item) => openEdit(item)}
        onDelete={(item) => handleDelete(item)}
        columns={[
          { 
            header: 'Preview', 
            width: '100px',
            accessor: (item) => (
              <div className="w-16 aspect-video bg-muted rounded-lg overflow-hidden border border-border mx-auto shadow-sm">
                <img src={item.image_url} alt={item.judul} className="w-full h-full object-cover" />
              </div>
            )
          },
          { header: 'Judul Slide', accessor: (item) => <span className="text-xs font-bold">{item.judul || 'Tanpa Judul'}</span>, sortable: true },
          { 
            header: 'Urutan', 
            width: '80px',
            accessor: (item) => {
              const index = items.findIndex(i => i.id === item.id);
              return (
                <div className="flex items-center gap-2">
                  <span className="font-black text-[10px] w-3 opacity-30">{item.urutan}</span>
                  <div className="flex flex-col">
                    <button 
                      onClick={() => moveUp(index)} 
                      disabled={index === 0}
                      className="p-0.5 hover:bg-blue-50 rounded disabled:opacity-30 text-blue-600"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button 
                      onClick={() => moveDown(index)} 
                      disabled={index === items.length - 1}
                      className="p-0.5 hover:bg-blue-50 rounded disabled:opacity-30 text-blue-600"
                    >
                      <ChevronDown size={10} />
                    </button>
                  </div>
                </div>
              );
            }
          },
          { 
            header: 'Status', 
            width: '100px',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <Badge variant={item.aktif ? 'success' : 'danger'}>
                  <span className="text-[8px] uppercase font-black tracking-widest leading-none">{item.aktif ? 'Aktif' : 'Non'}</span>
                </Badge>
                <button
                  onClick={() => toggleAktif(item.id, item.aktif)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  {item.aktif ? (
                    <Eye className="w-4 h-4 text-blue-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            )
          }
        ]}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-card rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-foreground">
                {editData ? 'Edit Slide' : 'Tambah Slide Baru'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-secondary rounded-full">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <Input label="Judul (opsional)" placeholder="Judul slide..." value={formJudul} onChange={(e) => setFormJudul(e.target.value)} />

            <FileUpload
              accept="image/*"
              folder="slider"
              onUploaded={handleUploaded}
              label="Upload Gambar"
            />

            {formImageUrl && (
              <div className="mt-3 mb-4">
                <p className="text-xs text-blue-600 font-bold">✓ File berhasil diupload</p>
                <img src={formImageUrl} className="mt-2 h-32 rounded-lg object-cover border" alt="Preview" />
              </div>
            )}

            <Button variant="success" onClick={handleSave}>
              {editData ? 'Simpan Perubahan' : 'Tambah Slide'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


