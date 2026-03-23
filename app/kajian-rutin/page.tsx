'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import KajianItem from '../components/KajianItem';
import KajianForm from '../components/KajianForm';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useGlobalContext } from '../context/GlobalContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import NexusDataTable from '../components/ui/NexusDataTable';
import Badge from '../components/ui/Badge';


interface Kajian {
  id: string;
  hari: string;
  jam: string;
  ustadz: string;
  kitab: string;
  judul: string;
}

export default function KajianRutinPage() {
  const [items, setItems] = useState<Kajian[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Kajian | null>(null);
  const { config } = useGlobalContext();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('kajian_rutin')
      .select('*')
      .order('hari', { ascending: true }); // Simplified ordering
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data: any) => {
    let error;
    if (data.id) {
      const res = await supabase.from('kajian_rutin').update(data).eq('id', data.id);
      error = res.error;
    } else {
      const res = await supabase.from('kajian_rutin').insert(data);
      error = res.error;
    }

    if (error) {
      alert('Gagal menyimpan kajian: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal kajian ini?')) return;
    const { error } = await supabase.from('kajian_rutin').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus kajian: ' + error.message);
    } else {
      fetchData();
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Kajian Rutin" subtitle="Taman Surga" />

      {/* Info Card */}
      <div className="rounded-lg p-6 transition-all duration-500 relative overflow-hidden bg-blue-600 shadow-lg shadow-blue-100 text-white">
        <p className="text-[10px] font-black uppercase tracking-[3px] mb-3 transition-all duration-500 text-blue-100">Majelis Ilmu</p>
        <h2 className="text-2xl font-black mb-2 transition-all duration-500 text-white">Jadwal Kajian Rutin Masjid</h2>
        <p className="text-sm font-medium transition-all duration-500 opacity-80">Update informasi kajian mingguan untuk jamaah di sini.</p>
      </div>

      <Button variant="outline" onClick={() => { setEditData(null); setShowForm(true); }}>
        <span className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jadwal Kajian
        </span>
      </Button>

      <NexusDataTable
        title="Jadwal Kajian Rutin"
        data={items}
        isLoading={loading}
        itemsPerPage={10}
        onEdit={(item) => { setEditData(item); setShowForm(true); }}
        onDelete={(item) => handleDelete(item.id)}
        columns={[
          { 
            header: 'Waktu', 
            width: '100px',
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{item.hari}</span>
                <span className="text-[9px] font-bold text-muted-foreground">{item.jam} WIB</span>
              </div>
            ),
            sortable: true
          },
          { header: 'Ustadz / Pemateri', accessor: (item) => <span className="text-xs font-bold">{item.ustadz}</span>, sortable: true, width: '180px' },
          { 
            header: 'Materi / Kitab', 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-foreground leading-tight">{item.judul || 'Kajian Rutin'}</span>
                {item.kitab && <span className="text-[9px] font-medium text-muted-foreground italic leading-tight mt-0.5">Kitab: {item.kitab}</span>}
              </div>
            )
          }
        ]}
      />

      <KajianForm
        visible={showForm}
        onClose={() => { setShowForm(false); setEditData(null); }}
        onSave={handleSave}
        initialData={editData}
      />
    </div>
  );
}



