'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import StrukturForm from '../components/StrukturForm';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import NexusDataTable from '../components/ui/NexusDataTable';


interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  emoji: string;
  urutan: number;
}

export default function StrukturDKMPage() {
  const [items, setItems] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Pengurus | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('struktur_dkm')
      .select('*')
      .order('urutan', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data: any) => {
    let error;
    if (data.id) {
      const res = await supabase.from('struktur_dkm').update(data).eq('id', data.id);
      error = res.error;
    } else {
      const res = await supabase.from('struktur_dkm').insert(data);
      error = res.error;
    }

    if (error) {
      alert('Gagal menyimpan pengurus: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengurus ini?')) return;
    const { error } = await supabase.from('struktur_dkm').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus pengurus: ' + error.message);
    } else {
      fetchData();
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Struktur DKM" subtitle="Khidmah Untuk Ummah" />

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-600 rounded-lg p-5 text-white shadow-lg shadow-blue-100">
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Total Pengurus</p>
          <p className="text-3xl font-black">{items.length}</p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border flex items-center justify-center">
          <Button variant="outline" onClick={() => { setEditData(null); setShowForm(true); }} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Tambah
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <NexusDataTable
          title="Daftar Pengurus DKM"
          data={items}
          isLoading={loading}
          itemsPerPage={10}
          onEdit={(p) => { setEditData(p); setShowForm(true); }}
          onDelete={(p) => handleDelete(p.id)}
          columns={[
            { header: 'No', accessor: (p) => <span className="text-xs font-black opacity-30">{p.urutan}</span>, sortable: true, width: '50px' },
            { 
              header: 'Icon', 
              width: '50px',
              accessor: (p) => <span className="text-lg">{p.emoji || '👤'}</span> 
            },
            { header: 'Nama Pengurus', accessor: (p) => <span className="text-xs font-bold">{p.nama}</span>, sortable: true },
            { 
              header: 'Jabatan', 
              width: '140px',
              accessor: (p) => (
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  {p.jabatan}
                </span>
              ),
              sortable: true
            }
          ]}
        />
      )}

      <StrukturForm
        visible={showForm}
        onClose={() => { setShowForm(false); setEditData(null); }}
        onSave={handleSave}
        initialData={editData}
      />
    </div>
  );
}



