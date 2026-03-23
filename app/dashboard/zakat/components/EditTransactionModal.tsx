import React, { useState } from 'react';
import { Transaksi } from '../types';
import ZakatModal from './ZakatModal';

interface EditTransactionModalProps {
  transaction: Transaksi;
  onClose: () => void;
  onSave: (form: any) => void;
  ZAKAT_TYPES: string[];
}

const EditTransactionModal = ({
  transaction,
  onClose,
  onSave,
  ZAKAT_TYPES,
}: EditTransactionModalProps) => {
  const [formEdit, setFormEdit] = useState({
    jenis_zakat: transaction.jenis_zakat,
    satuan: transaction.satuan,
    unit_beras: transaction.unit_beras,
    jumlah: transaction.jumlah,
  });

  return (
    <ZakatModal
      title="Edit Log Transaksi"
      onClose={onClose}
      onSave={() => onSave(formEdit)}
      saveLabel="Perbarui Transaksi"
    >
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg border border-border">
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Pihak Terkait</p>
          <p className="font-black text-foreground">
            {transaction.tipe === 'masuk' ? transaction.muzaki?.nama : transaction.mustahik?.nama}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Jenis Zakat</p>
          <select
            className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-sm"
            value={formEdit.jenis_zakat}
            onChange={(e) => setFormEdit({ ...formEdit, jenis_zakat: e.target.value })}
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
              disabled={formEdit.jenis_zakat === 'Infaq'}
              className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-sm"
              value={formEdit.satuan}
              onChange={(e) => setFormEdit({ ...formEdit, satuan: e.target.value as any })}
            >
              <option value="uang">Uang (IDR)</option>
              <option value="beras">Beras</option>
            </select>
          </div>
          {formEdit.satuan === 'beras' && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Unit Beras</p>
              <select
                className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-sm"
                value={formEdit.unit_beras}
                onChange={(e) => setFormEdit({ ...formEdit, unit_beras: e.target.value as any })}
              >
                <option value="kg">Kilo (KG)</option>
                <option value="liter">Liter (L)</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Jumlah</p>
          <input
            type="number"
            className="w-full p-5 bg-muted border border-border rounded-lg font-black text-xl text-foreground"
            value={formEdit.jumlah}
            onChange={(e) => setFormEdit({ ...formEdit, jumlah: Number(e.target.value) })}
          />
        </div>
      </div>
    </ZakatModal>
  );
};

export default EditTransactionModal;
