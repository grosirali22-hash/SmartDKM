'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DisplayPHBI from './DisplayPHBI';
import DisplayKajian from './DisplayKajian';

/**
 * Menampilkan DisplayPHBI jika ada agenda PHBI dalam 30 hari ke depan (H-30).
 * Jika tidak, tampilkan DisplayKajian sebagai gantinya.
 */
export default function DisplayPHBIOrKajian() {
  const [hasPHBI, setHasPHBI] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const today = new Date();
      const limit = new Date();
      limit.setDate(today.getDate() + 30);

      const todayStr = today.toISOString().split('T')[0];
      const limitStr = limit.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('phbi_events')
        .select('id')
        .gte('tanggal', todayStr)
        .lte('tanggal', limitStr)
        .limit(1);

      // Tampilkan PHBI jika ada event dalam 30 hari ke depan
      setHasPHBI(!error && !!data && data.length > 0);
    };

    check();

    // Re-check setiap 10 menit agar keputusan otomatis diperbarui
    const interval = setInterval(check, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Selama mengecek, tampilkan DisplayKajian sebagai default
  if (hasPHBI === null) return <DisplayKajian />;

  return hasPHBI ? <DisplayPHBI /> : <DisplayKajian />;
}
