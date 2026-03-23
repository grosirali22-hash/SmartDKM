'use client';

import NexusDataTable from '../components/ui/NexusDataTable';
import Badge from '../components/ui/Badge';
import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FileUpload from '../components/FileUpload';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { deleteMedia } from '../lib/uploadMedia';
import { Trash2, Play, FileAudio, FileVideo, Image as ImageIcon, X } from 'lucide-react';

interface MediaItem {
  id: string;
  judul: string;
  tipe: 'audio' | 'video' | 'image';
  file_url: string;
  ukuran: string;
  deskripsi: string;
}

export default function MediaKajianPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [newJudul, setNewJudul] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedTipe, setUploadedTipe] = useState<'audio' | 'video' | 'image'>('image');
  const [uploadedSize, setUploadedSize] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploaded = (url: string, file: File) => {
    setUploadedUrl(url);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedSize(`${sizeMB} MB`);

    if (file.type.startsWith('audio/')) setUploadedTipe('audio');
    else if (file.type.startsWith('video/')) setUploadedTipe('video');
    else setUploadedTipe('image');
  };

  const handleSave = async () => {
    if (!uploadedUrl || !newJudul.trim()) return;
    const { error } = await supabase.from('media').insert({
      judul: newJudul.trim(),
      tipe: uploadedTipe,
      file_url: uploadedUrl,
      ukuran: uploadedSize,
      deskripsi: newDeskripsi.trim(),
    });

    if (error) {
      alert('Gagal menyimpan media: ' + error.message);
    } else {
      resetForm();
      fetchData();
    }
  };

  const resetForm = () => {
    setNewJudul('');
    setNewDeskripsi('');
    setUploadedUrl('');
    setUploadedSize('');
    setShowUpload(false);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Hapus "${item.judul}"?`)) return;
    await deleteMedia(item.file_url);
    const { error } = await supabase.from('media').delete().eq('id', item.id);
    if (error) {
      alert('Gagal menghapus media: ' + error.message);
    } else {
      fetchData();
    }
  };

  const getIcon = (tipe: string) => {
    if (tipe === 'audio') return <FileAudio className="w-5 h-5 text-blue-500" />;
    if (tipe === 'video') return <FileVideo className="w-5 h-5 text-blue-500" />;
    return <ImageIcon className="w-5 h-5 text-purple-500" />;
  };

  const TIPE_COLORS: Record<string, string> = {
    audio: 'bg-blue-100 text-blue-700',
    video: 'bg-blue-100 text-blue-700',
    image: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6 pt-4">
      <SectionTitle title="Media Kajian" subtitle="Audio, Video & Gambar" />

      {/* Toggle Upload Form */}
      {!showUpload ? (
        <Button variant="outline" className="border-solid border-2" onClick={() => setShowUpload(true)}>
          + Upload File Media
        </Button>
      ) : (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground">Upload Media Baru</h3>
            <button onClick={resetForm} className="p-1 hover:bg-secondary rounded-full">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <Input
            label="Judul"
            placeholder="Judul file media..."
            value={newJudul}
            onChange={(e) => setNewJudul(e.target.value)}
          />
          <Input
            label="Deskripsi (opsional)"
            placeholder="Deskripsi singkat..."
            value={newDeskripsi}
            onChange={(e) => setNewDeskripsi(e.target.value)}
          />
          <FileUpload
            accept="audio/*,video/*,image/*"
            folder="kajian"
            onUploaded={handleUploaded}
            label="Pilih File"
          />
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-500 text-xs shrink-0 mt-0.5">ℹ️</span>
            <div className="text-xs font-bold text-blue-700 space-y-0.5">
              <p>🖼 <strong>Gambar</strong>: 1280 × 720px (16:9) • Maks 2 MB • JPG, PNG</p>
              <p>🎬 <strong>Video</strong>: Maks 50 MB • Format MP4/WebM</p>
              <p>🎵 <strong>Audio</strong>: Maks 20 MB • Format MP3/WAV</p>
            </div>
          </div>
          {uploadedUrl && (
            <Button variant="success" onClick={handleSave}>
              Simpan Media
            </Button>
          )}
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
          <p className="text-lg font-black text-blue-700">{items.filter((i) => i.tipe === 'audio').length}</p>
          <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Audio</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
          <p className="text-lg font-black text-blue-700">{items.filter((i) => i.tipe === 'video').length}</p>
          <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Video</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 text-center">
          <p className="text-lg font-black text-purple-700">{items.filter((i) => i.tipe === 'image').length}</p>
          <p className="text-[9px] font-bold text-purple-500 uppercase tracking-widest">Gambar</p>
        </div>
      </div>

      <NexusDataTable
        title="Pustaka Media Kajian"
        data={items}
        isLoading={loading}
        itemsPerPage={10}
        onDelete={(item) => handleDelete(item)}
        columns={[
          { 
            header: 'Tipe', 
            width: '100px',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                {getIcon(item.tipe)}
                <Badge variant={item.tipe === 'image' ? 'info' : 'success'}>
                  <span className="text-[8px] uppercase font-black leading-none">{item.tipe}</span>
                </Badge>
              </div>
            ),
            sortable: true
          },
          { 
            header: 'Informasi Media', 
            accessor: (item) => (
              <div className="flex flex-col max-w-xs">
                <span className="text-[11px] font-black truncate leading-none">{item.judul}</span>
                {item.deskripsi && <span className="text-[9px] text-muted-foreground truncate mt-1">{item.deskripsi}</span>}
                <div className="flex items-center gap-2 mt-1.5">
                   <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.ukuran}</span>
                </div>
              </div>
            ),
            sortable: true
          },
          { 
            header: 'Preview & Kontrol', 
            width: '200px',
            accessor: (item) => (
              <div className="flex flex-col gap-2">
                {item.tipe === 'image' ? (
                  <div className="w-24 aspect-video bg-muted rounded-lg overflow-hidden border border-border shadow-sm">
                    <img src={item.file_url} alt={item.judul} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button
                    onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black hover:bg-blue-100 transition-all w-fit"
                  >
                    <Play size={10} fill="currentColor" /> {playingId === item.id ? 'STOP' : 'PLAY PREVIEW'}
                  </button>
                )}

                {playingId === item.id && item.tipe !== 'image' && (
                  <div className="mt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    {item.tipe === 'audio' && <audio src={item.file_url} controls autoPlay className="h-8 w-full" />}
                    {item.tipe === 'video' && <video src={item.file_url} controls autoPlay className="w-full rounded-lg max-h-32 bg-black" />}
                  </div>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
