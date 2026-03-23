'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ChevronRight, LayoutDashboard } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Petugas Masjid');
  const [file, setFile] = useState<File | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Signup user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Gagal mendaftar.");

      // 2. Upload photo if exists
      let avatarUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${authData.user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Gagal upload foto:", uploadError.message);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);
          avatarUrl = publicUrl;
        }
      }

      // 3. Update profile with avatar_url (Trigger already created profile, just update it)
      if (avatarUrl) {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', authData.user.id);
      }

      alert("Pendaftaran Berhasil! Silakan masuk.");
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 shadow-xl shadow-blue-500/30 text-white mb-6">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">SmartDKM</h1>
          <p className="text-muted-foreground font-medium mt-2">
            {mode === 'login' ? 'Masuk ke Panel Administrasi' : 'Daftar Akun Petugas Baru'}
          </p>
        </div>

        <div className="bg-card/70 backdrop-blur-xl border border-white p-5 rounded-lg shadow-2xl shadow-slate-200/50">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1 ml-1 uppercase tracking-widest text-[9px]">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Contoh: Ahmad Subarjo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1 ml-1 uppercase tracking-widest text-[9px]">Hak Akses / Kategori</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="Petugas Masjid">Petugas Masjid</option>
                    <option value="Petugas Zakat">Petugas Zakat</option>
                    <option value="Bendahara Masjid">Bendahara Masjid</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1 ml-1 uppercase tracking-widest text-[9px]">Foto Profil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-foreground mb-1 ml-1 uppercase tracking-widest text-[9px]">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg text-foreground font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="email@masjid.id"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-1 ml-1 uppercase tracking-widest text-[9px]">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg text-foreground font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-between items-center bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-5 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:pointer-events-none"
            >
              <span>{loading ? 'Memproses...' : mode === 'login' ? 'Masuk Dashboard' : 'Daftar Sekarang'}</span>
              <div className="w-8 h-8 rounded-full bg-card/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[10px] font-black uppercase tracking-[2px] text-muted-foreground hover:text-blue-500 transition-colors"
              >
                {mode === 'login' ? 'Belum Punya Akun? Daftar Disini' : 'Sudah Punya Akun? Masuk Disini'}
              </button>
            </div>
            
          </form>
        </div>
        
        <p className="text-center text-[8px] font-black text-muted-foreground uppercase tracking-[4px] mt-12">
          Powered by SmartDKM System &copy; {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}



