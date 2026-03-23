'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

interface JadwalData {
  id?: string;
  tanggal: string;
  imsyak: string;
  subuh: string;
  syuruq: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  koreksi_menit: number;
  tampilkan: boolean;
}

interface JadwalFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: JadwalData) => void;
  initialData?: JadwalData | null;
}

const DEFAULT_DATA: JadwalData = {
  tanggal: new Date().toISOString().split('T')[0],
  imsyak: '',
  subuh: '',
  syuruq: '',
  dhuha: '',
  dzuhur: '',
  ashar: '',
  maghrib: '',
  isya: '',
  koreksi_menit: 0,
  tampilkan: true,
};

const WAKTU_LABELS: { key: keyof JadwalData; label: string }[] = [
  { key: 'imsyak', label: 'Imsyak' },
  { key: 'subuh', label: 'Subuh' },
  { key: 'syuruq', label: 'Syuruq' },
  { key: 'dhuha', label: 'Dhuha' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
];

export default function JadwalForm({ visible, onClose, onSave, initialData }: JadwalFormProps) {
  const [data, setData] = useState<JadwalData>(DEFAULT_DATA);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(DEFAULT_DATA);
    }
  }, [initialData, visible]);

  if (!visible) return null;

  const handleChange = (key: keyof JadwalData, value: string | number | boolean) => {
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
            {initialData?.id ? 'Edit Jadwal' : 'Tambah Jadwal Manual'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <Input
          label="Tanggal"
          type="date"
          value={data.tanggal}
          onChange={(e) => handleChange('tanggal', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          {WAKTU_LABELS.map(({ key, label }) => (
            <Input
              key={key}
              label={label}
              type="time"
              value={(data[key] as string) || ''}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ))}
        </div>

        <Input
          label="Koreksi Waktu (menit)"
          type="number"
          value={String(data.koreksi_menit)}
          onChange={(e) => handleChange('koreksi_menit', parseInt(e.target.value) || 0)}
        />

        <div className="flex items-center gap-3 mb-4 ml-1">
          <input
            type="checkbox"
            checked={data.tampilkan}
            onChange={(e) => handleChange('tampilkan', e.target.checked)}
            className="w-5 h-5 rounded-lg accent-blue-600"
          />
          <label className="text-slate-500 text-xs font-black uppercase tracking-widest">
            Tampilkan di Display
          </label>
        </div>

        <Button variant="success" onClick={handleSubmit}>
          {initialData?.id ? 'Simpan Perubahan' : 'Tambah Jadwal'}
        </Button>
      </div>
    </div>
  );
}

