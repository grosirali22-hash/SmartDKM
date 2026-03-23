import React, { useState } from 'react';
import { ArrowUpRight, Square, X } from 'lucide-react';
import { Muzaki, CartItem } from '../types';
import ZakatModal from './ZakatModal';

interface TransactionModalProps {
  muzaki: Muzaki[];
  onClose: () => void;
  onSave: (cart: CartItem[], muzakiForm: any, muzakiId: string | null) => void;
  settings: {
    fitrah_uang: number;
    fitrah_beras_kg: number;
    fitrah_beras_liter: number;
    infaq_uang: number;
  };
  ZAKAT_TYPES: string[];
}

const TransactionModal = ({
  muzaki,
  onClose,
  onSave,
  settings,
  ZAKAT_TYPES,
}: TransactionModalProps) => {
  const [formMuzaki, setFormMuzaki] = useState({ nama: '', alamat: '', telepon: '' });
  const [muzakiId, setMuzakiId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formItem, setFormItem] = useState<any>({
    jenis_zakat: 'Fitrah',
    satuan: 'uang',
    unit_beras: 'kg',
    jumlah: settings.fitrah_uang,
  });

  const handleZakatItemChange = (field: string, value: any) => {
    const next = { ...formItem, [field]: value };
    if (field === 'jenis_zakat') {
      if (value === 'Infaq') {
        next.satuan = 'uang';
        next.jumlah = settings.infaq_uang;
      } else if (value === 'Fitrah') {
        next.jumlah = next.satuan === 'uang' ? settings.fitrah_uang : settings.fitrah_beras_kg;
      }
    }
    if (field === 'satuan' && next.jenis_zakat === 'Fitrah') {
      next.jumlah = value === 'uang' ? settings.fitrah_uang : settings.fitrah_beras_kg;
    }
    setFormItem(next);
  };

  return (
    <ZakatModal
      title="Penerimaan Zakat & Infaq"
      onClose={onClose}
      onSave={() => onSave(cart, formMuzaki, muzakiId)}
      saveLabel="Simpan & Cetak Kwitansi"
    >
      <div className="space-y-6">
        <div className="relative">
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Data Muzaki (Cari atau Baru)</p>
          <input
            placeholder="Ketik Nama Muzaki..."
            className="w-full p-5 bg-muted rounded-lg font-bold border-2 border-transparent focus:border-blue-500 transition-all outline-none"
            value={formMuzaki.nama}
            onChange={(e) => {
              const val = e.target.value;
              setFormMuzaki((prev) => ({ ...prev, nama: val }));

              const match = muzaki.find((m) => m.nama.toLowerCase().trim() === val.toLowerCase().trim());
              if (match && val !== '') {
                setMuzakiId(match.id);
                setFormMuzaki({ nama: match.nama, alamat: match.alamat || '', telepon: match.telepon || '' });
              } else {
                setMuzakiId(null);
              }
              if (val === '') setFormMuzaki({ nama: '', alamat: '', telepon: '' });
            }}
          />
          {formMuzaki.nama && !muzakiId && (
            <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-2xl overflow-hidden divide-y divide-slate-50 max-h-60 overflow-y-auto">
              {muzaki
                .filter((m) => m.nama.toLowerCase().includes(formMuzaki.nama.toLowerCase()))
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setMuzakiId(m.id);
                      setFormMuzaki({ nama: m.nama, alamat: m.alamat, telepon: m.telepon });
                    }}
                  >
                    <p className="font-bold text-foreground">{m.nama}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">
                      {m.alamat || 'Tanpa Alamat'}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Alamat</p>
            <input
              placeholder="Alamat"
              className="w-full p-4 bg-muted rounded-lg font-bold text-sm"
              value={formMuzaki.alamat}
              onChange={(e) => setFormMuzaki({ ...formMuzaki, alamat: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">No HP / WA</p>
            <input
              placeholder="No WA"
              className="w-full p-4 bg-muted rounded-lg font-bold text-sm"
              value={formMuzaki.telepon}
              onChange={(e) => setFormMuzaki({ ...formMuzaki, telepon: e.target.value })}
            />
          </div>
        </div>

        <div className="h-px bg-muted" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-muted p-5 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white bg-blue-500`}>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="font-black uppercase text-[10px] tracking-widest text-foreground">Tambah Item</span>
            </div>

            <select
              className="w-full p-4 bg-card rounded-lg font-bold text-sm shadow-sm border border-border"
              value={formItem.jenis_zakat}
              onChange={(e) => handleZakatItemChange('jenis_zakat', e.target.value)}
            >
              {ZAKAT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="Infaq">Infaq / Sedekah</option>
            </select>

            {formItem.jenis_zakat !== 'Infaq' && (
              <select
                className="w-full p-4 bg-card rounded-lg font-bold text-sm shadow-sm border border-border"
                value={formItem.satuan}
                onChange={(e) => handleZakatItemChange('satuan', e.target.value as any)}
              >
                <option value="uang">Uang (IDR)</option>
                <option value="beras">Beras</option>
              </select>
            )}

            {formItem.satuan === 'beras' && formItem.jenis_zakat !== 'Infaq' && (
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-lg">
                <button
                  onClick={() => handleZakatItemChange('unit_beras', 'kg')}
                  className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${
                    formItem.unit_beras === 'kg' ? 'bg-card shadow-sm text-blue-600' : 'text-muted-foreground'
                  }`}
                >
                  Kilo (KG)
                </button>
                <button
                  onClick={() => handleZakatItemChange('unit_beras', 'liter')}
                  className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${
                    formItem.unit_beras === 'liter' ? 'bg-card shadow-sm text-blue-600' : 'text-muted-foreground'
                  }`}
                >
                  Liter (L)
                </button>
              </div>
            )}

            <input
              type="number"
              placeholder="Nominal / Jumlah"
              className="w-full p-4 bg-card rounded-lg font-black text-xl shadow-sm border border-border text-foreground"
              value={formItem.jumlah || ''}
              onChange={(e) => setFormItem({ ...formItem, jumlah: Number(e.target.value) })}
            />

            <button
              onClick={() => {
                if (formItem.jumlah <= 0) return alert('Jumlah tidak valid');
                setCart([
                  ...cart,
                  {
                    ...formItem,
                    id: Date.now().toString(),
                    jenis_zakat: formItem.jenis_zakat === 'Infaq' ? 'Infaq' : formItem.jenis_zakat,
                    satuan: formItem.jenis_zakat === 'Infaq' ? 'uang' : formItem.satuan,
                  },
                ]);
                setFormItem({ ...formItem, jumlah: 0 });
              }}
              className={`w-full py-4 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg transition-all bg-blue-600 shadow-blue-200 hover:bg-blue-700`}
            >
              Tambah ke Daftar
            </button>
          </div>

          <div className="space-y-4 flex flex-col">
            <span className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">
              Daftar Penerimaan
            </span>
            <div className="flex-1 bg-muted rounded-lg p-2 flex flex-col overflow-hidden border border-border min-h-[250px] shadow-inner">
              <div className="flex-1 overflow-y-auto space-y-2 p-2 scrollbar-hide">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[10px] font-black uppercase text-slate-300 opacity-50">
                    <Square className="w-8 h-8 mb-2" /> Keranjang Kosong
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-card rounded-lg shadow-sm border border-border"
                    >
                      <div>
                        <p className="font-bold text-xs text-foreground">{item.jenis_zakat}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground mt-1">
                          {item.satuan === 'uang'
                            ? 'Rp ' + item.jumlah.toLocaleString()
                            : item.jumlah + ' ' + (item.unit_beras || 'kg')}
                        </p>
                      </div>
                      <button
                        onClick={() => setCart(cart.filter((c) => c.id !== item.id))}
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className={`p-4 rounded-lg border mt-2 bg-blue-50 border-blue-100`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase text-blue-600`}>Total Tagihan (IDR)</span>
                  <span className={`text-xl font-black text-blue-700`}>
                    Rp {cart.filter((c) => c.satuan === 'uang').reduce((a, b) => a + b.jumlah, 0).toLocaleString()}
                  </span>
                </div>
                {cart.some((c) => c.satuan === 'beras') && (
                  <div className={`flex items-center justify-between mt-1 pt-1 border-t border-blue-100/50`}>
                    <span className={`text-[8px] font-black uppercase text-blue-500`}>Total Beras</span>
                    <span className={`text-[10px] font-black text-blue-600`}>
                      {cart.filter((c) => c.satuan === 'beras' && c.unit_beras === 'kg').reduce((a, b) => a + b.jumlah, 0)}{' '}
                      Kg /{' '}
                      {cart
                        .filter((c) => c.satuan === 'beras' && c.unit_beras === 'liter')
                        .reduce((a, b) => a + b.jumlah, 0)}{' '}
                      L
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ZakatModal>
  );
};

export default TransactionModal;
