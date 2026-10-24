import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { supabaseAdmin } from '../../../../lib/supabase/admin.ts';
import fs from 'node:fs/promises';
import path from 'node:path';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No image file was provided for upload.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image exceeds maximum allowed size of 10MB.' },
        { status: 400 }
      );
    }

    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image format (${mimeType || 'unknown'}). Allowed: JPG, PNG, WEBP, GIF, SVG.` },
        { status: 400 }
      );
    }

    // Determine clean file extension
    const originalExt = path.extname(file.name).toLowerCase();
    const safeExt = originalExt && ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(originalExt)
      ? originalExt
      : (EXTENSION_MAP[mimeType] || '.jpg');

    // Generate unique filename
    const cleanBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30) || 'product';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${cleanBase}-${timestamp}-${randomSuffix}${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalUrl: string | null = null;

    // 1. Primary: Upload to Supabase Storage 'products' bucket
    try {
      const { data, error: uploadError } = await supabaseAdmin.storage
        .from('products')
        .upload(filename, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError && data) {
        const { data: pubData } = supabaseAdmin.storage
          .from('products')
          .getPublicUrl(filename);

        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl;
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (sbErr) {
      console.warn('Supabase storage upload attempt skipped or failed:', sbErr);
    }

    // 2. Fallback: Save to local public/images/products folder if cloud upload didn't succeed
    if (!finalUrl) {
      // In serverless environments like Vercel, the local filesystem is read-only
      const isServerlessReadOnly = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      if (isServerlessReadOnly) {
        return NextResponse.json(
          {
            error:
              'Cloud storage upload failed and local filesystem is read-only on Vercel. Please ensure the Supabase "products" storage bucket is configured and accessible.',
          },
          { status: 502 }
        );
      }

      try {
        const publicDir = path.join(process.cwd(), 'public', 'images', 'products');
        await fs.mkdir(publicDir, { recursive: true });
        const filePath = path.join(publicDir, filename);
        await fs.writeFile(filePath, buffer);
        finalUrl = `/images/products/${filename}`;
      } catch (fsErr: any) {
        throw new Error(`Failed to save image locally and in cloud storage: ${fsErr?.message || fsErr}`);
      }
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      filename,
      size: file.size,
      type: mimeType,
      message: 'Product image uploaded successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error processing product image upload.' },
      { status: 500 }
    );
  }
}
