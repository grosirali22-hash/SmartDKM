'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

interface KajianData {
  id?: string;
  hari: string;
  jam: string;
  ustadz: string;
  kitab: string;
  judul: string;
}

interface KajianFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: KajianData) => void;
  initialData?: KajianData | null;
}

const DEFAULT_DATA: KajianData = {
  hari: 'AHAD',
  jam: '05:30',
  ustadz: '',
  kitab: '',
  judul: '',
};

const HARI_OPTIONS = ['AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

export default function KajianForm({ visible, onClose, onSave, initialData }: KajianFormProps) {
  const [data, setData] = useState<KajianData>(DEFAULT_DATA);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(DEFAULT_DATA);
    }
  }, [initialData, visible]);

  if (!visible) return null;

  const handleChange = (key: keyof KajianData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-900">
            {initialData?.id ? 'Edit Kajian' : 'Tambah Kajian'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
              Hari
            </label>
            <div className="flex flex-wrap gap-2">
              {HARI_OPTIONS.map((hari) => (
                <button
                  key={hari}
                  type="button"
                  onClick={() => handleChange('hari', hari)}
                  className={`px-3 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                    data.hari === hari
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}
                >
                  {hari}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Jam (e.g. 18:45)"
            placeholder="18:45"
            value={data.jam}
            onChange={(e) => handleChange('jam', e.target.value)}
            required
          />
          <Input
            label="Judul Kajian"
            placeholder="Kajian Fiqih, Tafsir, dll..."
            value={data.judul}
            onChange={(e) => handleChange('judul', e.target.value)}
            required
          />
          <Input
            label="Ustadz / Pemateri"
            placeholder="Ust. Fulan..."
            value={data.ustadz}
            onChange={(e) => handleChange('ustadz', e.target.value)}
            required
          />
          <Input
            label="Kitab / Referensi"
            placeholder="Bulughul Maram..."
            value={data.kitab}
            onChange={(e) => handleChange('kitab', e.target.value)}
          />

          <div className="pt-2">
            <Button variant="success" type="submit" className="w-full">
              {initialData?.id ? 'Simpan Perubahan' : 'Tambah Jadwal Kajian'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

