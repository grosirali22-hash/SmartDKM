'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { GlobalConfig, Profile } from '../types/config';

export interface GlobalContextType {
  config: GlobalConfig;
  setConfig: React.Dispatch<React.SetStateAction<GlobalConfig>>;
  user: any;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
}

export const GlobalContext = createContext<GlobalContextType>({
  config: {
    nama_masjid: 'Masjid Al-Istiqomah',
    running_text: 'Selamat Datang di Masjid Al-Istiqomah...',
    alamat: 'Sukabumi, Jawa Barat',
    isSidebarCollapsed: false,
    is_dark_mode: false,
    tema_warna: 'default',
    is_soft_ui: false,
    display_layout: 'default',
  },
  setConfig: () => {},
  user: null,
  profile: null,
  refreshProfile: async () => {},
});

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GlobalConfig>({
    nama_masjid: 'Masjid Al-Istiqomah',
    running_text: 'Selamat Datang di Masjid Al-Istiqomah...',
    alamat: 'Sukabumi, Jawa Barat',
    isSidebarCollapsed: false,
    is_dark_mode: false,
    tema_warna: 'default',
    is_soft_ui: false,
    display_layout: 'default',
  });
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (prof) setProfile(prof);
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Ambil settingan dari Supabase
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').single();
        if (error) {
          console.error('Error fetching settings:', error.message || error);
          return;
        }
        if (data) {
          setConfig((prev) => ({ ...prev, ...data, isMobileMenuOpen: false }));
        }
      } catch (err) {
        console.error('Fetch settings exception:', err);
      }
    };
    fetchSettings();

    // Listener for Auth
    refreshProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        refreshProfile();
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // Real-time update (jika admin ganti di perangkat lain)
    const sub = supabase
      .channel('settings-live')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'settings',
          filter: 'id=eq.1' 
        },
        (payload) => {
          setConfig((prev) => ({ ...prev, ...(payload.new as GlobalConfig) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ config, setConfig, user, profile, refreshProfile }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}
