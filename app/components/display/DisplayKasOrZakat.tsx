'use client';

import React, { useState, useEffect } from 'react';
import DisplayLaporanKas from './DisplayLaporanKas';
import DisplayZakat from './DisplayZakat';
import { AnimatePresence, motion } from 'framer-motion';

export default function DisplayKasOrZakat() {
  const [isRamadan, setIsRamadan] = useState(false);
  const [showZakat, setShowZakat] = useState(false);

  useEffect(() => {
    const checkMonth = () => {
      try {
        const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'long' });
        const month = fmt.format(new Date());
        // "رمضان" or "Ramadan"
        if (month.includes('رمضان') || month.toLowerCase().includes('ramadan')) {
          setIsRamadan(true);
        } else {
          setIsRamadan(false);
        }
      } catch (e) {
        setIsRamadan(false);
      }
    };

    checkMonth();
    const timer = setInterval(checkMonth, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(timer);
  }, []);

  // Rotation logic if Ramadan
  useEffect(() => {
    if (!isRamadan) {
      setShowZakat(false);
      return;
    }

    const rotateTimer = setInterval(() => {
      setShowZakat(prev => !prev);
    }, 15000); // Switch every 15 seconds

    return () => clearInterval(rotateTimer);
  }, [isRamadan]);

  if (!isRamadan) {
    return <DisplayLaporanKas />;
  }

  return (
    <div className="h-full w-full relative">
      <AnimatePresence mode="wait">
        {showZakat ? (
          <motion.div
            key="zakat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <DisplayZakat />
          </motion.div>
        ) : (
          <motion.div
            key="kas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <DisplayLaporanKas />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
