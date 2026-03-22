import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { logger } from './utils/logger';
import { UPLOAD_BUCKET } from './utils/constants';

let endpoint: string | undefined = undefined;

if (process.env.STORAGE_ENDPOINT) {
  if (process.env.STORAGE_ENDPOINT.startsWith('http')) {
    endpoint = process.env.STORAGE_ENDPOINT;
  } else {
    const useSSL = process.env.STORAGE_USE_SSL === 'true';
    const port = process.env.STORAGE_PORT ? `:${process.env.STORAGE_PORT}` : '';
    endpoint = `http${useSSL ? 's' : ''}://${process.env.STORAGE_ENDPOINT}${port}`;
  }
}

const isR2 = process.env.STORAGE_ENDPOINT?.includes('r2.cloudflarestorage.com');

const s3Client = new S3Client({
  endpoint,
  region: isR2 ? 'auto' : (process.env.STORAGE_REGION || 'us-east-1'),
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: isR2 ? false : true,
});
export const initStorage = async () => {
  logger.info(`Initializing storage... Bucket: ${UPLOAD_BUCKET}`);
  
  if (isR2) {
    logger.info(`R2 detected. Skipping bucket auto-creation as R2 buckets should be created via dashboard.`);
    return;
  }

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: UPLOAD_BUCKET }));
    logger.info(`Bucket '${UPLOAD_BUCKET}' already exists.`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      logger.info(`Bucket '${UPLOAD_BUCKET}' not found. Creating...`);
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: UPLOAD_BUCKET }));
        logger.info(`Bucket '${UPLOAD_BUCKET}' created successfully.`);
      } catch (createError: any) {
        logger.warn(`Failed to create bucket '${UPLOAD_BUCKET}'. It may already exist or you may lack permissions.`, createError);
      }
    } else if (error.$metadata?.httpStatusCode === 301) {
      logger.warn(`Bucket '${UPLOAD_BUCKET}' returned a 301 (Moved Permanently). This is common with MinIO. Continuing...`);
    } else {
      logger.error('Error checking/creating bucket:', error);
      throw error;
    }
  }
};

export default s3Client;
