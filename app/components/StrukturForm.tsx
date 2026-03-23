'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

interface StrukturData {
  id?: string;
  nama: string;
  jabatan: string;
  emoji: string;
  urutan: number;
}

interface StrukturFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: StrukturData) => void;
  initialData?: StrukturData | null;
}

const DEFAULT_DATA: StrukturData = {
  nama: '',
  jabatan: '',
  emoji: '👤',
  urutan: 0,
};

export default function StrukturForm({ visible, onClose, onSave, initialData }: StrukturFormProps) {
  const [data, setData] = useState<StrukturData>(DEFAULT_DATA);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(DEFAULT_DATA);
    }
  }, [initialData, visible]);

  if (!visible) return null;

  const handleChange = (key: keyof StrukturData, value: string | number) => {
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
            {initialData?.id ? 'Edit Pengurus' : 'Tambah Pengurus'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Pengurus"
            placeholder="H. Ahmad Fauzi..."
            value={data.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />
          <Input
            label="Jabatan"
            placeholder="Ketua DKM, Bendahara, dll..."
            value={data.jabatan}
            onChange={(e) => handleChange('jabatan', e.target.value)}
            required
          />
          <Input
            label="Emoji / Icon"
            placeholder="👤, 👳‍♂️, 🕋..."
            value={data.emoji}
            onChange={(e) => handleChange('emoji', e.target.value)}
          />
          <Input
            label="Urutan Tampil"
            type="number"
            value={data.urutan}
            onChange={(e) => handleChange('urutan', parseInt(e.target.value) || 0)}
          />

          <div className="pt-2">
            <Button variant="success" type="submit" className="w-full">
              {initialData?.id ? 'Simpan Perubahan' : 'Tambah Pengurus'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
