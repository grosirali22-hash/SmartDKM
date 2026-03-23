import { supabase } from './supabase';

/**
 * Upload file ke Supabase Storage bucket 'media'
 * @returns public URL dari file yang diupload
 */
export async function uploadMedia(
  file: File,
  folder: string = 'general'
): Promise<{ url: string; error: string | null }> {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = `${folder}/${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: '', error: uploadError.message };
    }

    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: '', error: err.message || 'Upload gagal' };
  }
}

/**
 * Hapus file dari Supabase Storage bucket 'media'
 */
export async function deleteMedia(fileUrl: string): Promise<{ error: string | null }> {
  try {
    // Extract path from full URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/media/');
    if (pathParts.length < 2) return { error: 'Invalid file URL' };

    const filePath = decodeURIComponent(pathParts[1]);
    const { error } = await supabase.storage.from('media').remove([filePath]);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Hapus gagal' };
  }
}
