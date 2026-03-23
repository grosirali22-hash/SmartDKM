'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, GripVertical, ToggleLeft, ToggleRight, Type, ChevronUp, ChevronDown } from 'lucide-react';
import NexusDataTable from '../components/ui/NexusDataTable';
import Badge from '../components/ui/Badge';

interface RunningTextItem {
  id: string;
  teks: string;
  aktif: boolean;
  urutan: number;
}

export default function RunningTextPage() {
  const [items, setItems] = useState<RunningTextItem[]>([]);
  const [newTeks, setNewTeks] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('running_texts')
      .select('*')
      .order('urutan', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newTeks.trim()) return;
    const urutan = items.length > 0 ? Math.max(...items.map((i) => i.urutan)) + 1 : 0;
    const { error } = await supabase.from('running_texts').insert({ teks: newTeks.trim(), aktif: true, urutan });
    if (error) {
      alert('Gagal menambah teks: ' + error.message);
    } else {
      setNewTeks('');
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus teks ini?')) return;
    const { error } = await supabase.from('running_texts').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus teks: ' + error.message);
    } else {
      fetchData();
    }
  };

  const toggleAktif = async (id: string, current: boolean) => {
    const { error } = await supabase.from('running_texts').update({ aktif: !current }).eq('id', id);
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
    const res1 = await supabase.from('running_texts').update({ urutan: prev.urutan }).eq('id', current.id);
    const res2 = await supabase.from('running_texts').update({ urutan: current.urutan }).eq('id', prev.id);
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
    const res1 = await supabase.from('running_texts').update({ urutan: next.urutan }).eq('id', current.id);
    const res2 = await supabase.from('running_texts').update({ urutan: current.urutan }).eq('id', next.id);
    if (res1.error || res2.error) {
      alert('Gagal merubah urutan: ' + (res1.error?.message || res2.error?.message));
    } else {
      fetchData();
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Running Text" subtitle="Pengumuman & Informasi Berjalan" />

      {/* Form Tambah */}
      <Card className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Tulis pengumuman atau informasi baru..."
              value={newTeks}
              onChange={(e) => setNewTeks(e.target.value)}
            />
          </div>
        </div>
        <Button variant="success" onClick={handleAdd}>
          <span className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Running Text
          </span>
        </Button>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
          <p className="text-2xl font-black text-blue-700">{items.filter((i) => i.aktif).length}</p>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Aktif</p>
        </div>
        <div className="bg-muted rounded-lg p-4 border border-border text-center">
          <p className="text-2xl font-black text-muted-foreground">{items.filter((i) => !i.aktif).length}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Non-aktif</p>
        </div>
      </div>

      {/* Daftar */}
      {loading ? (
        <Card className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Memuat data...</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="text-center py-10">
          <Type className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-muted-foreground italic">Belum ada running text.</p>
        </Card>
      ) : (
      <NexusDataTable
        title="Daftar Running Text"
        data={items}
        isLoading={loading}
        itemsPerPage={10}
        onDelete={(item) => handleDelete(item.id)}
        columns={[
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
          { header: 'Teks Pengumuman', accessor: (item) => <span className="text-[11px] font-bold text-foreground leading-relaxed">{item.teks}</span> },
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
                    <ToggleRight className="w-4 h-4 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            )
          }
        ]}
      />
      )}
    </div>
  );
}


