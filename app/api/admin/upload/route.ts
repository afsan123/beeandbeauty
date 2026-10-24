import { NextResponse } from 'next/server.js';
import { randomToken } from '../../../../lib/security/crypto.ts';
import { isAdminGuardResponse, requireAdmin } from '../../../../lib/security/requireAdmin.ts';
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_EXTENSION_MAP,
  MAX_UPLOAD_BYTES,
} from '../../../../lib/services/uploadPolicy.ts';
import { assertSupabaseAdminConfigured, tryGetSupabaseAdmin } from '../../../../lib/supabase/admin.ts';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (isAdminGuardResponse(guard)) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No image file was provided for upload.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Image exceeds maximum allowed size of 10MB.' },
        { status: 400 }
      );
    }

    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image format (${mimeType || 'unknown'}). Allowed: JPG, PNG, WEBP, GIF.` },
        { status: 400 }
      );
    }

    const originalExt = path.extname(file.name).toLowerCase();
    const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(originalExt)
      ? originalExt
      : IMAGE_EXTENSION_MAP[mimeType] || '.jpg';

    const filename = `${randomToken(16)}${safeExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalUrl: string | null = null;
    const admin = tryGetSupabaseAdmin();
    if (admin) {
      try {
        const { data, error: uploadError } = await admin.storage
          .from('products')
          .upload(filename, buffer, {
            contentType: mimeType,
            upsert: false,
          });

        if (!uploadError && data) {
          const { data: pubData } = admin.storage.from('products').getPublicUrl(filename);
          if (pubData?.publicUrl) {
            finalUrl = pubData.publicUrl;
          }
        } else if (uploadError) {
          console.warn('Supabase storage upload error:', uploadError.message);
        }
      } catch (sbErr) {
        console.warn('Supabase storage upload attempt skipped or failed:', sbErr);
      }
    }

    if (!finalUrl) {
      const isServerlessReadOnly = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      if (isServerlessReadOnly) {
        assertSupabaseAdminConfigured();
        return NextResponse.json(
          {
            error:
              'Cloud storage upload failed. Confirm the Supabase "products" bucket exists and SUPABASE_SERVICE_ROLE_KEY is set.',
          },
          { status: 502 }
        );
      }

      const publicDir = path.join(process.cwd(), 'public', 'images', 'products');
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, filename), buffer);
      finalUrl = `/images/products/${filename}`;
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      filename,
      size: file.size,
      type: mimeType,
      message: 'Product image uploaded successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error processing product image upload.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
