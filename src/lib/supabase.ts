import { createClient } from '@supabase/supabase-js';

const RAW_SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bplrgkftoofvdrrpnefk.supabase.co';

// Normalize URL: strip trailing /rest/v1/ if present so Auth, Storage, and Realtime endpoints resolve properly
export const SUPABASE_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Iu6xoLvFpTVRdC35QgrbRQ_Q_3cgJKs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const STORAGE_BUCKET = 'product-images';

/**
 * Compress/resize smartphone camera & gallery photos cleanly on canvas
 * so high-resolution mobile photos upload rapidly to Supabase Storage.
 */
async function compressImageFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('이미지 파일을 읽을 수 없습니다.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('지원하지 않는 이미지 형식입니다.'));
      img.onload = () => {
        const MAX_DIM = 1200;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('이미지 변환에 실패했습니다.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 압축에 실패했습니다.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.84
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload photo directly to the public Supabase Storage bucket `product-images`
 * and return its public URL so all visiting students see the uploaded image immediately.
 */
export async function uploadProductImageToSupabase(
  file: File,
  userId: string
): Promise<string> {
  const compressedBlob = await compressImageFile(file);
  const safeName =
    file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 24) || 'photo';
  const filePath = `${userId}/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}_${safeName}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, compressedBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    if (
      uploadError.message.toLowerCase().includes('bucket') ||
      uploadError.message.toLowerCase().includes('not found')
    ) {
      throw new Error(
        'Supabase Storage에 product-images 버킷이 없습니다. SQL 설정 스크립트를 먼저 실행해 주세요.'
      );
    }
    throw new Error(`사진 업로드 실패: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('업로드된 이미지의 공개 URL을 가져오지 못했습니다.');
  }

  return data.publicUrl;
}
