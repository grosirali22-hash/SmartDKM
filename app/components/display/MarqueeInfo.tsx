'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGlobalContext } from '../../context/GlobalContext';

// -- Komponen Tampilan --
import DisplayPetugas from './DisplayPetugas';
import DisplayDonasi from './DisplayDonasi';
import DisplayPHBI from './DisplayPHBI';
import DisplayLaporanKas from './DisplayLaporanKas';
import DisplayKajian from './DisplayKajian';
import DisplayStruktur from './DisplayStruktur';

interface MarqueeInfoProps {
  layout: any[];
}

export default function MarqueeInfo({ layout }: MarqueeInfoProps) {
  const { config } = useGlobalContext();

  const RenderModule = ({ moduleId }: { moduleId: string }) => {
    switch (moduleId) {
      case 'petugas': return <DisplayPetugas />;
      case 'donasi': return <DisplayDonasi />;
      case 'phbi': return <DisplayPHBI />;
      case 'laporankas': return <DisplayLaporanKas />;
      case 'kajianrutin': return <DisplayKajian />;
      case 'struktur': return <DisplayStruktur />;
      default: return null;
    }
  };

  const infoModules = useMemo(() => {
    const modules = layout.filter(m => ['donasi', 'laporankas', 'phbi', 'petugas', 'kajianrutin', 'struktur'].includes(m.module_id));
    // Repeat the list to ensure smooth continuous loop
    return [...modules, ...modules, ...modules];
  }, [layout]);

  if (infoModules.length === 0) return null;

  return (
    <div className="w-full h-full overflow-hidden relative flex items-center">
      <motion.div
        className="flex gap-4 px-4"
        animate={{
          x: [0, -100 * (infoModules.length / 3) + '%'],
        }}
        transition={{
          duration: infoModules.length * 30,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ width: 'fit-content' }}
      >
        {infoModules.map((mod, index) => (
          <div 
            key={`${mod.id}-${index}`} 
            className="w-[400px] h-full shrink-0 flex items-center"
          >
            <div className={`w-full h-full p-1`}>
              <RenderModule moduleId={mod.module_id} />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
