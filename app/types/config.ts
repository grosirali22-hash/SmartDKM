export interface GlobalConfig {
  nama_masjid: string;
  running_text: string;
  alamat?: string;
  isSidebarCollapsed?: boolean;
  isMobileMenuOpen?: boolean;
  is_dark_mode?: boolean;
  tema_warna?: string;
  is_soft_ui?: boolean;
  display_layout?: 'default' | 'website';
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}
