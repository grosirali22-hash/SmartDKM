import React from 'react';
import { FileDown, FileUp, Download, Calendar, MapPin, Phone, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import NexusDataTable from '../../../components/ui/NexusDataTable';
import { Transaksi } from '../types';

interface TransactionsTabProps {
  type: 'masuk' | 'keluar';
  transactions: Transaksi[];
  fetchData: () => void;
  openEditTransaction: (t: Transaksi) => void;
  deleteTransaction: (id: string) => void;
  handleExportTransactions: (type: 'masuk' | 'keluar') => void;
  handleImportTransactions: (e: React.ChangeEvent<HTMLInputElement>, type: 'masuk' | 'keluar') => void;
  handleDownloadTemplateTransactions: () => void;
  penerimaanTotals?: { zakatUang: number; infaqUang: number; berasKg: number; berasLiter: number };
  penyaluranTotals?: { uang: number; berasKg: number; berasLiter: number };
}

const TransactionsTab = ({
  type,
  transactions,
  openEditTransaction,
  deleteTransaction,
  handleExportTransactions,
  handleImportTransactions,
  handleDownloadTemplateTransactions,
  penerimaanTotals,
  penyaluranTotals,
}: TransactionsTabProps) => {
  const data = transactions.filter((t) => t.tipe === type);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportTransactions(type)}
            className="flex items-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
          >
            <FileDown className="w-4 h-4 text-blue-500" /> Export XLS
          </button>
          <label className="flex items-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all cursor-pointer">
            <FileUp className="w-4 h-4 text-blue-500" /> Import XLS
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={(e) => handleImportTransactions(e, type)}
            />
          </label>
          <button
            onClick={handleDownloadTemplateTransactions}
            className="text-[10px] font-bold text-muted-foreground hover:text-blue-500 underline underline-offset-4 ml-2 flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Template Import
          </button>
        </div>
      </div>

      <NexusDataTable<Transaksi>
        title={type === 'masuk' ? 'Riwayat Penerimaan' : 'Riwayat Penyaluran'}
        data={data}
        itemsPerPage={10}
        onEdit={openEditTransaction}
        onDelete={(t) => deleteTransaction(String(t.id))}
        columns={[
          {
            header: 'Waktu',
            width: '100px',
            accessor: (t) => (
              <div>
                <p className="text-[11px] font-bold">{new Date(t.waktu).toLocaleDateString('id-ID')}</p>
                <p className="text-[9px] opacity-40">
                  {new Date(t.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ),
            sortable: true,
          },
          {
            header: type === 'masuk' ? 'Muzaki' : 'Mustahik',
            accessor: (t) => (
              <div>
                <p className="font-black text-xs">
                  {type === 'masuk' ? t.muzaki?.nama || 'Hamba Allah' : t.mustahik?.nama || '-'}
                </p>
                <p className="text-[9px] opacity-40 truncate">
                  {type === 'masuk' ? t.muzaki?.alamat || '-' : t.mustahik?.asnaf || '-'}
                </p>
              </div>
            ),
          },
          {
            header: 'Jenis',
            width: '80px',
            accessor: (t) => (
              <span
                className={`px-2 py-0.5 rounded-lg font-black text-[8px] uppercase tracking-widest ${
                  type === 'masuk' ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'
                }`}
              >
                {t.jenis_zakat}
              </span>
            ),
          },
          {
            header: 'Jumlah',
            width: '120px',
            accessor: (t) => (
              <span className={`font-black tabular-nums text-xs ${type === 'masuk' ? 'text-blue-600' : 'text-rose-500'}`}>
                {t.satuan === 'uang' ? `Rp ${t.jumlah.toLocaleString()}` : `${t.jumlah} ${t.unit_beras}`}
              </span>
            ),
            className: 'text-right',
          },
          {
            header: 'Status',
            width: '80px',
            accessor: (t) => (
              <div className="flex justify-center">
                {t.is_baznas_settled ? (
                  <span className="text-[8px] font-black text-blue-500 flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" /> SETOR
                  </span>
                ) : (
                  <span className="text-[8px] font-black text-slate-300 px-1.5 py-0.5 bg-slate-50 rounded-full italic">
                    WAIT
                  </span>
                )}
              </div>
            ),
            className: 'text-center',
          },
        ]}
      />

      {type === 'masuk' && penerimaanTotals && (
        <div className="bg-blue-600/5 backdrop-blur-md border border-blue-500/10 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col">
              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-2">
                Total Penerimaan (Ringkasan)
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-blue-600">
                    Rp {penerimaanTotals.zakatUang.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Total Zakat</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-blue-600">
                    Rp {penerimaanTotals.infaqUang.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Total Infaq</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-muted-foreground">
                    {penerimaanTotals.berasKg}kg / {penerimaanTotals.berasLiter}L
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total Beras
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'keluar' && penyaluranTotals && (
        <div className="bg-rose-600/5 backdrop-blur-md border border-rose-500/10 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col">
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-2">
              Total Penyaluran (Ringkasan)
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xl font-black text-rose-600">Rp {penyaluranTotals.uang.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">Total Tunai</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-muted-foreground">
                  {penyaluranTotals.berasKg}kg / {penyaluranTotals.berasLiter}L
                </span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total Beras</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;
