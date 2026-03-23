'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, FileAudio, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadMedia } from '../lib/uploadMedia';

interface FileUploadProps {
  accept?: string; // e.g. 'audio/*,video/*,image/*'
  folder?: string;
  onUploaded: (url: string, file: File) => void;
  label?: string;
  className?: string;
}

export default function FileUpload({
  accept = 'audio/*,video/*,image/*',
  folder = 'general',
  onUploaded,
  label = 'Upload File',
  className = '',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    // Determine type and set preview
    if (file.type.startsWith('image/')) {
      setPreviewType('image');
      setPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('video/')) {
      setPreviewType('video');
      setPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('audio/')) {
      setPreviewType('audio');
      setPreview(URL.createObjectURL(file));
    } else {
      setPreviewType(null);
      setPreview(null);
    }

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const { url, error: uploadError } = await uploadMedia(file, folder);
    setUploading(false);

    if (uploadError) {
      setError(uploadError);
      return;
    }
    onUploaded(url, file);
  };

  const clearPreview = () => {
    setPreview(null);
    setPreviewType(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const getIcon = () => {
    if (previewType === 'audio') return <FileAudio className="w-8 h-8 text-blue-500" />;
    if (previewType === 'video') return <FileVideo className="w-8 h-8 text-blue-500" />;
    if (previewType === 'image') return <ImageIcon className="w-8 h-8 text-purple-500" />;
    return <Upload className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div className={`${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview && !uploading ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-solid border-slate-200 hover:border-blue-400 rounded-lg p-5 flex flex-col items-center gap-3 transition-all hover:bg-blue-50/50 group"
        >
          <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">
            {label}
          </span>
          <span className="text-[10px] text-slate-300">Audio, Video, atau Gambar</span>
        </button>
      ) : (
        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 relative">
          {/* Close button */}
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
          </button>

          <div className="flex items-center gap-4">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">{fileName}</p>
              {uploading && (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  <span className="text-xs text-blue-600 font-bold">Mengupload...</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {preview && previewType === 'image' && (
            <img src={preview} alt="Preview" className="mt-3 rounded-lg max-h-40 object-cover w-full" />
          )}
          {preview && previewType === 'video' && (
            <video src={preview} controls className="mt-3 rounded-lg max-h-40 w-full" />
          )}
          {preview && previewType === 'audio' && (
            <audio src={preview} controls className="mt-3 w-full" />
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-bold mt-2">⚠ {error}</p>
      )}
    </div>
  );
}


