import express from 'express';
import dotenv from 'dotenv';
import { setupMorgan } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import * as uploadController from './controllers/uploadController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: 'application/octet-stream', limit: '100mb' }));
setupMorgan(app);

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
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
