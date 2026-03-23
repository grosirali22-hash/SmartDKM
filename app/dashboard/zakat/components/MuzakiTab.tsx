import React from 'react';
import { Plus, FileDown, FileUp, Download } from 'lucide-react';
import NexusDataTable from '../../../components/ui/NexusDataTable';
import { Muzaki } from '../types';
import ZakatModal from './ZakatModal';
import { supabase } from '../../../lib/supabase';

interface MuzakiTabProps {
  muzaki: Muzaki[];
  fetchData: () => void;
  showAddMuzaki: boolean;
  setShowAddMuzaki: (show: boolean) => void;
  formMuzaki: { nama: string; telepon: string; alamat: string };
  setFormMuzaki: (form: any) => void;
  saveMuzaki: () => void;
  handleExportMuzaki: () => void;
  handleImportMuzaki: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadTemplateMuzaki: () => void;
  selectedMuzaki: string[];
  setSelectedMuzaki: React.Dispatch<React.SetStateAction<string[]>>;
  muzakiTotals: { idr: number; infaq: number; kg: number; liter: number };
}

const MuzakiTab = ({
  muzaki,
  fetchData,
  showAddMuzaki,
  setShowAddMuzaki,
  formMuzaki,
  setFormMuzaki,
  saveMuzaki,
  handleExportMuzaki,
  handleImportMuzaki,
  handleDownloadTemplateMuzaki,
  selectedMuzaki,
  setSelectedMuzaki,
  muzakiTotals,
}: MuzakiTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddMuzaki(true)}
            className="flex items-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" /> Tambah Muzaki
          </button>
          <button
            onClick={handleExportMuzaki}
            className="flex items-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
          >
            <FileDown className="w-4 h-4 text-blue-500" /> Export XLS
          </button>
          <label className="flex items-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all cursor-pointer">
            <FileUp className="w-4 h-4 text-blue-500" /> Import XLS
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportMuzaki} />
          </label>
          <button
            onClick={handleDownloadTemplateMuzaki}
            className="text-[10px] font-bold text-muted-foreground hover:text-blue-500 underline underline-offset-4 ml-2 flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Template Import
          </button>
        </div>
      </div>

      <NexusDataTable<Muzaki>
        title="Daftar Muzaki"
        data={muzaki}
        itemsPerPage={10}
        onEdit={(m) => {
          setFormMuzaki({ nama: m.nama, alamat: m.alamat, telepon: m.telepon });
          setShowAddMuzaki(true);
        }}
        onDelete={async (m) => {
          if (confirm('Hapus muzaki ini?')) {
            await supabase.from('zakat_muzaki').delete().eq('id', String(m.id));
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
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={selectedMuzaki.includes(String(m.id))}
                onChange={() =>
                  setSelectedMuzaki((prev) =>
                    prev.includes(String(m.id))
                      ? prev.filter((id) => id !== String(m.id))
                      : [...prev, String(m.id)]
                  )
                }
              />
            ),
          },
          { header: 'Nama Muzaki', accessor: 'nama', sortable: true },
          {
            header: 'Alamat & Kontak',
            accessor: (m) => (
              <div>
                <p className="text-[11px] font-bold">{m.alamat || '-'}</p>
                <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{m.telepon || '-'}</p>
              </div>
            ),
          },
          {
            header: 'Zakat Tunai',
            accessor: (m) => <span className="text-xs font-black">Rp {m.total_bayar_idr.toLocaleString()}</span>,
            className: 'text-right',
            width: '120px',
          },
          {
            header: 'Infaq Tunai',
            accessor: (m) => (
              <span className="text-xs font-bold opacity-60">Rp {(m.total_infaq_idr || 0).toLocaleString()}</span>
            ),
            className: 'text-right',
            width: '120px',
          },
          {
            header: 'Beras',
            accessor: (m) => (
              <span className="text-[10px] font-bold opacity-40">
                {m.total_bayar_beras_kg || 0}kg / {m.total_bayar_beras_liter || 0}L
              </span>
            ),
            className: 'text-right',
            width: '100px',
          },
        ]}
      />

      <div className="bg-blue-600/5 backdrop-blur-md border border-blue-500/10 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col">
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-2">
              Ringkasan Muzaki
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xl font-black text-blue-600">Rp {muzakiTotals.idr.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Zakat Tunai</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-teal-600">Rp {muzakiTotals.infaq.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-teal-400 uppercase tracking-widest">Infaq</span>
              </div>
            </div>
          </div>
          <div className="w-px h-12 bg-blue-500/10 hidden md:block" />
          <div className="flex flex-col">
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-2">Total Komoditas</p>
            <p className="text-xl font-black text-foreground">
              {muzakiTotals.kg}kg <span className="text-[8px] opacity-40">/</span> {muzakiTotals.liter}L
            </p>
          </div>
        </div>
      </div>

      {showAddMuzaki && (
        <ZakatModal title="Muzaki Baru" onClose={() => setShowAddMuzaki(false)} onSave={saveMuzaki} saveLabel="Simpan Muzaki">
          <div className="space-y-4">
            <input
              placeholder="Nama Lengkap"
              className="w-full p-5 bg-muted rounded-lg font-bold"
              value={formMuzaki.nama}
              onChange={(e) => setFormMuzaki({ ...formMuzaki, nama: e.target.value })}
            />
            <input
              placeholder="No Telepon / WA"
              className="w-full p-5 bg-muted rounded-lg font-bold"
              value={formMuzaki.telepon}
              onChange={(e) => setFormMuzaki({ ...formMuzaki, telepon: e.target.value })}
            />
            <textarea
              placeholder="Alamat Detail"
              className="w-full p-5 bg-muted rounded-lg font-bold h-32"
              value={formMuzaki.alamat}
              onChange={(e) => setFormMuzaki({ ...formMuzaki, alamat: e.target.value })}
            />
          </div>
        </ZakatModal>
      )}
    </div>
  );
};

export default MuzakiTab;
