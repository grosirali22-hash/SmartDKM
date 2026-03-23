import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ZakatModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
}

const ZakatModal = ({ title, children, onClose, onSave, saveLabel = "Simpan Transaksi" }: ZakatModalProps) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
        <h3 className="text-2xl font-black text-foreground tracking-tighter">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto scrollbar-hide bg-muted/30">
        {children}
      </div>
      <div className="p-6 bg-muted flex gap-4 border-t border-border">
        <button onClick={onClose} className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-muted-foreground hover:text-muted-foreground hover:bg-secondary rounded-lg transition-all">Batal</button>
        <button onClick={onSave} className="flex-2 py-4 px-8 bg-slate-900 text-white rounded-lg font-black uppercase tracking-[4px] text-xs hover:-translate-y-1 shadow-xl hover:shadow-slate-300 transition-all">{saveLabel}</button>
      </div>
    </motion.div>
  </div>
);

export default ZakatModal;
