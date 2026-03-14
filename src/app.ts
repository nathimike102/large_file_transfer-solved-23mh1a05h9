import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { setupMorgan } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import db from './database';
import * as uploadController from './controllers/uploadController';
import { cleanupStaleUploads, startCleanupWorker } from './worker';

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

if (process.env.NODE_ENV !== 'test') {
  startCleanupWorker();
}

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use('/api/', limiter);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.raw({ type: 'application/octet-stream', limit: '100mb' }));
app.use(requestLogger);
setupMorgan(app);

// Routes
app.get('/api/health', (req, res) => {
  try {
    // Check DB
    db.prepare('SELECT 1').get();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      storage: 'connected' // Simplified
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      storage: 'unknown'
    });
  }
});

app.post('/api/testing/run-cleanup', async (req, res) => {
  await cleanupStaleUploads();
  res.status(200).json({ message: 'Cleanup finished' });
});

app.post('/api/upload/init', uploadController.initializeUpload);
app.get('/api/upload/:uploadId/status', uploadController.getUploadStatus);
app.put('/api/upload/:uploadId/chunk/:chunkIndex', uploadController.uploadChunk);
app.post('/api/upload/:uploadId/complete', uploadController.completeUpload);
app.delete('/api/upload/:uploadId', uploadController.cancelUpload);
app.get('/api/download/:fileId', uploadController.downloadFile);

// Error handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
