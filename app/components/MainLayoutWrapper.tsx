'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalContext } from '../context/GlobalContext';
import { Menu, Search, Bell, User, ChevronRight, Settings, LogOut, Mail, Sun, Moon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { config, setConfig, profile } = useGlobalContext();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const isCollapsed = config.isSidebarCollapsed || false;

  const isAuthPage = pathname?.startsWith('/login');
  const isDisplayPage = pathname?.startsWith('/display');

  React.useEffect(() => {
    setMounted(true);
    // Tutup menu mobile setiap navigasi
    setConfig(prev => ({ ...prev, isMobileMenuOpen: false }));
    setIsSearchOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  }, [pathname, setConfig]);

  const toggleMobileMenu = () => {
    setConfig({ ...config, isMobileMenuOpen: true });
  };

  const navItems = [
    { label: 'Beranda', href: '/dashboard' },
    { label: 'Kas Masjid', href: '/keuangan' },
    { label: 'Jadwal Shalat', href: '/jadwal' },
    { label: 'Inventaris', href: '/inventaris' },
    { label: 'Struktur DKM', href: '/struktur-dkm' },
    { label: 'Petugas Shalat', href: '/petugas-shalat' },
    { label: 'Kajian Rutin', href: '/kajian-rutin' },
    { label: 'Media Kajian', href: '/media-kajian' },
    { label: 'Hari Besar (PHBI)', href: '/phbi' },
    { label: 'Running Text', href: '/running-text' },
    { label: 'Donasi', href: '/donasi' },
    { label: 'Zakat', href: '/dashboard/zakat' },
    { label: 'Konten Slider', href: '/slider' },
    { label: 'Adzan & Iqomah', href: '/adzan-iqomah' },
    { label: 'Setelan', href: '/setelan' },
  ];

  const filteredSearch = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Jika di halaman login, display, atau root (TV), jangan pakai layout dashboard
  if (isAuthPage || isDisplayPage || pathname === '/' || (pathname && (pathname.startsWith('/login') || pathname.startsWith('/display')))) {
    return (
      <main className={`min-h-screen bg-background ${config.is_dark_mode ? 'dark' : ''} group`}>
        {children}
      </main>
    );
  }

  // Catatan: mounted digunakan untuk membatasi interaksi berat dan akses window yang menyebabkan mismatch hidrasi.

  return (
    <div
      className={`min-h-screen transition-all duration-300 ease-in-out bg-background ${config.is_dark_mode ? 'dark' : ''} group ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
    >
      {/* Centralized Header */}
      <header className="fixed top-0 right-0 left-0 backdrop-blur-xl border-b border-border h-16 z-[60] transition-all duration-300 bg-card/70"
        style={{ left: mounted && typeof window !== 'undefined' && window.innerWidth >= 1024 ? (isCollapsed ? '80px' : '256px') : '0' }}
      >
        <div className="h-full flex items-center justify-between px-5">
          <div className="flex items-center gap-4">
            {/* Desktop Sidebar Toggle */}
            <button
               onClick={() => setConfig({ ...config, isSidebarCollapsed: !isCollapsed })}
               className="hidden lg:flex p-2.5 rounded-lg transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-primary active:scale-95"
               title={isCollapsed ? "Buka Menu" : "Kecilkan Menu"}
            >
               <Menu size={20} />
            </button>

            <button
              onClick={toggleMobileMenu}
              className="p-2.5 rounded-lg transition-all lg:hidden bg-blue-50 text-blue-700 hover:bg-blue-100"
              title="Buka Menu"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden text-slate-800">
               <span className="text-xs font-black tracking-widest text-primary mr-1">SMART</span>
               <span className="font-black">DKM</span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <ThemeToggle />
            {/* SEARCH */}
            <div className="relative">
              <button 
                onClick={() => { setIsSearchOpen(!isSearchOpen); setIsNotifOpen(false); setIsProfileOpen(false); }}
                className={`p-2 transition-colors lg:flex hidden items-center justify-center ${isSearchOpen ? 'bg-primary/10 text-primary' : 'text-blue-500 hover:text-primary'} rounded-lg`}
              >
                <Search size={20} />
              </button>
              
              {isSearchOpen && (
                <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="relative mb-4">
                     <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                     <input 
                      autoFocus
                      type="text" 
                      placeholder="Cari halaman..." 
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg pl-10 pr-4 py-2.5 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {filteredSearch.map(item => (
                      <button 
                        key={item.href}
                        onClick={() => { router.push(item.href); setIsSearchOpen(false); }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-all flex items-center justify-between group"
                      >
                        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                    {filteredSearch.length === 0 && <p className="text-center py-4 text-[10px] font-bold text-slate-400">Tidak menemukan hasil...</p>}
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsSearchOpen(false); setIsProfileOpen(false); }}
                className={`p-2 relative transition-colors ${isNotifOpen ? 'bg-primary/10 text-primary' : 'text-blue-500 hover:text-primary'} rounded-lg`}
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
              </button>

              {isNotifOpen && (
                <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                   <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notifikasi</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full">3 Baru</span>
                   </div>
                   <div className="p-2 space-y-1">
                      {[
                        { title: 'Zakat Fitrah Baru', desc: 'Amiruddin menyetorkan Zakat Fitrah', time: '2 menit lalu', type: 'zakat' },
                        { title: 'Kas Masjid Update', desc: 'Pemasukan Kotak Jumat Rp 1.250.000', time: '1 jam lalu', type: 'kas' },
                        { title: 'Inventaris', desc: 'Stok beras Gudang A menipis', time: '3 jam lalu', type: 'stock' }
                      ].map((n, i) => (
                        <div key={i} className="p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                           <p className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5 group-hover:text-primary">{n.title}</p>
                           <p className="text-[9px] font-bold text-slate-400 leading-normal">{n.desc}</p>
                           <p className="text-[8px] font-bold text-slate-300 mt-1">{n.time}</p>
                        </div>
                      ))}
                   </div>
                   <button className="w-full py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-t border-slate-100 dark:border-slate-800">Tandai Semua Sudah Dibaca</button>
                </div>
              )}
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <div 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsSearchOpen(false); setIsNotifOpen(false); }}
                className={`h-10 px-1 py-1 pr-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full border ${isProfileOpen ? 'border-primary ring-4 ring-primary/10' : 'border-blue-100 dark:border-slate-800'} flex items-center gap-3 ml-2 group cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 transition-all shadow-sm`}
              >
                 {profile?.avatar_url ? (
                   <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="Profile" />
                 ) : (
                   <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-white font-black text-[10px]">{profile?.name?.charAt(0) || 'U'}</div>
                 )}
                 <div className="hidden md:block">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none mb-0.5">{profile?.name || 'User'}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{profile?.role || 'Guest'}</p>
                 </div>
              </div>

              {isProfileOpen && (
                <div className="absolute top-14 right-0 w-64 bg-background white:bg-slate-900 rounded-lg shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                   {/* Profile Header with Direct Info */}
                   <div className="p-6 text-center bg-card/30 dark:bg-slate-800/20 border-b border-border">
                      <div className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-500 dark:border-slate-800 shadow-xl overflow-hidden bg-blue-100">
                         {profile?.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Large Avatar" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-white font-black text-2xl bg-blue-50 dark:bg-slate-800">{profile?.name?.charAt(0) || 'A'}</div>
                         )}
                      </div>
                      <h3 className="font-black text-foreground text-sm tracking-tight">{profile?.name || 'Ahmad Subarjo'}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{profile?.role || 'Super Admin'}</p>
                      <div className="mt-3 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-border inline-flex items-center gap-2">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-500 lowercase">{profile?.email || 'admin@smartdkm.id'}</span>
                      </div>
                   </div>
                   
                   <div className="p-2 space-y-1">
                      <div className="p-3">
                         <p className="text-[9px] font-black text-primary uppercase tracking-[2px] mb-2 opacity-60">Hak Akses Sistem</p>
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{profile?.role || 'Super Admin'}</span>
                         </div>
                      </div>
                      <div className="h-px bg-border my-1 mx-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-all group"
                      >
                         <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 lg:px-12 py-12 pt-20 lg:pt-24">
        {children}
      </main>

      {/* Floating Active Session (Bottom Right) - Minimalist */}
      {profile && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pointer-events-none select-none">
           <div className="flex flex-col items-end">
              <p className="text-[7px] font-black text-primary uppercase tracking-[3px] opacity-40 leading-none mb-1.5">Sesi Aktif</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none transition-all">{profile.name}</p>
           </div>
           <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
           </div>
        </div>
      )}
    </div>
  );
}
