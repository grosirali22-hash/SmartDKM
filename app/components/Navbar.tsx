'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGlobalContext } from '../context/GlobalContext';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  Wallet,
  Clock,
  Package,
  Settings,
  Users,
  BookOpen,
  Film,
  Star,
  Calendar,
  Menu,
  X,
  Type,
  Heart,
  Layers,
  LogOut,
  Monitor,
  User,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Beranda', href: '/dashboard' },
  { icon: Wallet, label: 'Kas Masjid', href: '/keuangan' },
  { icon: Clock, label: 'Jadwal Shalat', href: '/jadwal' },
  { icon: Package, label: 'Inventaris', href: '/inventaris' },
  { icon: Users, label: 'Struktur DKM', href: '/struktur-dkm' },
  { icon: Calendar, label: 'Petugas Shalat', href: '/petugas-shalat' },
  { icon: BookOpen, label: 'Kajian Rutin', href: '/kajian-rutin' },
  { icon: Film, label: 'Media Kajian', href: '/media-kajian' },
  { icon: Star, label: 'Hari Besar (PHBI)', href: '/phbi' },
  { icon: Type, label: 'Running Text', href: '/running-text' },
  { icon: Heart, label: 'Donasi', href: '/donasi' },
  { icon: Wallet, label: 'Zakat', href: '/dashboard/zakat' },
  { icon: Layers, label: 'Konten Slider', href: '/slider' },
  { icon: Clock, label: 'Adzan & Iqomah', href: '/adzan-iqomah' },
  { icon: Settings, label: 'Setelan', href: '/setelan' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { config, setConfig, profile } = useGlobalContext();

  const open = config.isMobileMenuOpen || false;
  const setOpen = (val: boolean) => setConfig({ ...config, isMobileMenuOpen: val });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  const isCollapsed = config.isSidebarCollapsed || false;

  const isAuthPage = pathname?.startsWith('/login');
  const isDisplayPage = pathname?.startsWith('/display');

  // RBAC Filtering Logic
  const filteredNavItems = navItems.filter(item => {
    if (!profile) return true; // Default show all while loading or if no profile
    
    const role = profile.role;
    if (role === 'Super Admin') return true;
    
    if (role === 'Petugas Zakat') {
      return item.label === 'Beranda' || item.label === 'Zakat';
    }
    
    if (role === 'Petugas Masjid') {
      return item.label !== 'Zakat' && item.label !== 'Kas Masjid';
    }
    
    if (role === 'Bendahara Masjid') {
      return item.label === 'Beranda' || item.label === 'Kas Masjid';
    }
    
    return true;
  });

  // Jangan render navbar jika di halaman auth, display, halaman utama (TV), atau saat hidrasi awal
  if (isAuthPage || isDisplayPage || pathname === '/' || !pathname) return null;

  return (
    <>
      {/* Overlay gelap (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-card border-r border-border z-[70] flex flex-col transition-all duration-300 ease-in-out ${config.is_dark_mode ? 'dark' : ''}
          ${open ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} 
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Logo / Brand */}
        <div className={`px-5 h-16 flex items-center border-b border-border/50 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className={`flex items-center justify-between w-full ${isCollapsed ? 'justify-center' : ''}`}>
             {!isCollapsed ? (
               <div className="block">
                 <p className="text-[10px] font-black uppercase tracking-[3px] text-primary leading-none mb-1">Smart</p>
                 <h2 className="text-2xl font-black text-card-foreground tracking-tighter leading-none">DKM</h2>
               </div>
             ) : (
               <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                 <span className="font-black text-[10px] tracking-tighter text-primary-foreground">DKM</span>
               </div>
             )}

             {/* Mobile Close Button */}
             <button onClick={() => setOpen(false)} className="lg:hidden text-muted-foreground hover:text-card-foreground">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-hide">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2 rounded-lg transition-all group overflow-hidden
                  ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-card-foreground'
                  }
                  `}
              >
                <Icon
                  size={16}
                  className={`shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`}
                />
                <span className={`text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer & Logout */}
        <div className="p-4 flex flex-col items-center border-t border-border">
          {/* Display TV Button */}
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-blue-500 transition-all mb-1 hover:bg-blue-50/50
              ${isCollapsed ? 'justify-center' : ''}
              `}
            title="Buka Display TV di tab baru"
          >
            <Monitor size={18} />
            {!isCollapsed && <span className="text-sm font-black uppercase tracking-widest">Display TV</span>}
          </a>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-red-500 transition-all mb-2 hover:bg-red-50/50
              ${isCollapsed ? 'justify-center' : ''}
              `}
            title="Keluar"
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>}
          </button>

          {!isCollapsed && (
            <p className="text-[9px] font-black uppercase tracking-[1px] text-muted-foreground text-center whitespace-nowrap opacity-60">
              © {new Date().getFullYear()} smart dkm by g.a creative
            </p>
          )}
        </div>
      </aside>
    </>
  );
}


