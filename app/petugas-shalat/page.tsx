'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PetugasForm from '../components/PetugasForm';
import { supabase } from '../lib/supabase';
import { useGlobalContext } from '../context/GlobalContext';
import { Plus, Pencil, Trash2, User, Mic2 } from 'lucide-react';
import NexusDataTable from '../components/ui/NexusDataTable';
import Badge from '../components/ui/Badge';

interface Petugas {
  id: string;
  jenis: string;
  tanggal: string;
  imam: string;
  khatib: string;
  muadzin: string;
  bilal: string;
  catatan: string;
}

const JENIS_TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'jumat', label: 'Jumat' },
  { value: 'taraweh', label: 'Taraweh' },
  { value: 'ied', label: 'Ied' },
];

const JENIS_COLORS: Record<string, string> = {
  jumat: 'bg-blue-100 text-blue-700',
  taraweh: 'bg-blue-100 text-blue-700',
  ied: 'bg-amber-100 text-amber-700',
};

export default function PetugasShalatPage() {
  const [data, setData] = useState<Petugas[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Petugas | null>(null);
  const [loading, setLoading] = useState(true);
  const { config } = useGlobalContext();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('petugas_shalat')
      .select('*')
      .order('tanggal', { ascending: false });
    if (rows) setData(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (item: any) => {
    let error;
    if (item.id) {
      const res = await supabase.from('petugas_shalat').update(item).eq('id', item.id);
      error = res.error;
    } else {
      const res = await supabase.from('petugas_shalat').insert(item);
      error = res.error;
    }

    if (error) {
      alert('Gagal menyimpan petugas: ' + error.message);
    } else {
      setEditData(null);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus petugas ini?')) return;
    const { error } = await supabase.from('petugas_shalat').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus petugas: ' + error.message);
    } else {
      fetchData();
    }
  };

  const filtered = activeTab === 'all' ? data : data.filter((d) => d.jenis === activeTab);

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Petugas Shalat" subtitle="Jadwal Imam & Khatib" />

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {JENIS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`py-3 px-6 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white shadow-md active:scale-95'
                : 'bg-card text-muted-foreground border border-border hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* Tombol Tambah */}
      <Button variant="outline" onClick={() => { setEditData(null); setShowForm(true); }}>
        <span className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jadwal Petugas
        </span>
      </Button>

      <NexusDataTable
        title="Jadwal Petugas Shalat"
        data={filtered}
        isLoading={loading}
        itemsPerPage={10}
        onEdit={(item) => { setEditData(item); setShowForm(true); }}
        onDelete={(item) => handleDelete(item.id)}
        columns={[
          { 
            header: 'Tanggal', 
            width: '130px',
            accessor: (item) => (
              <p className="font-black text-[11px] leading-tight">
                {new Date(item.tanggal + 'T00:00').toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            ),
            sortable: true
          },
          { 
            header: 'Jenis', 
            width: '80px',
            accessor: (item) => (
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${JENIS_COLORS[item.jenis] || 'bg-secondary text-muted-foreground'}`}>
                {item.jenis}
              </span>
            )
          },
          { header: 'Imam', accessor: (item) => <span className="text-xs font-bold">{item.imam}</span>, sortable: true },
          { header: 'Khatib', accessor: (item) => <span className="text-xs font-bold">{item.khatib}</span>, sortable: true },
          { header: 'Muadzin', accessor: (item) => <span className="text-xs font-bold">{item.muadzin}</span>, sortable: true },
          { header: 'Bilal', accessor: (item) => <span className="text-xs font-bold">{item.bilal}</span>, sortable: true }
        ]}
      />

      {/* Form Modal */}
      <PetugasForm
        visible={showForm}
        onClose={() => { setShowForm(false); setEditData(null); }}
        onSave={handleSave}
        initialData={editData}
      />
    </div>
  );
}


