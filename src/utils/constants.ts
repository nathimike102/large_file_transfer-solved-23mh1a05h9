export const STALE_UPLOAD_THRESHOLD = 86400000;
export const DEFAULT_CHUNK_SIZE = 5242880;
export const UPLOAD_BUCKET = process.env.STORAGE_BUCKET_NAME || 'uploads';

export const getTempChunkKey = (uploadId: string, chunkIndex: number) => `temp/${uploadId}/${chunkIndex}`;
export const getFinalFileKey = (fileId: string) => `final/${fileId}`;
