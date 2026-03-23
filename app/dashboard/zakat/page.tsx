'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Wallet, Users, ArrowUpRight, ArrowDownRight, Calculator, 
  Plus, Search, Trash2, CheckCircle2, Package, Database,
  FileText, Heart, Calendar, CheckSquare, Square, Building2, UserPlus, MapPin, Phone, RefreshCw, Layers, X, Settings, FileDown, FileUp, Download, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import CalculatorView from './CalculatorView';
import NexusDataTable from '../../components/ui/NexusDataTable';

// --- Types & Components ---
import { Tab, Muzaki, Mustahik, Transaksi, CartItem } from './types';
import ZakatModal from './components/ZakatModal';
import MuzakiTab from './components/MuzakiTab';
import MustahikTab from './components/MustahikTab';
import TransactionsTab from './components/TransactionsTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import BaznasTab from './components/BaznasTab';
import TransactionModal from './components/TransactionModal';
import EditTransactionModal from './components/EditTransactionModal';
import BulkTransactionModal from './components/BulkTransactionModal';

const ASNAF_OPTIONS = ['Fakir', 'Miskin', 'Amil', 'Muallaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnu Sabil'];
const ZAKAT_TYPES = ['Fitrah', 'Maal', 'Fidyah', 'Sedekah'];


export default function ZakatPage() {
  const [activeTab, setActiveTabState] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('smartdkm_zakat_active_tab') as Tab) || 'kalkulator';
    }
    return 'kalkulator';
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('smartdkm_zakat_muzaki');
        return !cached;
    }
    return true;
  });

  // Persistence for Tab
  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    localStorage.setItem('smartdkm_zakat_active_tab', tab);
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    fetchData(true);
  }, []);

  // Data States
  const [muzaki, setMuzaki] = useState<Muzaki[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const c = localStorage.getItem('smartdkm_zakat_muzaki');
        if (c) {
          const parsed = JSON.parse(c);
          return parsed?.data || (Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) { console.error("Error parsing muzaki cache", e); }
    }
    return [];
  });
  const [mustahik, setMustahik] = useState<Mustahik[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const c = localStorage.getItem('smartdkm_zakat_mustahik');
        if (c) {
          const parsed = JSON.parse(c);
          return parsed?.data || (Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) { console.error("Error parsing mustahik cache", e); }
    }
    return [];
  });
  const [transactions, setTransactions] = useState<Transaksi[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const c = localStorage.getItem('smartdkm_zakat_trans');
        if (c) {
          const parsed = JSON.parse(c);
          return parsed?.data || (Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) { console.error("Error parsing trans cache", e); }
    }
    return [];
  });
  const [settings, setSettings] = useState(() => {
    const def = { harga_beras_per_kg: 15000, nisab_maal_idr: 85000000, fitrah_uang: 45000, fitrah_beras_kg: 2.5, fitrah_beras_liter: 3.5, infaq_uang: 20000 };
    if (typeof window !== 'undefined') {
      try {
        const c = localStorage.getItem('smartdkm_zakat_settings');
        if (c) {
          const parsed = JSON.parse(c);
          return parsed?.data || parsed || def;
        }
      } catch (e) {}
    }
    return def;
  });
  const [setupRequired, setSetupRequired] = useState(false);
  const [dompets, setDompets] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const c = localStorage.getItem('smartdkm_zakat_dompet');
      return c ? JSON.parse(c).data : [];
    }
    return [];
  });

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMuzaki, setShowAddMuzaki] = useState(false);
  const [showAddMustahik, setShowAddMustahik] = useState(false);
  const [showAddTransaksi, setShowAddTransaksi] = useState(false);
  const [selectedMuzaki, setSelectedMuzaki] = useState<string[]>([]);
  const [selectedMustahik, setSelectedMustahik] = useState<string[]>([]);
  const [selectedForBaznas, setSelectedForBaznas] = useState<string[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [baznasBerasUnit, setBaznasBerasUnit] = useState<'kg' | 'liter'>('kg');
  const [showEditTransaction, setShowEditTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaksi | null>(null);
  const [formEdit, setFormEdit] = useState({ jenis_zakat: '', satuan: 'uang' as 'uang'|'beras', unit_beras: 'kg' as 'kg'|'liter', jumlah: 0 });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkType, setBulkType] = useState<'masuk' | 'keluar'>('masuk');

  // Pagination States
  const [pageMuzaki, setPageMuzaki] = useState(1);
  const [pageMustahik, setPageMustahik] = useState(1);
  const [pagePenerimaan, setPagePenerimaan] = useState(1);
  const [pagePenyaluran, setPagePenyaluran] = useState(1);
  const [pageBaznas, setPageBaznas] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Kas Masjid States
  const [formWithdraw, setFormWithdraw] = useState(() => {
    const def = { sumber_dana: 'Infaq', dompet_id: '', nominal: 0, keterangan: '' };
    if (typeof window !== 'undefined') {
      try {
        const c = localStorage.getItem('smartdkm_zakat_dompet');
        if (c) {
          const data = JSON.parse(c).data;
          if (data && data.length > 0) return { ...def, dompet_id: data[0].id };
        }
      } catch (e) {}
    }
    return def;
  });

  // Form States
  const [formMuzaki, setFormMuzaki] = useState({ nama: '', telepon: '', alamat: '' });
  const [formMustahik, setFormMustahik] = useState({ nama: '', asnaf: 'Miskin', alamat: '', keterangan: '' });
  const [filterAsnaf, setFilterAsnaf] = useState('Semua');
  
  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formItem, setFormItem] = useState<Omit<CartItem, 'id'>>({
    jenis_zakat: 'Fitrah',
    satuan: 'uang',
    unit_beras: 'kg',
    jumlah: 0,
  });

  // Metadata Form State
  const [formDual, setFormDual] = useState({ 
    muzaki_id: '',
    mustahik_id: '',
    tipe: 'masuk' as 'masuk' | 'keluar'
  });


  // --- Memoized Aggregations ---
  const moneyStats = useMemo(() => {
    const masuk = transactions.filter(t => t.tipe === 'masuk' && t.satuan === 'uang');
    const keluar = transactions.filter(t => t.tipe === 'keluar' && t.satuan === 'uang');
    
    const totalMasuk = masuk.reduce((acc, t) => acc + t.jumlah, 0);
    const totalKeluar = keluar.reduce((acc, t) => acc + t.jumlah, 0);
    
    const outMustahik = keluar.filter(t => t.mustahik?.nama !== 'BAZNAS (PUSAT/KOTA)' && t.mustahik?.nama !== 'KAS MASJID (Tarik Dana)').reduce((acc, t) => acc + t.jumlah, 0);
    const outBaznas = keluar.filter(t => t.mustahik?.nama === 'BAZNAS (PUSAT/KOTA)').reduce((acc, t) => acc + t.jumlah, 0);
    const outWithdraw = keluar.filter(t => t.mustahik?.nama === 'KAS MASJID (Tarik Dana)').reduce((acc, t) => acc + t.jumlah, 0);

    return { totalMasuk, totalKeluar, outMustahik, outBaznas, outWithdraw, saldo: totalMasuk - totalKeluar };
  }, [transactions]);

  const riceStats = useMemo(() => {
    const masukKg = transactions.filter(t => t.tipe === 'masuk' && t.unit_beras === 'kg').reduce((a, b) => a + Number(b.jumlah), 0);
    const keluarKg = transactions.filter(t => t.tipe === 'keluar' && t.unit_beras === 'kg').reduce((a, b) => a + Number(b.jumlah), 0);
    return { stockKg: masukKg - keluarKg };
  }, [transactions]);

  const muzakiTotals = useMemo(() => {
    return {
      idr: muzaki.reduce((a, b) => a + Number(b.total_bayar_idr), 0),
      infaq: muzaki.reduce((a, b) => a + (Number(b.total_infaq_idr) || 0), 0),
      kg: muzaki.reduce((a, b) => a + Number(b.total_bayar_beras_kg), 0),
      liter: muzaki.reduce((a, b) => a + Number(b.total_bayar_beras_liter), 0),
    };
  }, [muzaki]);

  const mustahikTotals = useMemo(() => {
    return {
      idr: mustahik.reduce((a, b) => a + Number(b.total_terima_idr), 0),
      kg: mustahik.reduce((a, b) => a + Number(b.total_terima_beras_kg), 0),
      liter: mustahik.reduce((a, b) => a + Number(b.total_terima_beras_liter), 0),
    };
  }, [mustahik]);

  const penerimaanTotals = useMemo(() => {
    const data = transactions.filter(t => t.tipe === 'masuk');
    return {
      zakatUang: data.filter(t => t.jenis_zakat !== 'Infaq' && t.satuan === 'uang').reduce((a, b) => a + Number(b.jumlah), 0),
      infaqUang: data.filter(t => t.jenis_zakat === 'Infaq' && t.satuan === 'uang').reduce((a, b) => a + Number(b.jumlah), 0),
      berasKg: data.filter(t => t.satuan === 'beras' && t.unit_beras === 'kg').reduce((a, b) => a + Number(b.jumlah), 0),
      berasLiter: data.filter(t => t.satuan === 'beras' && t.unit_beras === 'liter').reduce((a, b) => a + Number(b.jumlah), 0),
    };
  }, [transactions]);

  const penyaluranTotals = useMemo(() => {
    const data = transactions.filter(t => t.tipe === 'keluar');
    return {
      uang: data.filter(t => t.satuan === 'uang').reduce((a, b) => a + Number(b.jumlah), 0),
      berasKg: data.filter(t => t.satuan === 'beras' && t.unit_beras === 'kg').reduce((a, b) => a + Number(b.jumlah), 0),
      berasLiter: data.filter(t => t.satuan === 'beras' && t.unit_beras === 'liter').reduce((a, b) => a + Number(b.jumlah), 0),
    };
  }, [transactions]);

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const chartStats = useMemo(() => {
    const txInqThisYear = transactions.filter(t => t.tipe === 'masuk' && t.satuan === 'uang' && new Date(t.waktu).getFullYear() === currentYear).reduce((acc, t) => acc + t.jumlah, 0);
    const txInqLastYear = transactions.filter(t => t.tipe === 'masuk' && t.satuan === 'uang' && new Date(t.waktu).getFullYear() === lastYear).reduce((acc, t) => acc + t.jumlah, 0);
    const txOutThisYear = transactions.filter(t => t.tipe === 'keluar' && t.satuan === 'uang' && new Date(t.waktu).getFullYear() === currentYear).reduce((acc, t) => acc + t.jumlah, 0);
    const txOutLastYear = transactions.filter(t => t.tipe === 'keluar' && t.satuan === 'uang' && new Date(t.waktu).getFullYear() === lastYear).reduce((acc, t) => acc + t.jumlah, 0);
    const maxVal = Math.max(txInqThisYear, txInqLastYear, txOutThisYear, txOutLastYear, 1);
    return { txInqThisYear, txInqLastYear, txOutThisYear, txOutLastYear, maxVal };
  }, [transactions, currentYear, lastYear]);

  const fetchData = async (isInitial = false) => {
    const MUZAKI_KEY = 'smartdkm_zakat_muzaki';
    const MUSTAHIK_KEY = 'smartdkm_zakat_mustahik';
    const TRANS_KEY = 'smartdkm_zakat_trans';
    const SETTINGS_KEY = 'smartdkm_zakat_settings';
    const DOMPET_KEY = 'smartdkm_zakat_dompet';
    const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 Jam

    if (isInitial) {
      // 1. Check Cache
      try {
        const cMzk = localStorage.getItem(MUZAKI_KEY);
        const cMsk = localStorage.getItem(MUSTAHIK_KEY);
        const cTrx = localStorage.getItem(TRANS_KEY);
        const cStg = localStorage.getItem(SETTINGS_KEY);
        const cDmp = localStorage.getItem(DOMPET_KEY);

        if (cMzk && cMsk && cStg) {
          const pMzk = JSON.parse(cMzk);
          const pMsk = JSON.parse(cMsk);
          const pTrx = cTrx ? JSON.parse(cTrx) : { data: [] };
          const pStg = JSON.parse(cStg);
          const pDmp = cDmp ? JSON.parse(cDmp) : { data: [] };

          setMuzaki(pMzk.data);
          setMustahik(pMsk.data);
          setTransactions(pTrx.data);
          setSettings(pStg.data);
          setDompets(pDmp.data);
          if (pDmp.data.length > 0) setFormWithdraw(prev => ({...prev, dompet_id: pDmp.data[0].id}));

          const age = Date.now() - (pMzk.timestamp || 0);
          if (age < CACHE_TTL) {
            setLoading(false); 
            return; // TRUE CACHE - No server fetch for 12 hours
          }
          
          setLoading(false); // Background revalidation if older than TTL
        } else {
          setLoading(true);
        }
      } catch (e) {
        setLoading(true);
      }
    }

    try {
      const [mzk, msk, trx, stg, dmp] = await Promise.all([
        supabase.from('zakat_muzaki').select('*').order('nama'),
        supabase.from('zakat_mustahik').select('*').order('nama'),
        supabase.from('zakat_transaksi').select('*, muzaki:zakat_muzaki(nama, alamat, telepon), mustahik:zakat_mustahik(nama, alamat)').order('waktu', { ascending: false }),
        supabase.from('zakat_settings').select('*').single(),
        supabase.from('dompet').select('*').order('nama')
      ]);

      const isMissingTable = (res: any) => res.error && (
        res.error.code === 'PGRST116' || 
        res.error.message?.toLowerCase().includes('not find') ||
        res.error.message?.toLowerCase().includes('does not exist')
      );

      if (isMissingTable(stg) || isMissingTable(mzk) || isMissingTable(msk)) {
        setSetupRequired(true);
        setLoading(false);
        return;
      }

      const timestamp = Date.now();
      if (mzk.data) {
        setMuzaki(mzk.data);
        localStorage.setItem(MUZAKI_KEY, JSON.stringify({ data: mzk.data, timestamp }));
      }
      if (msk.data) {
        setMustahik(msk.data);
        localStorage.setItem(MUSTAHIK_KEY, JSON.stringify({ data: msk.data, timestamp }));
      }
      if (trx.data) {
        setTransactions(trx.data);
        localStorage.setItem(TRANS_KEY, JSON.stringify({ data: trx.data, timestamp }));
      }
      if (stg.data) {
        setSettings(stg.data);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ data: stg.data, timestamp }));
      }
      if (dmp.data) {
          setDompets(dmp.data);
          localStorage.setItem(DOMPET_KEY, JSON.stringify({ data: dmp.data, timestamp }));
          if (dmp.data.length > 0) setFormWithdraw(prev => ({...prev, dompet_id: dmp.data[0].id}));
      }
    } catch (err) {
      console.error('Fetch Zakat exception:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const saveMuzaki = async () => {
    const { error } = await supabase.from('zakat_muzaki').insert([formMuzaki]);
    if (!error) { 
        setShowAddMuzaki(false); 
        setFormMuzaki({ nama: '', telepon: '', alamat: '' }); 
        fetchData(); 
    } else {
        alert("Gagal menyimpan Muzaki: " + error.message);
        console.error(error);
    }
  };

  const saveMustahik = async () => {
    const { error } = await supabase.from('zakat_mustahik').insert([formMustahik]);
    if (!error) { 
        setShowAddMustahik(false); 
        setFormMustahik({ nama: '', asnaf: 'Miskin', alamat: '', keterangan: '' }); 
        fetchData(); 
    } else {
        alert("Gagal menyimpan Mustahik: " + error.message);
        console.error(error);
    }
  };

  const saveDualTransaksi = async () => {
    let currentMuzakiId = formDual.muzaki_id;

    // POS Style: Create or Update Muzaki automatically
    if (formDual.tipe === 'masuk') {
      if (!currentMuzakiId && formMuzaki.nama) {
        // Create new Muzaki
        const { data: newMzk, error: mzkErr } = await supabase.from('zakat_muzaki').insert([formMuzaki]).select().single();
        if (mzkErr || !newMzk) return alert("Gagal membuat data Muzaki baru");
        currentMuzakiId = newMzk.id;
      } else if (currentMuzakiId) {
        // Update existing Muzaki (in case address/phone changed)
        const { error: updErr } = await supabase.from('zakat_muzaki').update(formMuzaki).eq('id', currentMuzakiId);
        if (updErr) {
            alert("Gagal memperbarui data Muzaki: " + updErr.message);
            return;
        }
      }
    }

    if (formDual.tipe === 'keluar' && !formDual.mustahik_id) {
      alert("Pilih Mustahik (Penerima) terlebih dahulu!");
      return;
    }

    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    const payload = cart.map(item => ({
        tipe: formDual.tipe,
        muzaki_id: formDual.tipe === 'masuk' ? currentMuzakiId : null,
        mustahik_id: formDual.tipe === 'keluar' ? formDual.mustahik_id : null,
        jenis_zakat: item.jenis_zakat,
        satuan: item.satuan,
        unit_beras: item.satuan === 'beras' ? item.unit_beras : null,
        jumlah: item.jumlah,
    }));

    const { error } = await supabase.from('zakat_transaksi').insert(payload);
    if (!error) {
       setShowAddTransaksi(false);
       setCart([]);
       setFormItem({ jenis_zakat: 'Fitrah', satuan: 'uang', unit_beras: 'kg', jumlah: 0 });
       setFormDual({ ...formDual, muzaki_id: '', mustahik_id: '' });
       setFormMuzaki({ nama: '', alamat: '', telepon: '' });
    } else {
       alert("Error: " + error.message);
    }
  };

  const saveZakatSettings = async () => {
    const { error } = await supabase.from('zakat_settings').update({
        harga_beras_per_kg: settings.harga_beras_per_kg,
        nisab_maal_idr: settings.nisab_maal_idr,
        fitrah_uang: settings.fitrah_uang,
        fitrah_beras_kg: settings.fitrah_beras_kg,
        fitrah_beras_liter: settings.fitrah_beras_liter,
        infaq_uang: settings.infaq_uang
    }).eq('id', 1);

    if (error) {
        alert("Gagal menyimpan pengaturan. Pastikan Anda telah menjalankan update SQL zakat_dummy_data terbaru.");
        console.error(error);
    } else {
        alert("Pengaturan Berhasil Disimpan!");
        fetchData();
    }
  };

  const handleExportTransactions = (tipe: 'masuk' | 'keluar') => {
      const data = transactions.filter(t => t.tipe === tipe);
      const dataToExport = data.map((t, i) => ({
          No: i + 1,
          Waktu: new Date(t.waktu).toLocaleString('id-ID'),
          Tipe: t.tipe === 'masuk' ? 'Penerimaan' : 'Penyaluran',
          NamaMuzaki: t.muzaki?.nama || '-',
          NamaMustahik: t.mustahik?.nama || '-',
          JenisZakat: t.jenis_zakat,
          Satuan: t.satuan,
          Jumlah: t.jumlah,
          UnitBeras: t.unit_beras || '-',
          Keterangan: t.is_baznas_settled ? 'Sudah Setor Baznas' : 'Belum Setor'
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Data_${tipe === 'masuk' ? 'Penerimaan' : 'Penyaluran'}`);
      XLSX.writeFile(wb, `Data_Zakat_${tipe}_${new Date().getTime()}.xlsx`);
  };

  const handleDownloadTemplateTransactions = () => {
      // Very basic template, in reality this might need more fields like muzaki_id or names that match
      const ws = XLSX.utils.json_to_sheet([
          { 'Nama (Muzaki/Mustahik)': 'Contoh Nama', 'Jenis Zakat': 'Fitrah', 'Satuan': 'uang', 'Jumlah': 45000, 'Unit Beras (jika beras)': '' }
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template Transaksi");
      XLSX.writeFile(wb, `Template_Import_Transaksi.xlsx`);
  };

  const handleImportTransactions = async (e: React.ChangeEvent<HTMLInputElement>, tipe: 'masuk' | 'keluar') => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws) as any[];

          const toInsert = data.map(row => ({
              tipe,
              jenis_zakat: row['Jenis Zakat'] || 'Fitrah',
              satuan: row['Satuan']?.toLowerCase() === 'beras' ? 'beras' : 'uang',
              jumlah: Number(row['Jumlah']) || 0,
              unit_beras: row['Unit Beras']?.toLowerCase() === 'liter' ? 'liter' : 'kg',
              waktu: new Date().toISOString(),
          }));

          const { error } = await supabase.from('zakat_transactions').insert(toInsert);
          if (error) alert("Error importing: " + error.message);
          else {
              alert(`Berhasil mengimpor ${toInsert.length} transaksi`);
              fetchData();
          }
      };
      reader.readAsBinaryString(file);
  };

  // --- Excel Import/Export Handlers ---
  const handleExportMuzaki = () => {
      const dataToExport = muzaki.map((m, i) => ({
          No: i + 1,
          Nama: m.nama,
          Alamat: m.alamat || '',
          Telepon: m.telepon || '',
          TotalZakatTunai: m.total_bayar_idr,
          TotalInfaqTunai: m.total_infaq_idr || 0,
          TotalBerasKg: m.total_bayar_beras_kg || 0,
          TotalBerasLiter: m.total_bayar_beras_liter || 0
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Muzaki");
      XLSX.writeFile(wb, `Data_Muzaki_${new Date().getTime()}.xlsx`);
  };

  const handleExportMustahik = () => {
      const data = filterAsnaf === 'Semua' ? mustahik : mustahik.filter(m => m.asnaf === filterAsnaf);
      const dataToExport = data.map((m, i) => ({
          No: i + 1,
          Nama: m.nama,
          Asnaf: m.asnaf,
          Alamat: m.alamat || '',
          Keterangan: m.keterangan || '',
          DiterimaTunai: m.total_terima_idr,
          DiterimaBerasKg: m.total_terima_beras_kg || 0,
          DiterimaBerasLiter: m.total_terima_beras_liter || 0
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Mustahik");
      XLSX.writeFile(wb, `Data_Mustahik_${filterAsnaf}_${new Date().getTime()}.xlsx`);
  };

  const handleDownloadTemplateMuzaki = () => {
      const ws = XLSX.utils.json_to_sheet([{ Nama: 'Contoh Muzaki', Alamat: 'Jl. Contoh No 1', Telepon: '08123456789' }]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template Muzaki");
      XLSX.writeFile(wb, `Template_Import_Muzaki.xlsx`);
  };

  const handleDownloadTemplateMustahik = () => {
      const ws = XLSX.utils.json_to_sheet([{ Nama: 'Contoh Mustahik', Asnaf: 'Fakir', Alamat: 'Jl. Contoh No 2', Keterangan: 'Lembaga / Panti' }]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template Mustahik");
      XLSX.writeFile(wb, `Template_Import_Mustahik.xlsx`);
  };

  const handleImportMuzaki = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(sheet);
          
          const payload = json.map(row => ({
              nama: row.Nama,
              alamat: row.Alamat || '',
              telepon: row.Telepon?.toString() || ''
          })).filter(row => row.nama);

          if (payload.length > 0) {
              setLoading(true);
              const { error } = await supabase.from('zakat_muzaki').insert(payload);
              if (!error) { alert(`Berhasil import ${payload.length} Muzaki`); fetchData(); }
              else { alert("Gagal Import: " + error.message); setLoading(false); }
          }
      };
      reader.readAsArrayBuffer(file);
  };

  const handleImportMustahik = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(sheet);
          
          const payload = json.map(row => ({
              nama: row.Nama,
              asnaf: row.Asnaf || 'Miskin',
              alamat: row.Alamat || '',
              keterangan: row.Keterangan || ''
          })).filter(row => row.nama);

          if (payload.length > 0) {
              setLoading(true);
              const { error } = await supabase.from('zakat_mustahik').insert(payload);
              if (!error) { alert(`Berhasil import ${payload.length} Mustahik`); fetchData(); }
              else { alert("Gagal Import: " + error.message); setLoading(false); }
          }
      };
      reader.readAsArrayBuffer(file);
  };

  const getDefaultPrice = (jenis: string, satuan: string, unit: string) => {
    if (jenis === 'Fitrah') {
        if (satuan === 'uang') return settings.fitrah_uang;
        if (satuan === 'beras') return unit === 'kg' ? settings.fitrah_beras_kg : settings.fitrah_beras_liter;
    }
    if (jenis === 'Infaq' || jenis === 'Sedekah') {
        return settings.infaq_uang;
    }
    return 0;
  };

  const handleOpenAddTransaksi = (tipe: 'masuk' | 'keluar') => {
    setFormDual({ ...formDual, tipe });
    setCart([]);
    const defaultJenis = 'Fitrah';
    const defaultSatuan = 'uang';
    setFormItem({
        jenis_zakat: defaultJenis,
        satuan: defaultSatuan,
        unit_beras: 'kg',
        jumlah: getDefaultPrice(defaultJenis, defaultSatuan, 'kg')
    });
    setShowAddTransaksi(true);
  };

  const handleZakatItemChange = (key: keyof CartItem, value: any) => {
    let newItem = { ...formItem, [key]: value };
    
    if (key === 'jenis_zakat' || key === 'satuan' || key === 'unit_beras') {
        newItem.jumlah = getDefaultPrice(newItem.jenis_zakat, newItem.satuan, newItem.unit_beras || 'kg');
    }

    setFormItem(newItem as any);
  };

  const handleBaznasSettlement = async () => {
    if (selectedForBaznas.length === 0) return;

    // 1. Get Selected Transactions
    const selectedTxs = transactions.filter(t => selectedForBaznas.includes(t.id));

    // 2. Find or Create BAZNAS Mustahik
    let baznasMustahik = mustahik.find(m => m.nama === 'BAZNAS (PUSAT/KOTA)');
    if (!baznasMustahik) {
        const { data: newBzn, error: errBzn } = await supabase.from('zakat_mustahik').insert([{
            nama: 'BAZNAS (PUSAT/KOTA)',
            asnaf: 'Amil',
            alamat: 'Setoran Unit Pengumpul Zakat (UPZ)',
            keterangan: 'Otomatis dibuat oleh Sistem'
        }]).select().single();
        
        if (errBzn || !newBzn) {
            alert("Gagal menyiapkan profil BAZNAS: " + (errBzn?.message || 'Unknown error'));
            return;
        }
        baznasMustahik = newBzn;
    }

    // 3. Aggregate deductions exactly as displayed in the UI
    const zakatUang = selectedTxs.filter(t => t.jenis_zakat !== 'Infaq' && t.satuan === 'uang').reduce((a, b) => a + Number(b.jumlah), 0) * 0.2;
    const zakatBerasKg = selectedTxs.filter(t => t.jenis_zakat !== 'Infaq' && t.satuan === 'beras' && t.unit_beras === 'kg').reduce((a, b) => a + Number(b.jumlah), 0);
    const zakatBerasLiter = selectedTxs.filter(t => t.jenis_zakat !== 'Infaq' && t.satuan === 'beras' && t.unit_beras === 'liter').reduce((a, b) => a + Number(b.jumlah), 0);
    const infaqUang = selectedTxs.filter(t => t.jenis_zakat === 'Infaq' && t.satuan === 'uang').reduce((a, b) => a + Number(b.jumlah), 0) * 0.8;

    const totalZakatBerasConverted = 
      (baznasBerasUnit === 'kg' ? zakatBerasKg + (zakatBerasLiter * (2.5 / 3.5)) : zakatBerasLiter + (zakatBerasKg * (3.5 / 2.5))) * 0.2;

    // 4. Create Payloads for 'keluar'
    const payloads: any[] = [];
    
    if (zakatUang > 0) payloads.push({ tipe: 'keluar', mustahik_id: baznasMustahik.id, jenis_zakat: 'Zakat', satuan: 'uang', jumlah: zakatUang, is_baznas_settled: true });
    if (infaqUang > 0) payloads.push({ tipe: 'keluar', mustahik_id: baznasMustahik.id, jenis_zakat: 'Infaq', satuan: 'uang', jumlah: infaqUang, is_baznas_settled: true });
    if (totalZakatBerasConverted > 0) payloads.push({ tipe: 'keluar', mustahik_id: baznasMustahik.id, jenis_zakat: 'Zakat', satuan: 'beras', unit_beras: baznasBerasUnit, jumlah: Number(totalZakatBerasConverted.toFixed(2)), is_baznas_settled: true });

    // 5. Execute DB Inserts and Updates
    const { error: errInsert } = await supabase.from('zakat_transaksi').insert(payloads);
    if (errInsert) {
        alert("Gagal membuat log penyaluran ke BAZNAS: " + errInsert.message);
        return;
    }

    const { error: errUpdate } = await supabase.from('zakat_transaksi').update({ is_baznas_settled: true }).in('id', selectedForBaznas);
    if (errUpdate) {
        console.error(errUpdate);
    }

    setSelectedForBaznas([]); 
    fetchData(); 
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Hapus log transaksi ini?')) return;
    const { error } = await supabase.from('zakat_transaksi').delete().eq('id', id);
    if (error) alert("Gagal menghapus: " + error.message);
    else fetchData();
  };

  const openEditTransaction = (t: Transaksi) => {
    setEditingTransaction(t);
    setFormEdit({
        jenis_zakat: t.jenis_zakat,
        satuan: t.satuan,
        unit_beras: t.unit_beras || 'kg',
        jumlah: t.jumlah
    });
    setShowEditTransaction(true);
  };

  const updateTransaction = async () => {
    if (!editingTransaction) return;
    const { error } = await supabase.from('zakat_transaksi').update(formEdit).eq('id', editingTransaction.id);
    if (!error) {
        setShowEditTransaction(false);
        fetchData();
    } else {
        alert("Gagal update: " + error.message);
    }
  };

  const handleBulkSubmit = async (formData: any) => {
    const selectedIds = bulkType === 'masuk' ? selectedMuzaki : selectedMustahik;
    if (selectedIds.length === 0) return;

    const payload = selectedIds.map(id => ({
        tipe: bulkType,
        muzaki_id: bulkType === 'masuk' ? id : null,
        mustahik_id: bulkType === 'keluar' ? id : null,
        jenis_zakat: formData.jenis_zakat,
        satuan: formData.satuan,
        unit_beras: formData.satuan === 'beras' ? formData.unit_beras : null,
        jumlah: formData.jumlah,
        waktu: new Date().toISOString(),
        is_baznas_settled: (bulkType === 'masuk' && formData.is_baznas)
    }));

    const { error } = await supabase.from('zakat_transaksi').insert(payload);
    if (!error) {
        setShowBulkModal(false);
        setSelectedMuzaki([]);
        setSelectedMustahik([]);
        fetchData();
        alert(`Berhasil memproses ${selectedIds.length} data secara massal.`);
    } else {
        alert("Gagal memproses massal: " + error.message);
    }
  };

  const handleWithdraw = async () => {
    if (!formWithdraw.dompet_id) return alert("Pilih dompet tujuan!");
    if (formWithdraw.nominal <= 0) return alert("Nominal tidak valid!");
    
    let kasMustahik = mustahik.find(m => m.nama === 'KAS MASJID (Tarik Dana)');
    if (!kasMustahik) {
        const { data: newKas, error: errKas } = await supabase.from('zakat_mustahik').insert([{
            nama: 'KAS MASJID (Tarik Dana)',
            asnaf: 'Amil',
            alamat: 'Pemindahan Buku ke Dompet Utama Masjid',
            keterangan: 'Otomatis dibuat oleh Sistem'
        }]).select().single();
        if (errKas || !newKas) return alert("Gagal setup profil penyaluran lokal: " + errKas?.message);
        kasMustahik = newKas;
    }

    const payloadZakat = {
        tipe: 'keluar',
        muzaki_id: null,
        mustahik_id: kasMustahik.id,
        jenis_zakat: formWithdraw.sumber_dana,
        satuan: 'uang',
        jumlah: formWithdraw.nominal,
    };

    const payloadKeuangan = {
        tipe: 'debit',
        nominal: formWithdraw.nominal,
        keterangan: `Withdraw Kas Zakat (${formWithdraw.sumber_dana})${formWithdraw.keterangan ? ' - ' + formWithdraw.keterangan : ''}`,
        dompet_id: formWithdraw.dompet_id,
        waktu: new Date().toISOString()
    };

    const { error: zErr } = await supabase.from('zakat_transaksi').insert([payloadZakat]);
    if (zErr) return alert("Gagal memotong saldo zakat: " + zErr.message);

    const { error: kErr } = await supabase.from('keuangan').insert([payloadKeuangan]);
    if (kErr) return alert("Berhasil potong zakat, tapi gagal masuk ke rekening Kas Masjid: " + kErr.message);

    setShowWithdrawModal(false);
    setFormWithdraw({...formWithdraw, nominal: 0, keterangan: ''});
    fetchData();
  };

  // --- Views ---

  if (!isMounted) return <div className="min-h-screen bg-[#f8fafc]" />;

  return (
    <div className="max-w-full mx-auto space-y-8 pt-4 pb-12 px-4 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black text-foreground tracking-tighter">Zakat Digital Pro</h1>
              {loading && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full animate-pulse border border-blue-100 mt-2">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Memperbarui Data...</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground font-bold mt-2 uppercase text-[10px] tracking-[5px] flex items-center gap-2"><Calendar className="text-blue-500 w-3 h-3" /> Ramadan 1447 H • Dashboard Utama</p>
          </div>
         <div className="flex gap-2">
            <button onClick={() => handleOpenAddTransaksi('masuk')} className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all"><Plus className="w-5 h-5" /> Terima Zakat</button>
         </div>
      </div>
      {setupRequired ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-card rounded-lg border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Database className="w-64 h-64 text-foreground" />
          </div>
          
          <div className="relative z-10 max-w-lg space-y-8">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center mx-auto shadow-xl shadow-rose-100/50 border border-rose-100">
              <Database className="w-10 h-10" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-foreground tracking-tighter">Infrastruktur Belum Siap</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Tabel database untuk modul <span className="text-foreground font-bold italic">Zakat Digital Pro</span> belum terdeteksi. Silakan jalankan script setup SQL untuk mengaktifkan seluruh fitur distribusi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a 
                href="/setup-guide" 
                className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
              >
                Lihat Panduan Setup <ArrowUpRight className="w-4 h-4" />
              </a>
              <button 
                onClick={() => fetchData(true)}
                className="w-full sm:w-auto px-10 py-4 bg-card border-2 border-border text-muted-foreground rounded-lg font-black text-xs uppercase tracking-widest hover:border-border hover:text-muted-foreground transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>

      {/* Tabs */}
      <div className="flex w-full bg-card/80 backdrop-blur-md border border-border rounded-lg overflow-x-auto scrollbar-hide shadow-sm sticky top-[80px] z-[50] no-scrollbar p-1.5 gap-1">
        {[
          { id: 'kalkulator', label: 'Kalkulator', icon: Calculator },
          { id: 'muzaki', label: 'Muzaki', icon: Users },
          { id: 'mustahik', label: 'Mustahik', icon: Heart },
          { id: 'penerimaan', label: 'Penerimaan', icon: ArrowUpRight },
          { id: 'penyaluran', label: 'Penyaluran', icon: ArrowDownRight },
          { id: 'baznas', label: 'Baznas', icon: Building2 },
          { id: 'laporan', label: 'Laporan', icon: FileText },
          { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as Tab)} 
            className={`flex-1 min-w-max flex justify-center items-center gap-2 px-5 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${
              activeTab === t.id 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-muted-foreground hover:bg-muted hover:text-muted-foreground'
            }`}
          >
            <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-blue-400' : ''}`} /> 
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
           {activeTab === 'kalkulator' && <CalculatorView settings={settings} />}
           {activeTab === 'penerimaan' && (
              <TransactionsTab
                type="masuk"
                transactions={transactions}
                fetchData={fetchData}
                openEditTransaction={openEditTransaction}
                deleteTransaction={deleteTransaction}
                handleExportTransactions={handleExportTransactions}
                handleImportTransactions={handleImportTransactions}
                handleDownloadTemplateTransactions={handleDownloadTemplateTransactions}
                penerimaanTotals={penerimaanTotals}
              />
            )}

            {activeTab === 'penyaluran' && (
              <TransactionsTab
                type="keluar"
                transactions={transactions}
                fetchData={fetchData}
                openEditTransaction={openEditTransaction}
                deleteTransaction={deleteTransaction}
                handleExportTransactions={handleExportTransactions}
                handleImportTransactions={handleImportTransactions}
                handleDownloadTemplateTransactions={handleDownloadTemplateTransactions}
                penyaluranTotals={penyaluranTotals}
              />
            )}
            {activeTab === 'muzaki' && (
              <MuzakiTab
                muzaki={muzaki}
                fetchData={fetchData}
                showAddMuzaki={showAddMuzaki}
                setShowAddMuzaki={setShowAddMuzaki}
                formMuzaki={formMuzaki}
                setFormMuzaki={setFormMuzaki}
                saveMuzaki={saveMuzaki}
                handleExportMuzaki={handleExportMuzaki}
                handleImportMuzaki={handleImportMuzaki}
                handleDownloadTemplateMuzaki={handleDownloadTemplateMuzaki}
                selectedMuzaki={selectedMuzaki}
                setSelectedMuzaki={setSelectedMuzaki}
                muzakiTotals={muzakiTotals}
              />
            )}

            {activeTab === 'mustahik' && (
              <MustahikTab
                mustahik={mustahik}
                fetchData={fetchData}
                showAddMustahik={showAddMustahik}
                setShowAddMustahik={setShowAddMustahik}
                formMustahik={formMustahik}
                setFormMustahik={setFormMustahik}
                saveMustahik={saveMustahik}
                handleExportMustahik={handleExportMustahik}
                handleImportMustahik={handleImportMustahik}
                handleDownloadTemplateMustahik={handleDownloadTemplateMustahik}
                filterAsnaf={filterAsnaf}
                setFilterAsnaf={setFilterAsnaf}
                ASNAF_OPTIONS={ASNAF_OPTIONS}
                selectedMustahik={selectedMustahik}
                setSelectedMustahik={setSelectedMustahik}
                mustahikTotals={mustahikTotals}
                muzaki={muzaki}
              />
            )}

            {activeTab === 'baznas' && (
              <BaznasTab
                transactions={transactions}
                selectedForBaznas={selectedForBaznas}
                setSelectedForBaznas={setSelectedForBaznas}
                baznasBerasUnit={baznasBerasUnit}
                setBaznasBerasUnit={setBaznasBerasUnit}
                handleBaznasSettlement={handleBaznasSettlement}
              />
            )}

            {activeTab === 'laporan' && (
              <ReportsTab
                moneyStats={moneyStats}
                riceStats={riceStats}
                chartStats={chartStats}
                lastYear={new Date().getFullYear() - 1}
                currentYear={new Date().getFullYear()}
                setShowWithdrawModal={setShowWithdrawModal}
                showWithdrawModal={showWithdrawModal}
                formWithdraw={formWithdraw}
                setFormWithdraw={setFormWithdraw}
                dompets={dompets}
                handleWithdraw={handleWithdraw}
              />
            )}

            {activeTab === 'pengaturan' && (
              <SettingsTab settings={settings} setSettings={setSettings} saveZakatSettings={saveZakatSettings} />
            )}
          </motion.div>
        </AnimatePresence>

      {/* Modals */}
      {showAddMuzaki && (
        <ZakatModal title="Muzaki Baru" onClose={() => setShowAddMuzaki(false)} onSave={saveMuzaki}>
          <div className="space-y-4">
             <input placeholder="Nama Lengkap" className="w-full p-5 bg-muted rounded-lg font-bold" value={formMuzaki.nama} onChange={e => setFormMuzaki({...formMuzaki, nama: e.target.value})} />
             <input placeholder="No Telepon / WA" className="w-full p-5 bg-muted rounded-lg font-bold" value={formMuzaki.telepon} onChange={e => setFormMuzaki({...formMuzaki, telepon: e.target.value})} />
             <textarea placeholder="Alamat Detail" className="w-full p-5 bg-muted rounded-lg font-bold h-32" value={formMuzaki.alamat} onChange={e => setFormMuzaki({...formMuzaki, alamat: e.target.value})} />
          </div>
        </ZakatModal>
      )}

      {showAddMustahik && (
        <ZakatModal title="Penerima Baru" onClose={() => setShowAddMustahik(false)} onSave={saveMustahik}>
           <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg mb-4">
                 <p className="text-[9px] font-black uppercase text-blue-600 mb-2">Pernah Menjadi Muzaki?</p>
                 <select 
                    className="w-full p-3 bg-card border border-blue-100 rounded-lg font-bold text-xs outline-none"
                    onChange={(e) => {
                       const m = muzaki.find(muz => muz.id === e.target.value);
                       if (m) setFormMustahik({ ...formMustahik, nama: m.nama, alamat: m.alamat || '' });
                    }}
                    value=""
                 >
                    <option value="">-- Salin Data dari Muzaki --</option>
                    {muzaki.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                 </select>
              </div>
              <input placeholder="Nama Penerima" className="w-full p-5 bg-muted rounded-lg font-bold" value={formMustahik.nama} onChange={e => setFormMustahik({...formMustahik, nama: e.target.value})} />
              <select className="w-full p-5 bg-muted rounded-lg font-black uppercase text-[10px] tracking-widest text-muted-foreground" value={formMustahik.asnaf} onChange={e => setFormMustahik({...formMustahik, asnaf: e.target.value})}>{ASNAF_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}</select>
              <textarea placeholder="Alamat" className="w-full p-5 bg-muted rounded-lg font-bold h-32" value={formMustahik.alamat} onChange={e => setFormMustahik({...formMustahik, alamat: e.target.value})} />
           </div>
        </ZakatModal>
      )}

      {showAddTransaksi && (
        <TransactionModal
          muzaki={muzaki}
          onClose={() => setShowAddTransaksi(false)}
          onSave={saveDualTransaksi}
          settings={settings}
          ZAKAT_TYPES={ZAKAT_TYPES}
        />
      )}

      {showEditTransaction && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setShowEditTransaction(false)}
          onSave={updateTransaction}
          ZAKAT_TYPES={ZAKAT_TYPES}
        />
      )}

      {showBulkModal && (
        <BulkTransactionModal
          type={bulkType}
          selectedCount={bulkType === 'masuk' ? selectedMuzaki.length : selectedMustahik.length}
          onClose={() => setShowBulkModal(false)}
          onSave={handleBulkSubmit}
          settings={settings}
          ZAKAT_TYPES={ZAKAT_TYPES}
        />
      )}

      {/* Floating Action Bar */}
      <AnimatePresence>
        {(selectedMuzaki.length > 0 || selectedMustahik.length > 0) && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 border border-white/10 px-8 py-5 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-8 backdrop-blur-xl"
          >
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Terpilih</span>
                <span className="text-xl font-black text-white">{selectedMuzaki.length || selectedMustahik.length} <span className="text-[10px] opacity-50 uppercase">Item</span></span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex gap-3">
                {selectedMuzaki.length > 0 ? (
                   <>
                      <button 
                        onClick={() => { setBulkType('masuk'); setShowBulkModal(true); }}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:-translate-y-1 transition-all"
                      >
                         Terima Zakat Massal
                      </button>
                      <button onClick={() => setSelectedMuzaki([])} className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest">Batal</button>
                   </>
                ) : (
                   <>
                      <button 
                        onClick={() => { setBulkType('keluar'); setShowBulkModal(true); }}
                        className="px-6 py-3 bg-rose-500 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:-translate-y-1 transition-all"
                        >
                         Salurkan Zakat Massal
                      </button>
                      <button onClick={() => setSelectedMustahik([])} className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest">Batal</button>
                   </>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showWithdrawModal && (
        <ZakatModal title="Withdraw Dana Zakat/Infaq ke Kas Masjid" onClose={() => setShowWithdrawModal(false)} onSave={handleWithdraw}>
           <div className="space-y-6">
              <div className="p-5 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-xs font-black text-blue-800 leading-relaxed tracking-wide">
                  Fitur ini akan memotong Saldo Penerimaan di Zakat/UPZ Anda dan memasukkannya otomatis ke dalam buku Kas Utama Masjid.
                </p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Sumber Dana Khusus</p>
                 <select className="w-full p-5 bg-muted rounded-lg font-black uppercase text-[10px] tracking-widest text-muted-foreground cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={formWithdraw.sumber_dana} onChange={e => setFormWithdraw({...formWithdraw, sumber_dana: e.target.value})}>
                    <option value="Infaq">Infaq & Shadaqah (Bebas)</option>
                    <option value="Amil">Bagian Amil (UPZ)</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Transfer ke Dompet Masjid</p>
                 <select className="w-full p-5 bg-muted rounded-lg font-black uppercase text-[10px] tracking-widest text-muted-foreground cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={formWithdraw.dompet_id} onChange={e => setFormWithdraw({...formWithdraw, dompet_id: e.target.value})}>
                    <option value="" disabled>-- Pilih Dompet Tujuan --</option>
                    {dompets.length === 0 ? <option value="" disabled>(Belum Ada Dompet di Kas Masjid)</option> : dompets.map(d => <option key={d.id} value={d.id}>DOMPET {d.nama}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nominal Withdraw (Rp)</p>
                 <input type="number" min="0" placeholder="Rp 0" className="w-full p-8 bg-muted rounded-lg font-black text-3xl text-foreground border-2 border-transparent focus:border-blue-500 transition-all outline-none" value={formWithdraw.nominal || ''} onChange={e => setFormWithdraw({...formWithdraw, nominal: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Catatan Tambahan (Boleh Kosong)</p>
                 <input placeholder="Contoh: Operasional DKM bulan ini..." className="w-full p-5 bg-muted rounded-lg font-bold border-2 border-transparent focus:border-blue-500 transition-all outline-none text-foreground" value={formWithdraw.keterangan} onChange={e => setFormWithdraw({...formWithdraw, keterangan: e.target.value})} />
              </div>
           </div>
        </ZakatModal>
      )}
        </>
      )}
    </div>
  );
}
