'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

interface PetugasData {
  id?: string;
  jenis: string;
  tanggal: string;
  imam: string;
  khatib: string;
  muadzin: string;
  bilal: string;
  catatan: string;
}

interface PetugasFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: PetugasData) => void;
  initialData?: PetugasData | null;
}

const DEFAULT_DATA: PetugasData = {
  jenis: 'jumat',
  tanggal: new Date().toISOString().split('T')[0],
  imam: '',
  khatib: '',
  muadzin: '',
  bilal: '',
  catatan: '',
};

const JENIS_OPTIONS = [
  { value: 'jumat', label: 'Jumat' },
  { value: 'taraweh', label: 'Taraweh' },
  { value: 'ied', label: 'Ied' },
];

export default function PetugasForm({ visible, onClose, onSave, initialData }: PetugasFormProps) {
  const [data, setData] = useState<PetugasData>(DEFAULT_DATA);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(DEFAULT_DATA);
    }
  }, [initialData, visible]);

  if (!visible) return null;

  const handleChange = (key: keyof PetugasData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
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
            {initialData?.id ? 'Edit Petugas' : 'Tambah Petugas'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Jenis */}
        <div className="mb-4">
          <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
            Jenis Shalat
          </label>
          <div className="flex gap-2">
            {JENIS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('jenis', opt.value)}
                className={`flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                  data.jenis === opt.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Tanggal"
          type="date"
          value={data.tanggal}
          onChange={(e) => handleChange('tanggal', e.target.value)}
        />
        <Input
          label="Imam"
          placeholder="Nama imam..."
          value={data.imam}
          onChange={(e) => handleChange('imam', e.target.value)}
        />
        <Input
          label="Khatib"
          placeholder="Nama khatib..."
          value={data.khatib}
          onChange={(e) => handleChange('khatib', e.target.value)}
        />
        <Input
          label="Muadzin"
          placeholder="Nama muadzin..."
          value={data.muadzin}
          onChange={(e) => handleChange('muadzin', e.target.value)}
        />
        <Input
          label="Bilal"
          placeholder="Nama bilal..."
          value={data.bilal}
          onChange={(e) => handleChange('bilal', e.target.value)}
        />
        <Input
          label="Catatan"
          placeholder="Catatan tambahan..."
          value={data.catatan}
          onChange={(e) => handleChange('catatan', e.target.value)}
        />

        <Button variant="success" onClick={handleSubmit}>
          {initialData?.id ? 'Simpan Perubahan' : 'Tambah Petugas'}
        </Button>
      </div>
    </div>
  );
}

