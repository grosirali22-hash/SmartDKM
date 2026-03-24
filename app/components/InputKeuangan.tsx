'use client';

import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { GlobalConfig } from '../types/config';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface InputKeuanganProps {
  tipe?: 'debit' | 'kredit';
  onSimpan?: (data: { nominal: string; keterangan: string }) => void;
  onRefresh?: () => void;
}

export default function InputKeuangan({ tipe = 'debit', onSimpan, onRefresh }: InputKeuanganProps) {
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const handleSimpan = () => {
    if (onSimpan) onSimpan({ nominal, keterangan });
    if (onRefresh) onRefresh();
    setNominal('');
    setKeterangan('');
  };

  const { config } = useGlobalContext() as { config: GlobalConfig };
  const isNeumorph = config.tema_warna === 'neumorph';

  return (
    <Card className={`mb-6 ${isNeumorph ? 'theme-neumorph' : ''}`}>
      <p className={`font-black text-lg mb-6 transition-all duration-500 ${isNeumorph ? 'text-primary' : 'text-slate-900'}`}>
        Catat {tipe === 'debit' ? 'Pemasukan' : 'Pengeluaran'}
      </p>
      <Input
        label="Nominal (Rp)"
        placeholder="0"
        type="number"
        value={nominal}
        onChange={(e) => setNominal(e.target.value)}
      />
      <Input
        label="Keterangan"
        placeholder="Contoh: Infaq Jumat"
        value={keterangan}
        onChange={(e) => setKeterangan(e.target.value)}
      />
      <Button variant={tipe === 'debit' ? 'success' : 'danger'} onClick={handleSimpan}>
        Simpan Transaksi
      </Button>
    </Card>
  );
}
