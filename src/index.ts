import app from './app';
import { logger } from './utils/logger';
import { initDb } from './database';
import { initStorage } from './storage';

(async () => {
  initDb();
  await initStorage();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
})();
