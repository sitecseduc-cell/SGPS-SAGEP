import { supabase } from '../lib/supabaseClient';

/**
 * Uploads a file to Supabase Storage.
 * @param {File} file - The file object to upload.
 * @param {string} bucket - The storage bucket name (default: 'editais').
 * @param {string} path - Optional specific path (folder/filename). If null, generates a unique name.
 * @returns {Promise<{ url: string, path: string }>} - The public URL and storage path.
 */
export const uploadFile = async (file, bucket = 'editais', path = null) => {
    if (!file) throw new Error("Nenhum arquivo fornecido.");

    const fileExt = file.name.split('.').pop();
    const fileName = path || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error("Erro no upload:", error);
        throw error;
    }

    // Get Public URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
        url: publicData.publicUrl,
        path: filePath
    };
};
