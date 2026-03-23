import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Building2, Layers } from 'lucide-react';
import ZakatModal from './ZakatModal';

interface ReportsTabProps {
  moneyStats: {
    totalMasuk: number;
    totalKeluar: number;
    outMustahik: number;
    outBaznas: number;
    outWithdraw: number;
    saldo: number;
  };
  riceStats: { stockKg: number };
  chartStats: {
    txInqThisYear: number;
    txInqLastYear: number;
    txOutThisYear: number;
    txOutLastYear: number;
    maxVal: number;
  };
  lastYear: number;
  currentYear: number;
  setShowWithdrawModal: (show: boolean) => void;
  showWithdrawModal: boolean;
  formWithdraw: { sumber_dana: string; dompet_id: string; nominal: number; keterangan: string };
  setFormWithdraw: (form: any) => void;
  dompets: any[];
  handleWithdraw: () => void;
}

const ReportsTab = ({
  moneyStats,
  riceStats,
  chartStats,
  lastYear,
  currentYear,
  setShowWithdrawModal,
  showWithdrawModal,
  formWithdraw,
  setFormWithdraw,
  dompets,
  handleWithdraw,
}: ReportsTabProps) => {
  const getHeight = (val: number) => `${Math.max((val / chartStats.maxVal) * 100, 2)}%`;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tighter">Ringkasan Arus Kas Zakat</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Breakdown Pendapatan & Pengeluaran Digital
          </p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:-translate-y-1 transition-all"
        >
          <Wallet className="w-5 h-5" /> Tarik ke Kas Masjid
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500 p-8 rounded-xl text-white shadow-xl shadow-blue-100 flex flex-col justify-between h-44">
          <div className="flex justify-between items-start">
            <div className="bg-white/20 p-2 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Total Pendapatan</span>
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Penerimaan (Masuk)</p>
            <h4 className="text-3xl font-black tracking-tighter">Rp {moneyStats.totalMasuk.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-card p-8 rounded-xl border border-border flex flex-col justify-between h-44 group hover:border-blue-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-rose-50 text-rose-500 p-2 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              Local Distribution
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Penyaluran Mustahik</p>
            <h4 className="text-2xl font-black text-rose-500 tracking-tighter">
              Rp {moneyStats.outMustahik.toLocaleString()}
            </h4>
          </div>
        </div>

        <div className="bg-card p-8 rounded-xl border border-border flex flex-col justify-between h-44 group hover:border-blue-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-blue-50 text-blue-500 p-2 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              External Settlement
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Setoran BAZNAS (20%)</p>
            <h4 className="text-2xl font-black text-blue-600 tracking-tighter">
              Rp {moneyStats.outBaznas.toLocaleString()}
            </h4>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-xl text-white flex flex-col justify-between h-44 shadow-xl shadow-slate-200">
          <div className="flex justify-between items-start">
            <div className="bg-white/10 p-2 rounded-lg text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Internal Transfer</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Withdraw ke Kas Masjid</p>
            <h4 className="text-2xl font-black text-white tracking-tighter">
              Rp {moneyStats.outWithdraw.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card p-8 rounded-xl border-2 border-dashed border-blue-100 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
              Rp {moneyStats.saldo.toLocaleString()}
            </h4>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px]">
              Sisa Saldo Kas Zakat Berjalan
            </p>
          </div>
          <div className="text-right space-y-2 opacity-60">
            <p className="text-[9px] font-bold">
              Inbound: <span className="text-blue-600">+Rp {moneyStats.totalMasuk.toLocaleString()}</span>
            </p>
            <p className="text-[9px] font-bold">
              Outbound: <span className="text-rose-500">-Rp {moneyStats.totalKeluar.toLocaleString()}</span>
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-8 rounded-xl border border-blue-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-[10px] font-black text-white">
              i
            </div>
            <p className="text-[9px] font-black uppercase text-blue-900 tracking-widest leading-none">
              Stok Beras Saat Ini
            </p>
          </div>
          <h4 className="text-2xl font-black text-slate-900 tracking-tighter">
            {riceStats.stockKg} <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">kg Net</span>
          </h4>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h3 className="font-black text-foreground tracking-tighter text-xl mb-8 flex items-center gap-3">
          <Layers className="text-blue-500" /> Perbandingan Tahunan ({lastYear} vs {currentYear})
        </h3>
        <div className="flex h-64 items-end gap-12 justify-center px-4">
          <div className="flex flex-col items-center gap-4 group">
            <div
              className="w-16 md:w-20 bg-blue-100 rounded-t-lg relative transition-all group-hover:bg-blue-200 flex items-end justify-center pb-2 cursor-pointer"
              style={{ height: getHeight(chartStats.txInqLastYear) }}
            >
              <span className="text-[8px] font-black text-blue-600 absolute -top-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all">
                Rp {chartStats.txInqLastYear.toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] font-black text-muted-foreground whitespace-nowrap">Masuk {lastYear}</p>
          </div>

          <div className="flex flex-col items-center gap-4 group">
            <div
              className="w-16 md:w-20 bg-blue-500 rounded-t-lg relative shadow-lg shadow-blue-200 transition-all group-hover:-translate-y-2 flex items-end justify-center pb-2 cursor-pointer"
              style={{ height: getHeight(chartStats.txInqThisYear) }}
            >
              <span className="text-[8px] font-black text-blue-700 absolute -top-6 whitespace-nowrap">
                Rp {chartStats.txInqThisYear.toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] font-black text-blue-600 whitespace-nowrap">Masuk {currentYear}</p>
          </div>

          <div className="w-px h-full bg-secondary mx-1 md:mx-4" />

          <div className="flex flex-col items-center gap-4 group">
            <div
              className="w-16 md:w-20 bg-rose-100 rounded-t-lg relative transition-all group-hover:bg-rose-200 flex items-end justify-center pb-2 cursor-pointer"
              style={{ height: getHeight(chartStats.txOutLastYear) }}
            >
              <span className="text-[8px] font-black text-rose-600 absolute -top-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all">
                Rp {chartStats.txOutLastYear.toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] font-black text-muted-foreground whitespace-nowrap">Keluar {lastYear}</p>
          </div>

          <div className="flex flex-col items-center gap-4 group">
            <div
              className="w-16 md:w-20 bg-rose-500 rounded-t-lg relative shadow-lg shadow-rose-200 transition-all group-hover:-translate-y-2 flex items-end justify-center pb-2 cursor-pointer"
              style={{ height: getHeight(chartStats.txOutThisYear) }}
            >
              <span className="text-[8px] font-black text-rose-700 absolute -top-6 whitespace-nowrap">
                Rp {chartStats.txOutThisYear.toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] font-black text-rose-600 whitespace-nowrap">Keluar {currentYear}</p>
          </div>
        </div>
      </div>

      {showWithdrawModal && (
        <ZakatModal
          title="Withdraw Dana Zakat/Infaq ke Kas Masjid"
          onClose={() => setShowWithdrawModal(false)}
          onSave={handleWithdraw}
          saveLabel="Proses Withdraw"
        >
          <div className="space-y-6">
            <div className="p-5 bg-blue-50/50 rounded-lg border border-blue-100">
              <p className="text-xs font-black text-blue-800 leading-relaxed tracking-wide">
                Fitur ini akan memotong Saldo Penerimaan di Zakat/UPZ Anda dan memasukkannya otomatis ke dalam buku Kas
                Utama Masjid.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Sumber Dana Khusus</p>
              <select
                className="w-full p-5 bg-muted rounded-lg font-black uppercase text-[10px] tracking-widest text-muted-foreground cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                value={formWithdraw.sumber_dana}
                onChange={(e) => setFormWithdraw({ ...formWithdraw, sumber_dana: e.target.value })}
              >
                <option value="Infaq">Infaq & Shadaqah (Bebas)</option>
                <option value="Amil">Bagian Amil (UPZ)</option>
                <option value="Fisabilillah">Fisabilillah</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Transfer ke Dompet Masjid</p>
              <select
                className="w-full p-5 bg-muted rounded-lg font-black uppercase text-[10px] tracking-widest text-muted-foreground cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                value={formWithdraw.dompet_id}
                onChange={(e) => setFormWithdraw({ ...formWithdraw, dompet_id: e.target.value })}
              >
                <option value="" disabled>
                  -- Pilih Dompet Tujuan --
                </option>
                {dompets.length === 0 ? (
                  <option value="" disabled>
                    (Belum Ada Dompet di Kas Masjid)
                  </option>
                ) : (
                  dompets.map((d) => (
                    <option key={d.id} value={d.id}>
                      DOMPET {d.nama}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nominal Withdraw (Rp)</p>
              <input
                type="number"
                min="0"
                placeholder="Rp 0"
                className="w-full p-8 bg-muted rounded-lg font-black text-3xl text-foreground border-2 border-transparent focus:border-blue-500 transition-all outline-none"
                value={formWithdraw.nominal || ''}
                onChange={(e) => setFormWithdraw({ ...formWithdraw, nominal: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Catatan Tambahan (Boleh Kosong)</p>
              <input
                placeholder="Contoh: Operasional DKM bulan ini..."
                className="w-full p-5 bg-muted rounded-lg font-bold border-2 border-transparent focus:border-blue-500 transition-all outline-none text-foreground"
                value={formWithdraw.keterangan}
                onChange={(e) => setFormWithdraw({ ...formWithdraw, keterangan: e.target.value })}
              />
            </div>
          </div>
        </ZakatModal>
      )}
    </div>
  );
};

export default ReportsTab;
