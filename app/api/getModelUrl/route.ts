// src/app/api/getModelUrl/route.ts
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '@/lib/r2';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const modelCommand = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: 'models/SDM2.gltf', // your model path
    });

    const modelSignedUrl = await getSignedUrl(r2Client, modelCommand, { expiresIn: 3600 });

    return NextResponse.json({ modelUrl: modelSignedUrl });
  } catch (error) {
    console.error('Error fetching model URL:', error);
    return NextResponse.json({ error: 'Failed to get model URL' }, { status: 500 });
  }
}
