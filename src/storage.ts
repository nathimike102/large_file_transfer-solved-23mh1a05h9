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

const s3Client = new S3Client({
  endpoint,
  region: process.env.STORAGE_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

export const initStorage = async () => {
  logger.info(`Initializing storage (MinIO)... Bucket: ${UPLOAD_BUCKET}`);
  
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: UPLOAD_BUCKET }));
    logger.info(`Bucket '${UPLOAD_BUCKET}' already exists.`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      logger.info(`Bucket '${UPLOAD_BUCKET}' not found. Creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: UPLOAD_BUCKET }));
      logger.info(`Bucket '${UPLOAD_BUCKET}' created successfully.`);
    } else {
      logger.error('Error checking/creating bucket:', error);
      throw error;
    }
  }
};

export default s3Client;
