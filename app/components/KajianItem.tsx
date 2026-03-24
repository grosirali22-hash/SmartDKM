import { useGlobalContext } from '../context/GlobalContext';
import { GlobalConfig } from '../types/config';

interface KajianItemProps {
  hari: string;
  jam: string;
  ustadz: string;
  kitab: string;
  judul: string;
}

export default function KajianItem({ hari, jam, ustadz, kitab, judul }: KajianItemProps) {
  const { config } = useGlobalContext() as { config: GlobalConfig };
  const isNeumorph = config.tema_warna === 'neumorph';

  return (
    <div className={`p-5 rounded-lg mb-4 transition-all duration-500 flex ${isNeumorph ? 'nm-card !border-0' : 'bg-white border-l-[6px] border-blue-600 shadow-sm'}`}>
      <div className={`flex flex-col items-center justify-center pr-5 mr-5 min-w-[60px] transition-all duration-500 ${isNeumorph ? 'nm-inset rounded-lg py-2' : 'border-r border-slate-100'}`}>
        <span className={`font-black text-xs uppercase transition-all duration-500 ${isNeumorph ? 'text-primary' : 'text-slate-900'}`}>{hari}</span>
        <span className={`text-[10px] font-bold transition-all duration-500 ${isNeumorph ? 'text-foreground/40' : 'text-slate-400'}`}>{jam}</span>
      </div>
      <div className="flex-1">
        <p className={`font-black text-base leading-tight mb-1 transition-all duration-500 ${isNeumorph ? 'text-foreground' : 'text-slate-900'}`}>{judul}</p>
        <p className={`text-[11px] font-medium italic transition-all duration-500 ${isNeumorph ? 'text-foreground/60' : 'text-slate-500'}`}>Bersama: {ustadz}</p>
        <p className={`text-[9px] font-black uppercase mt-2 tracking-widest transition-all duration-500 ${isNeumorph ? 'text-primary' : 'text-slate-400'}`}>
          📖 Kitab: {kitab}
        </p>
      </div>
    </div>
  );
}

