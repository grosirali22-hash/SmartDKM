import React from 'react';
import { Settings as SettingsIcon, Calculator } from 'lucide-react';

interface SettingsTabProps {
  settings: {
    fitrah_uang: number;
    fitrah_beras_kg: number;
    fitrah_beras_liter: number;
    infaq_uang: number;
    harga_beras_per_kg: number;
    nisab_maal_idr: number;
  };
  setSettings: (settings: any) => void;
  saveZakatSettings: () => void;
}

const SettingsTab = ({ settings, setSettings, saveZakatSettings }: SettingsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-card p-8 rounded-lg border border-border shadow-sm space-y-8">
        <h3 className="text-xl font-black flex items-center gap-3">
          <SettingsIcon className="text-muted-foreground" /> Standar Zakat Fitrah & Infaq
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">
              Ketentuan Fitrah (Uang)
            </label>
            <input
              type="number"
              value={settings.fitrah_uang}
              onChange={(e) => setSettings({ ...settings, fitrah_uang: Number(e.target.value) })}
              className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">
                Fitrah Beras (KG)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.fitrah_beras_kg}
                onChange={(e) => setSettings({ ...settings, fitrah_beras_kg: Number(e.target.value) })}
                className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-foreground"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">
                Fitrah Beras (Liter)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.fitrah_beras_liter}
                onChange={(e) => setSettings({ ...settings, fitrah_beras_liter: Number(e.target.value) })}
                className="w-full p-4 bg-muted border border-border rounded-lg font-bold text-foreground"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">
              Nominal Default Infaq Uang
            </label>
            <input
              type="number"
              value={settings.infaq_uang}
              onChange={(e) => setSettings({ ...settings, infaq_uang: Number(e.target.value) })}
              className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-lg font-bold text-blue-700"
            />
          </div>
          <p className="text-[8px] font-black uppercase text-muted-foreground pt-2 leading-loose">
            Nilai-nilai ini akan otomatis terisi saat penginputan Form Transaksi Zakat/Infaq untuk mempercepat pelayanan
            amil.
          </p>
        </div>
      </div>

      <div className="bg-card p-8 rounded-lg border border-border shadow-sm space-y-8">
        <h3 className="text-xl font-black flex items-center gap-3">
          <Calculator className="text-muted-foreground" /> Standar Aturan Kalkulator
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">
              Harga Beras Pasar / Kg
            </label>
            <input
              type="number"
              value={settings.harga_beras_per_kg}
              onChange={(e) => setSettings({ ...settings, harga_beras_per_kg: Number(e.target.value) })}
              className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-lg font-bold text-blue-700"
            />
            <p className="text-[9px] font-bold text-muted-foreground mt-2">
              Digunakan di Kalkulator Zakat Fitrah & Fidyah
            </p>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">
              Batas Nisab Harta (IDR)
            </label>
            <input
              type="number"
              value={settings.nisab_maal_idr}
              onChange={(e) => setSettings({ ...settings, nisab_maal_idr: Number(e.target.value) })}
              className="w-full p-4 bg-yellow-50/50 border border-yellow-100 rounded-lg font-bold text-yellow-700"
            />
            <p className="text-[9px] font-bold text-muted-foreground mt-2">
              Batas harta wajar untuk kewajiban Zakat Maal
            </p>
          </div>
        </div>

        <button
          onClick={saveZakatSettings}
          className="w-full py-5 mt-4 bg-slate-900 text-white rounded-lg font-black uppercase tracking-[4px] text-xs hover:-translate-y-1 shadow-xl hover:shadow-slate-300 transition-all"
        >
          Simpan Seluruh Pengaturan
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
