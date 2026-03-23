import React, { useState } from 'react';
import ZakatModal from './ZakatModal';

interface BulkTransactionModalProps {
  type: 'masuk' | 'keluar';
  selectedCount: number;
  onClose: () => void;
  onSave: (form: any) => void;
  settings: {
    fitrah_uang: number;
    fitrah_beras_kg: number;
  };
  ZAKAT_TYPES: string[];
}

const BulkTransactionModal = ({
  type,
  selectedCount,
  onClose,
  onSave,
  settings,
  ZAKAT_TYPES,
}: BulkTransactionModalProps) => {
  const [bulkForm, setBulkForm] = useState({
    jenis_zakat: 'Fitrah',
    satuan: 'uang' as 'uang' | 'beras',
    unit_beras: 'kg' as 'kg' | 'liter',
    jumlah: settings.fitrah_uang,
    is_baznas: false,
  });

  return (
    <ZakatModal
      title={`Proses Massal: ${
        type === 'masuk' ? 'Terima Zakat (' + selectedCount + ' Muzaki)' : 'Salurkan Zakat (' + selectedCount + ' Mustahik)'
      }`}
      onClose={onClose}
      onSave={() => onSave(bulkForm)}
      saveLabel="Proses Massal Sekarang"
    >
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-[10px] font-black uppercase text-blue-600">Perhatian</p>
          <p className="text-xs font-bold text-blue-800">
            Aksi ini akan membuat satu record transaksi untuk SETIAP nama yang dipilih dengan nominal yang sama.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Jenis Zakat</p>
          <select
            className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-sm"
            value={bulkForm.jenis_zakat}
            onChange={(e) => setBulkForm({ ...bulkForm, jenis_zakat: e.target.value })}
          >
            {ZAKAT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="Infaq">Infaq / Sedekah</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Satuan</p>
            <select
              disabled={bulkForm.jenis_zakat === 'Infaq'}
              className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-sm"
              value={bulkForm.satuan}
              onChange={(e) => setBulkForm({ ...bulkForm, satuan: e.target.value as any })}
            >
              <option value="uang">Uang (IDR)</option>
              <option value="beras">Beras</option>
            </select>
          </div>
          {bulkForm.satuan === 'beras' && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Unit Beras</p>
              <select
                className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-sm"
                value={bulkForm.unit_beras}
                onChange={(e) => setBulkForm({ ...bulkForm, unit_beras: e.target.value as any })}
              >
                <option value="kg">Kilo (KG)</option>
                <option value="liter">Liter (L)</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Jumlah Per Orang</p>
          <input
            type="number"
            className="w-full p-5 bg-muted border border-border rounded-lg font-black text-xl text-foreground"
            value={bulkForm.jumlah}
            onChange={(e) => setBulkForm({ ...bulkForm, jumlah: Number(e.target.value) })}
          />
        </div>

        {type === 'masuk' && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <input
              type="checkbox"
              id="cb-baznas"
              className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              checked={bulkForm.is_baznas}
              onChange={(e) => setBulkForm({ ...bulkForm, is_baznas: e.target.checked })}
            />
            <label htmlFor="cb-baznas" className="text-xs font-black text-blue-900 cursor-pointer">
              Langsung Lapor/Setor ke Baznas
            </label>
          </div>
        )}
      </div>
    </ZakatModal>
  );
};

export default BulkTransactionModal;
