import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 client
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const BUCKET_URL = process.env.R2_PUBLIC_URL!;

export async function uploadEventImage(file: File, eventId: string) {
  try {
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `events/${eventId}/${Date.now()}.${fileExtension}`;

    const buffer = await file.arrayBuffer();

    await R2.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueFilename,
        Body: Buffer.from(buffer),
        ContentType: file.type,
        ACL: "public-read",
      })
    );

    return `${BUCKET_URL}/${uniqueFilename}`;
  } catch (error) {
    console.error("Failed to upload image to R2:", error);
    throw new Error("Failed to upload image");
  }
}