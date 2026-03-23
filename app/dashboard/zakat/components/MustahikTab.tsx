import React from 'react';
import { Plus, FileDown, FileUp, Download } from 'lucide-react';
import NexusDataTable from '../../../components/ui/NexusDataTable';
import { Mustahik, Muzaki } from '../types';
import ZakatModal from './ZakatModal';
import { supabase } from '../../../lib/supabase';

interface MustahikTabProps {
  mustahik: Mustahik[];
  fetchData: () => void;
  showAddMustahik: boolean;
  setShowAddMustahik: (show: boolean) => void;
  formMustahik: { nama: string; asnaf: string; alamat: string; keterangan: string };
  setFormMustahik: (form: any) => void;
  saveMustahik: () => void;
  handleExportMustahik: () => void;
  handleImportMustahik: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadTemplateMustahik: () => void;
  filterAsnaf: string;
  setFilterAsnaf: (asnaf: string) => void;
  ASNAF_OPTIONS: string[];
  selectedMustahik: string[];
  setSelectedMustahik: React.Dispatch<React.SetStateAction<string[]>>;
  mustahikTotals: { idr: number; kg: number; liter: number };
  muzaki: Muzaki[];
}

const MustahikTab = ({
  mustahik,
  fetchData,
  showAddMustahik,
  setShowAddMustahik,
  formMustahik,
  setFormMustahik,
  saveMustahik,
  handleExportMustahik,
  handleImportMustahik,
  handleDownloadTemplateMustahik,
  filterAsnaf,
  setFilterAsnaf,
  ASNAF_OPTIONS,
  selectedMustahik,
  setSelectedMustahik,
  mustahikTotals,
  muzaki,
}: MustahikTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddMustahik(true)}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all"
          >
            Tambah Penerima
          </button>
          <button
            onClick={handleExportMustahik}
            className="flex items-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
          >
            <FileDown className="w-4 h-4 text-blue-500" /> Export XLS
          </button>
          <label className="flex items-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all cursor-pointer">
            <FileUp className="w-4 h-4 text-blue-500" /> Import XLS
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportMustahik} />
          </label>
          <select
            value={filterAsnaf}
            onChange={(e) => setFilterAsnaf(e.target.value)}
            className="px-4 py-[1.125rem] bg-card border border-border text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
          >
            <option value="Semua">Semua Asnaf</option>
            {ASNAF_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            onClick={handleDownloadTemplateMustahik}
            className="text-[10px] font-bold text-muted-foreground hover:text-blue-500 underline underline-offset-4 flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Template Import
          </button>
        </div>
      </div>

      <NexusDataTable<Mustahik>
        title="Daftar Mustahik"
        data={filterAsnaf === 'Semua' ? mustahik : mustahik.filter((m) => m.asnaf === filterAsnaf)}
        itemsPerPage={10}
        onEdit={(m) => {
          setFormMustahik({
            nama: m.nama,
            asnaf: m.asnaf,
            alamat: m.alamat || '',
            keterangan: m.keterangan || '',
          });
          setShowAddMustahik(true);
        }}
        onDelete={async (m) => {
          if (confirm('Hapus mustahik ini?')) {
            await supabase.from('zakat_mustahik').delete().eq('id', String(m.id));
            fetchData();
          }
        }}
        columns={[
          {
            header: 'Pilih',
            width: '40px',
            accessor: (m) => (
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                checked={selectedMustahik.includes(String(m.id))}
                onChange={() =>
                  setSelectedMustahik((prev) =>
                    prev.includes(String(m.id))
                      ? prev.filter((id) => id !== String(m.id))
                      : [...prev, String(m.id)]
                  )
                }
              />
            ),
          },
          { header: 'Nama Mustahik', accessor: 'nama', sortable: true },
          {
            header: 'Asnaf',
            width: '100px',
            accessor: (m) => (
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-lg font-black text-[8px] uppercase tracking-widest leading-none">
                {m.asnaf}
              </span>
            ),
          },
          {
            header: 'Alamat Detail',
            accessor: (m) => <span className="text-[10px] opacity-60 italic">{m.alamat || '-'}</span>,
          },
          {
            header: 'IDR',
            accessor: (m) => <span className="text-xs font-black text-rose-500">Rp {m.total_terima_idr.toLocaleString()}</span>,
            className: 'text-right',
            width: '120px',
          },
          {
            header: 'Beras',
            accessor: (m) => (
              <span className="text-[10px] font-bold opacity-40">
                {m.total_terima_beras_kg || 0}kg / {m.total_terima_beras_liter || 0}L
              </span>
            ),
            className: 'text-right',
            width: '100px',
          },
        ]}
      />

      <div className="bg-slate-900/5 backdrop-blur-md border border-slate-900/10 rounded-xl p-8 space-y-6 mt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900/5 pb-6">
          <div className="flex flex-col">
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Penyaluran</p>
            <h4 className="text-2xl font-black text-rose-600">Rp {mustahikTotals.idr.toLocaleString()}</h4>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Beras (KG)</p>
              <p className="text-lg font-black">{mustahikTotals.kg.toLocaleString()} kg</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Beras (Liter)</p>
              <p className="text-lg font-black">{mustahikTotals.liter.toLocaleString()} L</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {ASNAF_OPTIONS.map((asnaf) => {
            const filtered = mustahik.filter((m) => m.asnaf === asnaf);
            const idr = filtered.reduce((a, b) => a + Number(b.total_terima_idr), 0);
            const kg = filtered.reduce((a, b) => a + Number(b.total_terima_beras_kg), 0);
            const liter = filtered.reduce((a, b) => a + Number(b.total_terima_beras_liter), 0);
            if (idr === 0 && kg === 0 && liter === 0) return null;
            return (
              <div
                key={asnaf}
                className="px-4 py-2 bg-white/40 border border-white/20 rounded-lg flex items-center gap-4"
              >
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{asnaf}</span>
                <span className="text-[10px] font-black text-rose-500">Rp {idr.toLocaleString()}</span>
                <span className="text-[9px] font-bold text-muted-foreground">
                  {kg}kg / {liter}L
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showAddMustahik && (
        <ZakatModal title="Penerima Baru" onClose={() => setShowAddMustahik(false)} onSave={saveMustahik} saveLabel="Simpan Penerima">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg mb-4">
              <p className="text-[9px] font-black uppercase text-blue-600 mb-2">Pernah Menjadi Muzaki?</p>
              <select
                className="w-full p-3 bg-card border border-blue-100 rounded-lg font-bold text-xs outline-none"
                onChange={(e) => {
                  const m = muzaki.find((muz) => muz.id === e.target.value);
                  if (m) setFormMustahik({ ...formMustahik, nama: m.nama, alamat: m.alamat || '' });
                }}
                value=""
              >
                <option value="">-- Salin Data dari Muzaki --</option>
                {muzaki.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama}
                  </option>
                ))}
              </select>
            </div>
            <input
              placeholder="Nama Penerima"
              className="w-full p-5 bg-muted rounded-lg font-bold"
              value={formMustahik.nama}
              onChange={(e) => setFormMustahik({ ...formMustahik, nama: e.target.value })}
            />
            <select
              className="w-full p-5 bg-muted rounded-lg font-black uppercase text-[10px] tracking-widest text-muted-foreground"
              value={formMustahik.asnaf}
              onChange={(e) => setFormMustahik({ ...formMustahik, asnaf: e.target.value })}
            >
              {ASNAF_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Alamat"
              className="w-full p-5 bg-muted rounded-lg font-bold h-32"
              value={formMustahik.alamat}
              onChange={(e) => setFormMustahik({ ...formMustahik, alamat: e.target.value })}
            />
          </div>
        </ZakatModal>
      )}
    </div>
  );
};

export default MustahikTab;
