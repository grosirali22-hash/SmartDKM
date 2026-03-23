import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, Briefcase, Landmark, User, Coins, CheckCircle2 } from 'lucide-react';

export default function CalculatorView({ settings }: { settings: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'fitrah' | 'penghasilan' | 'maal' | 'fidyah'>('fitrah');

  // --- Fitrah State ---
  const [personCount, setPersonCount] = useState(1);
  const [unitType, setUnitType] = useState<'kg' | 'liter'>('kg');
  const [customPrice, setCustomPrice] = useState(settings?.harga_beras_per_kg || 15000);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const calcBeras = personCount * (unitType === 'kg' ? 2.5 : 3.5);
  const calcUang = calcBeras * (isCustomMode ? customPrice : (settings?.harga_beras_per_kg || 15000));

  // --- Fidyah State ---
  const [hariFidyah, setHariFidyah] = useState(1);
  const [hargaFidyah, setHargaFidyah] = useState(60000); // Default BAZNAS DKI Jakarta (bisa diubah)
  
  const fidyahBerasKg = hariFidyah * 0.6;
  const fidyahUang = hariFidyah * hargaFidyah;

  // --- Penghasilan State ---
  const [gaji, setGaji] = useState<number | ''>('');
  const [pendapatanLain, setPendapatanLain] = useState<number | ''>('');
  const [hutang, setHutang] = useState<number | ''>('');
  const [hargaEmas, setHargaEmas] = useState<number | ''>(1200000); // Default common gold price

  const totalPenghasilanPokok = (Number(gaji) || 0) + (Number(pendapatanLain) || 0);
  const penghasilanBersih = totalPenghasilanPokok - (Number(hutang) || 0);
  const nisabPenghasilanBulan = (85 * (Number(hargaEmas) || 0)) / 12; // 85 gram emas per tahun / 12 bulan
  const isWajibZakatPenghasilan = penghasilanBersih >= nisabPenghasilanBulan;
  const zakatPenghasilan = isWajibZakatPenghasilan ? penghasilanBersih * 0.025 : 0;

  // --- Maal State ---
  const [tabungan, setTabungan] = useState<number | ''>('');
  const [logamMulia, setLogamMulia] = useState<number | ''>('');
  const [saham, setSaham] = useState<number | ''>('');
  const [properti, setProperti] = useState<number | ''>('');
  const [hutangMaal, setHutangMaal] = useState<number | ''>('');

  const totalHarta = (Number(tabungan) || 0) + (Number(logamMulia) || 0) + (Number(saham) || 0) + (Number(properti) || 0);
  const hartaBersih = totalHarta - (Number(hutangMaal) || 0);
  const nisabMaalTahunan = 85 * (Number(hargaEmas) || 0);
  const isWajibZakatMaal = hartaBersih >= nisabMaalTahunan;
  const zakatMaal = isWajibZakatMaal ? hartaBersih * 0.025 : 0;

  // Format IDR Helper
  const formatIDR = (num: number) => `Rp ${Math.round(num).toLocaleString('id-ID')}`;

  return (
    <div className="space-y-8">
       {/* Sub-Tabs */}
       <div className="flex gap-4 border-b border-border overflow-x-auto scrollbar-hide no-scrollbar">
          <button onClick={() => setActiveSubTab('fitrah')} className={`pb-4 px-2 font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'fitrah' ? 'text-blue-500 border-b-4 border-blue-500' : 'text-muted-foreground hover:text-muted-foreground'}`}><User className="inline w-4 h-4 mr-2" />Zakat Fitrah</button>
          <button onClick={() => setActiveSubTab('penghasilan')} className={`pb-4 px-2 font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'penghasilan' ? 'text-blue-500 border-b-4 border-blue-500' : 'text-muted-foreground hover:text-muted-foreground'}`}><Briefcase className="inline w-4 h-4 mr-2" />Zakat Penghasilan</button>
          <button onClick={() => setActiveSubTab('fidyah')} className={`pb-4 px-2 font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'fidyah' ? 'text-rose-500 border-b-4 border-rose-500' : 'text-muted-foreground hover:text-muted-foreground'}`}><Calculator className="inline w-4 h-4 mr-2" />Bayar Fidyah</button>
          <button onClick={() => setActiveSubTab('maal')} className={`pb-4 px-2 font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'maal' ? 'text-yellow-500 border-b-4 border-yellow-500' : 'text-muted-foreground hover:text-muted-foreground'}`}><Landmark className="inline w-4 h-4 mr-2" />Zakat Maal</button>
       </div>

       {activeSubTab === 'fitrah' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
            {/* ... Existing Fitrah UI ... */}
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm space-y-8">
               <h3 className="text-xl font-black flex items-center gap-3"><Calculator className="text-blue-500" /> Kalkulator Fitrah</h3>
               <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block">Jumlah Jiwa</label>
                  <input type="number" value={personCount} onChange={e => setPersonCount(Number(e.target.value))} className="w-full p-4 bg-muted rounded-lg font-black text-2xl" min="1" />
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setUnitType('kg')} className={`flex-1 py-3 rounded-lg font-bold text-[10px] uppercase transition-all ${unitType === 'kg' ? 'bg-slate-900 text-white' : 'bg-muted text-muted-foreground'}`}>Kilo (2.5)</button>
                  <button onClick={() => setUnitType('liter')} className={`flex-1 py-3 rounded-lg font-bold text-[10px] uppercase transition-all ${unitType === 'liter' ? 'bg-slate-900 text-white' : 'bg-muted text-muted-foreground'}`}>Liter (3.5)</button>
               </div>
               <div className="h-px bg-muted" />
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Harga Per Unit Dasar</span>
                  <button onClick={() => setIsCustomMode(!isCustomMode)} className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${isCustomMode ? 'bg-blue-50 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>Ubah Sendiri?</button>
               </div>
               {isCustomMode && <input type="number" value={customPrice} onChange={e => setCustomPrice(Number(e.target.value))} className="w-full p-4 bg-blue-50 border border-blue-100 rounded-lg font-bold text-blue-900" />}
               {!isCustomMode && <div className="w-full p-4 bg-muted rounded-lg font-bold text-muted-foreground">{formatIDR(settings?.harga_beras_per_kg || 15000)} / kg</div>}
            </div>

            <div className="bg-blue-600 p-10 rounded-lg text-white shadow-xl flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-card/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
               <p className="text-[10px] font-black uppercase tracking-[4px] opacity-60 mb-8">Kewajiban Zakat</p>
               <div className="space-y-8 relative z-10">
                  <div><h4 className="text-6xl font-black leading-none">{calcBeras} <span className="text-xl opacity-40 font-bold">{unitType}</span></h4><p className="text-xs font-bold opacity-60 mt-2">Beras / Makanan Pokok</p></div>
                  <div className="h-px bg-card/20" />
                  <div><h4 className="text-4xl font-black leading-none tabular-nums">{formatIDR(calcUang)}</h4><p className="text-xs font-bold opacity-60 mt-2">Setara Uang Tunai</p></div>
               </div>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border shadow-sm flex flex-col">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3"><RefreshCw className="text-blue-500 w-5 h-5" /> Unit Converter</h3>
               <div className="space-y-4 flex-1">
                  <div className="p-4 bg-muted rounded-lg border border-border">
                     <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">1 KG Beras =</p>
                     <p className="text-xl font-black">1.4 <span className="text-sm opacity-40 font-bold text-muted-foreground underline underline-offset-4 decoration-blue-500">Liter</span></p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                     <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">1 Liter Beras =</p>
                     <p className="text-xl font-black">0.71 <span className="text-sm opacity-40 font-bold text-muted-foreground underline underline-offset-4 decoration-blue-500">KG</span></p>
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 mt-auto">
                     <p className="text-[8px] font-black uppercase text-blue-400 leading-relaxed">* Estimasi umum: 1kg beras berkisar antara 1.25 - 1.45 liter tergantung densitas.</p>
                  </div>
               </div>
            </div>
         </div>
       )}

       {activeSubTab === 'penghasilan' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm space-y-6">
               <h3 className="text-xl font-black flex items-center gap-3"><Briefcase className="text-blue-500" /> Zakat Penghasilan (Bulanan)</h3>
               
               <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Penghasilan / Gaji Pokok (Bulan Ini)</label>
                    <input type="number" value={gaji} onChange={e => setGaji(Number(e.target.value))} placeholder="Rp 0" className="w-full p-4 bg-muted rounded-lg font-black text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Penghasilan Lain / Bonus / THR</label>
                    <input type="number" value={pendapatanLain} onChange={e => setPendapatanLain(Number(e.target.value))} placeholder="Rp 0" className="w-full p-4 bg-muted rounded-lg font-black text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Hutang Jatuh Tempo / Cicilan (Pengecualian)</label>
                    <input type="number" value={hutang} onChange={e => setHutang(Number(e.target.value))} placeholder="Rp 0 (Opsional)" className="w-full p-4 bg-muted rounded-lg font-bold text-lg text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" />
                 </div>
                 <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <label className="text-[10px] font-black uppercase text-amber-600 mb-2 block">Harga Emas Saat Ini (Per Gram)</label>
                    <input type="number" value={hargaEmas} onChange={e => setHargaEmas(Number(e.target.value))} placeholder="Rp 1.200.000" className="w-full p-3 bg-card rounded-lg font-bold text-md text-foreground border border-amber-200" />
                 </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-blue-600 p-10 rounded-lg text-white shadow-xl flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-card/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                  <p className="text-[10px] font-black uppercase tracking-[4px] opacity-60 mb-2">Total Zakat Penghasilan</p>
                  
                  {isWajibZakatPenghasilan ? (
                    <div className="space-y-6 relative z-10">
                       <h4 className="text-5xl lg:text-6xl font-black leading-none tabular-nums">{formatIDR(zakatPenghasilan)}</h4>
                       <div className="p-3 bg-card/20 rounded-lg inline-block">
                         <p className="text-xs font-bold text-white"><CheckCircle2 className="w-4 h-4 inline mr-1" /> Wajib Zakat (Melampaui Nisab)</p>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10">
                       <h4 className="text-5xl lg:text-6xl font-black leading-none tabular-nums text-white/50">Rp 0</h4>
                       <div className="p-3 bg-amber-500/80 rounded-lg inline-block">
                         <p className="text-xs font-bold text-white">Belum Wajib Zakat (Di bawah Nisab)</p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-6 rounded-lg border border-border">
                     <p className="text-[10px] font-black uppercase text-muted-foreground">Total Penghasilan Bersih</p>
                     <p className="text-xl font-black text-foreground mt-1">{formatIDR(penghasilanBersih)}</p>
                  </div>
                  <div className="bg-muted p-6 rounded-lg border border-border">
                     <p className="text-[10px] font-black uppercase text-muted-foreground">Nisab / Bulan (Aturan BAZNAS)</p>
                     <p className="text-xl font-black text-blue-600 mt-1">{formatIDR(nisabPenghasilanBulan)}</p>
                     <p className="text-[9px] font-bold text-muted-foreground mt-1">Setara 85gr Emas per tahun</p>
                  </div>
               </div>
            </div>
         </div>
       )}

       {activeSubTab === 'maal' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm space-y-6">
               <h3 className="text-xl font-black flex items-center gap-3"><Landmark className="text-yellow-500" /> Zakat Maal (Tabungan & Harta)</h3>
               <p className="text-xs text-muted-foreground font-bold mb-4">Harta yang telah dimiliki selama satu tahun (Haul) dan mencapai Nisab.</p>

               <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Saldo Tabungan / Deposito (Satu Tahun)</label>
                    <input type="number" value={tabungan} onChange={e => setTabungan(Number(e.target.value))} placeholder="Rp 0" className="w-full p-4 bg-muted rounded-lg font-black text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Nilai Logam Mulia / Perhiasan Emas</label>
                    <input type="number" value={logamMulia} onChange={e => setLogamMulia(Number(e.target.value))} placeholder="Rp 0" className="w-full p-4 bg-muted rounded-lg font-black text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Investasi Saham / Reksadana / Aset Lancar</label>
                    <input type="number" value={saham} onChange={e => setSaham(Number(e.target.value))} placeholder="Rp 0" className="w-full p-4 bg-muted rounded-lg font-black text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Properti / Kendaraan Sewa (Hanya Nilai Sewanya)</label>
                    <input type="number" value={properti} onChange={e => setProperti(Number(e.target.value))} placeholder="Rp 0" className="w-full p-4 bg-muted rounded-lg font-black text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all" />
                 </div>
                 <div className="h-px bg-secondary my-4" />
                 <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Hutang Jatuh Tempo (Mengurangi Harta)</label>
                    <input type="number" value={hutangMaal} onChange={e => setHutangMaal(Number(e.target.value))} placeholder="Rp 0 (Opsional)" className="w-full p-4 bg-muted rounded-lg font-bold text-lg text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" />
                 </div>
                 <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mt-2">
                    <label className="text-[10px] font-black uppercase text-amber-600 mb-2 block">Harga Emas Saat Ini (Per Gram)</label>
                    <input type="number" value={hargaEmas} onChange={e => setHargaEmas(Number(e.target.value))} placeholder="Rp 1.200.000" className="w-full p-3 bg-card rounded-lg font-bold text-md text-foreground border border-amber-200" />
                 </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-yellow-500 p-10 rounded-lg text-white shadow-xl flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-card/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                  <p className="text-[10px] font-black uppercase tracking-[4px] opacity-70 mb-2 text-yellow-900">Total Zakat Maal (2.5%)</p>
                  
                  {isWajibZakatMaal ? (
                    <div className="space-y-6 relative z-10">
                       <h4 className="text-5xl lg:text-6xl font-black leading-none tabular-nums text-white drop-shadow-sm">{formatIDR(zakatMaal)}</h4>
                       <div className="p-3 bg-yellow-600/50 rounded-lg inline-block">
                         <p className="text-xs font-bold text-white"><Coins className="w-4 h-4 inline mr-1" /> Wajib Zakat (Telah Mencapai Nisab & Haul)</p>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10">
                       <h4 className="text-5xl lg:text-6xl font-black leading-none tabular-nums text-yellow-900/30">Rp 0</h4>
                       <div className="p-3 bg-amber-600/80 rounded-lg inline-block">
                         <p className="text-xs font-bold text-white">Belum Wajib Zakat (Di bawah Nisab)</p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-6 rounded-lg border border-border">
                     <p className="text-[10px] font-black uppercase text-muted-foreground">Total Harta Bersih Terhitung</p>
                     <p className="text-xl font-black text-foreground mt-1">{formatIDR(hartaBersih)}</p>
                  </div>
                  <div className="bg-muted p-6 rounded-lg border border-border">
                     <p className="text-[10px] font-black uppercase text-muted-foreground">Nisab (Aturan BAZNAS)</p>
                     <p className="text-xl font-black text-blue-600 mt-1">{formatIDR(nisabMaalTahunan)}</p>
                     <p className="text-[9px] font-bold text-muted-foreground mt-1">Setara 85gr Emas / Tahun</p>
                  </div>
               </div>
            </div>
         </div>
       )}

       {activeSubTab === 'fidyah' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm space-y-8">
               <h3 className="text-xl font-black flex items-center gap-3"><Calculator className="text-rose-500" /> Kalkulator Fidyah</h3>
               <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block">Jumlah Hari Tidak Puasa</label>
                  <input type="number" value={hariFidyah} onChange={e => setHariFidyah(Number(e.target.value))} className="w-full p-4 bg-muted rounded-lg font-black text-2xl" min="1" />
               </div>
               <div className="h-px bg-muted" />
               <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center justify-between">Harga 1 Porsi Makan (Opsional)</label>
                  <input type="number" value={hargaFidyah} onChange={e => setHargaFidyah(Number(e.target.value))} className="w-full p-4 bg-card border border-border rounded-lg font-bold text-foreground" />
                  <p className="text-[8px] font-bold opacity-60 mt-2">* Standar BAZNAS DKI Jakarta adalah Rp 60.000 / hari. Sesuaikan dengan standar makan harian Anda.</p>
               </div>
            </div>

            <div className="bg-rose-600 p-10 rounded-lg text-white shadow-xl flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-card/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
               <p className="text-[10px] font-black uppercase tracking-[4px] opacity-60 mb-8">Kewajiban Fidyah</p>
               <div className="space-y-8 relative z-10">
                  <div><h4 className="text-6xl font-black leading-none">{fidyahBerasKg.toFixed(2)} <span className="text-xl opacity-40 font-bold">KG</span></h4><p className="text-xs font-bold opacity-60 mt-2">Beras / Makanan Pokok Dasar (0.6 Kg/hari)</p></div>
                  <div className="h-px bg-card/20" />
                  <div><h4 className="text-4xl font-black leading-none tabular-nums">{formatIDR(fidyahUang)}</h4><p className="text-xs font-bold opacity-60 mt-2">Atau Setara Uang Tunai Porsi Makan</p></div>
               </div>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border shadow-sm flex flex-col justify-center">
               <h3 className="text-lg font-black mb-6 flex items-center gap-3"><Landmark className="text-muted-foreground w-5 h-5" /> Fidyah Rules (BAZNAS)</h3>
               <div className="space-y-4 flex-1">
                  <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-100">
                     <p className="text-[9px] font-black uppercase text-rose-500 mb-1">Takaran Asli</p>
                     <p className="text-sm font-black text-foreground">1 Mud = 0.6 Kg / Hari</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-border text-xs font-bold text-muted-foreground leading-relaxed">
                     Orang yang wajib fidyah: Orang sakit parah (tidak ada harapan sembuh), orang tua renta, wanita hamil/menyusui yang dinilai dokter berisiko jika puasa.
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-border text-xs font-bold text-muted-foreground leading-relaxed">
                     Fidyah disalurkan dalam bentuk makanan matang (beserta lauk pauk) kepada kaum fakir/miskin, ATAU dikonversi jadi beras pokok / uang tunai seharga 1 porsi makan proper harian Anda x jumlah hari batal.
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}



