import React from 'react';
import { Building2, CheckSquare, Square } from 'lucide-react';
import { Transaksi } from '../types';

interface BaznasTabProps {
  transactions: Transaksi[];
  selectedForBaznas: string[];
  setSelectedForBaznas: React.Dispatch<React.SetStateAction<string[]>>;
  baznasBerasUnit: 'kg' | 'liter';
  setBaznasBerasUnit: (unit: 'kg' | 'liter') => void;
  handleBaznasSettlement: () => void;
}

const BaznasTab = ({
  transactions,
  selectedForBaznas,
  setSelectedForBaznas,
  baznasBerasUnit,
  setBaznasBerasUnit,
  handleBaznasSettlement,
}: BaznasTabProps) => {
  const selectableTxs = transactions.filter((t) => t.tipe === 'masuk' && !t.is_baznas_settled);
  const bazTxs = transactions.filter((t) => selectedForBaznas.includes(t.id));

  const zakatUang = bazTxs
    .filter((t) => t.jenis_zakat !== 'Infaq' && t.satuan === 'uang')
    .reduce((a, b) => a + Number(b.jumlah), 0);
  const zakatBerasKg = bazTxs
    .filter((t) => t.jenis_zakat !== 'Infaq' && t.satuan === 'beras' && t.unit_beras === 'kg')
    .reduce((a, b) => a + Number(b.jumlah), 0);
  const zakatBerasLiter = bazTxs
    .filter((t) => t.jenis_zakat !== 'Infaq' && t.satuan === 'beras' && t.unit_beras === 'liter')
    .reduce((a, b) => a + Number(b.jumlah), 0);

  const infaqUang = bazTxs
    .filter((t) => t.jenis_zakat === 'Infaq' && t.satuan === 'uang')
    .reduce((a, b) => a + Number(b.jumlah), 0);

  const totalZakatBerasConverted =
    baznasBerasUnit === 'kg'
      ? zakatBerasKg + zakatBerasLiter * (2.5 / 3.5)
      : zakatBerasLiter + zakatBerasKg * (3.5 / 2.5);

  const setoranZakatUang = zakatUang * 0.2;
  const setoranZakatBeras = totalZakatBerasConverted * 0.2;
  const setoranInfaqUang = infaqUang * 0.8;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[70vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-foreground flex items-center gap-3">
            <Building2 className="text-blue-500" /> Pilih Penerimaan
          </h3>
          <button
            onClick={() => setSelectedForBaznas(selectableTxs.map((t) => t.id))}
            className="text-[9px] font-black uppercase text-blue-600 hover:underline tracking-widest"
          >
            Pilih Semua
          </button>
        </div>

        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="p-6 whitespace-nowrap w-20 text-center">Pilih</th>
                <th className="p-6 whitespace-nowrap">Muzaki</th>
                <th className="p-6 whitespace-nowrap">Jenis</th>
                <th className="p-6 whitespace-nowrap text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {selectableTxs.map((t) => (
                <tr
                  key={t.id}
                  onClick={() =>
                    setSelectedForBaznas((prev) =>
                      prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                    )
                  }
                  className={`hover:bg-blue-500/5 cursor-pointer transition-colors group ${
                    selectedForBaznas.includes(t.id) ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <td className="p-6 text-center">
                    <div className="flex justify-center">
                      {selectedForBaznas.includes(t.id) ? (
                        <CheckSquare className="text-blue-500 w-6 h-6" />
                      ) : (
                        <Square className="text-white/10 w-6 h-6 hover:text-white/20 transition-colors" />
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-foreground text-sm group-hover:text-blue-500 transition-colors">
                      {t.muzaki?.nama || 'Hamba Allah'}
                    </p>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">
                      {new Date(t.waktu).toLocaleDateString('id-ID')}
                    </p>
                  </td>
                  <td className="p-6">
                    <span
                      className={`px-2 py-0.5 rounded-lg font-black text-[8px] uppercase tracking-widest leading-none bg-blue-500/10 text-blue-600`}
                    >
                      {t.jenis_zakat}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-foreground tabular-nums text-base">
                    {t.satuan === 'uang' ? `Rp ${t.jumlah.toLocaleString()}` : `${t.jumlah} ${t.unit_beras}`}
                  </td>
                </tr>
              ))}
              {selectableTxs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-20 text-center italic text-muted-foreground font-black uppercase tracking-widest opacity-20"
                  >
                    Tidak ada penerimaan baru
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-blue-600 p-12 rounded-lg text-white shadow-2xl flex flex-col justify-center relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-card/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[5px] opacity-60 mb-2">
            Estimasi Setoran Uang ke Baznas
          </p>
          <h4 className="text-5xl font-black tracking-tighter tabular-nums mb-8">
            Rp {(setoranZakatUang + setoranInfaqUang).toLocaleString()}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="p-4 bg-card/10 rounded-lg border border-white/20 hover:bg-card/20 transition-colors">
              <p className="text-[9px] font-black uppercase opacity-60 mb-1">Zakat Uang (20%)</p>
              <p className="font-black text-lg">Rp {setoranZakatUang.toLocaleString()}</p>
              <p className="text-[8px] font-bold opacity-50 mt-1 tabular-nums">Pilih: Rp {zakatUang.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-card/10 rounded-lg border border-white/20 hover:bg-card/20 transition-colors">
              <p className="text-[9px] font-black uppercase opacity-60 mb-1">Infaq Uang (80%)</p>
              <p className="font-black text-lg">Rp {setoranInfaqUang.toLocaleString()}</p>
              <p className="text-[8px] font-bold opacity-50 mt-1 tabular-nums">Pilih: Rp {infaqUang.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-card/10 rounded-lg border border-white/20 hover:bg-card/20 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-black uppercase opacity-60">Zakat Beras (20%)</p>
                <div className="flex bg-card/20 rounded-lg p-0.5">
                  <button
                    onClick={() => setBaznasBerasUnit('kg')}
                    className={`px-2 py-0.5 text-[8px] font-black rounded-md transition-all ${
                      baznasBerasUnit === 'kg' ? 'bg-card text-blue-600' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    KG
                  </button>
                  <button
                    onClick={() => setBaznasBerasUnit('liter')}
                    className={`px-2 py-0.5 text-[8px] font-black rounded-md transition-all ${
                      baznasBerasUnit === 'liter' ? 'bg-card text-blue-600' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>
              <p className="font-black text-lg">
                {setoranZakatBeras.toFixed(2)} {baznasBerasUnit}
              </p>
              <p className="text-[8px] font-bold opacity-50 mt-auto tabular-nums">
                Total Terpilih: {totalZakatBerasConverted.toFixed(2)} {baznasBerasUnit}
              </p>
            </div>
          </div>
          <button
            onClick={handleBaznasSettlement}
            disabled={selectedForBaznas.length === 0}
            className="w-full py-5 bg-card text-blue-600 rounded-lg font-black uppercase tracking-[4px] text-xs shadow-xl disabled:opacity-50 hover:-translate-y-1 transition-all hover:shadow-2xl"
          >
            Kirim Laporan & Setor Baznas
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaznasTab;
