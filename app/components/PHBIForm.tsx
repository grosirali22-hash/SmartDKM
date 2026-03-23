'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

interface PHBIData {
  id?: string;
  nama: string;
  tanggal: string;
}

interface PHBIFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: PHBIData) => void;
  initialData?: PHBIData | null;
}

const DEFAULT_DATA: PHBIData = {
  nama: '',
  tanggal: new Date().toISOString().split('T')[0],
};

export default function PHBIForm({ visible, onClose, onSave, initialData }: PHBIFormProps) {
  const [data, setData] = useState<PHBIData>(DEFAULT_DATA);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(DEFAULT_DATA);
    }
  }, [initialData, visible]);

  if (!visible) return null;

  const handleChange = (key: keyof PHBIData, value: string) => {
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
            {initialData?.id ? 'Edit PHBI' : 'Tambah PHBI'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Hari Besar"
            placeholder="Idul Fitri, Maulid Nabi..."
            value={data.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />
          <Input
            label="Tanggal"
            type="date"
            value={data.tanggal}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            required
          />

          <div className="pt-2">
            <Button variant="success" type="submit" className="w-full">
              {initialData?.id ? 'Simpan Perubahan' : 'Tambah PHBI'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
