import { S3Client } from '@aws-sdk/client-s3';
import { logger } from './utils/logger';

const s3Client = new S3Client({
  endpoint: `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

export const initStorage = async () => {
  logger.info('Initializing storage (MinIO)...');
  // In a real app, we might check if the bucket exists and create it if not.
  // For this project, we'll assume it's handled or implemented in the complete step.
  logger.info('Storage client initialized.');
};

export default s3Client;
