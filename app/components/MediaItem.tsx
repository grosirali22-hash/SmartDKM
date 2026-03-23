import React from 'react';
import { Play } from 'lucide-react';

interface MediaItemProps {
  judul: string;
  tipe: 'audio' | 'video';
  ukuran: string;
  onPlay?: () => void;
}

export default function MediaItem({ judul, tipe, ukuran, onPlay }: MediaItemProps) {
  return (
    <div className="bg-white p-5 rounded-lg flex items-center border border-slate-100 mb-3 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
        <span className="text-xl">{tipe === 'video' ? '🎬' : '🔊'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 truncate">{judul}</p>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
          {tipe} • {ukuran}
        </p>
      </div>
      <button
        onClick={onPlay}
        className="bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-slate-700 transition-all active:scale-95 flex-shrink-0 ml-3"
      >
        <Play size={16} color="white" fill="white" />
      </button>
    </div>
  );
}
