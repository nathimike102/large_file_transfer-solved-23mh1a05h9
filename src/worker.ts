import db from './database';
import { logger } from './utils/logger';
import s3Client from './storage';
import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const cleanupStaleUploads = async () => {
  logger.info('Starting background cleanup of stale uploads...');

  const threshold = Date.now() - parseInt(process.env.STALE_UPLOAD_THRESHOLD || '86400000');
  const thresholdDate = new Date(threshold).toISOString();

  const staleUploads = db.prepare("SELECT id FROM uploads WHERE status != 'COMPLETED' AND created_at < ?")
    .all(thresholdDate) as any[];

  logger.info(`Found ${staleUploads.length} stale uploads to clean.`);

  for (const upload of staleUploads) {
    try {
      logger.info(`Cleaning up upload: ${upload.id}`);
      
      // Delete chunks from MinIO (simplified)
      // In a real app, we'd list and delete all with prefix `temp/${upload.id}/`
      
      db.prepare('DELETE FROM uploads WHERE id = ?').run(upload.id);
    } catch (error) {
      logger.error(`Error cleaning up upload ${upload.id}:`, error);
    }
  }

  logger.info('Background cleanup finished.');
};

export const startCleanupWorker = () => {
  // Run every hour
  setInterval(() => {
    cleanupStaleUploads().catch(err => logger.error('Cleanup worker error:', err));
  }, 3600000);
};
