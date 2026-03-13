import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../database';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/errors';

const initSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  chunkSize: z.number().positive().optional(),
});

export const initializeUpload = async (req: Request, res: Response) => {
  const result = initSchema.safeParse(req.body);
  
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }

  const { fileName, fileSize, chunkSize: providedChunkSize } = result.data;
  const chunkSize = providedChunkSize || parseInt(process.env.CHUNK_SIZE || '5242880');
  const totalChunks = Math.ceil(fileSize / chunkSize);
  const uploadId = uuidv4();
  const createdAt = new Date().toISOString();

  logger.info(`Initializing upload: ${uploadId} for file: ${fileName} (${fileSize} bytes)`);

  const stmt = db.prepare(`
    INSERT INTO uploads (id, file_name, file_size, chunk_size, total_chunks, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
  `);

  stmt.run(uploadId, fileName, fileSize, chunkSize, totalChunks, createdAt);

  res.status(201).json({
    uploadId,
    chunkSize,
    totalChunks
  });
};
