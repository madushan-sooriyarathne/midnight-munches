import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@midnightmunches/env/r2';

const EXPIRES_IN_SECONDS = 300;

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  // Otherwise the SDK signs a CRC32 checksum of an empty body into the URL, which a browser
  // upload of the real file can never match.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

/** Presigned PUT bound to one key, content type and exact byte size. */
export async function presignUpload(key: string, contentType: string, size: number) {
  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    }),
    // R2 has no presigned POST (content-length-range), so signing Content-Length is the size cap.
    { expiresIn: EXPIRES_IN_SECONDS, signableHeaders: new Set(['content-type', 'content-length']) },
  );

  return {
    uploadUrl,
    publicUrl: new URL(key, env.R2_PUBLIC_DOMAIN).href,
    key,
    expiresIn: EXPIRES_IN_SECONDS,
  };
}
