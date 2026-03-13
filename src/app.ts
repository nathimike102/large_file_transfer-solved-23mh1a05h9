import express from 'express';
import dotenv from 'dotenv';
import { setupMorgan } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import * as uploadController from './controllers/uploadController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
setupMorgan(app);

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/upload/init', uploadController.initializeUpload);

// Error handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
