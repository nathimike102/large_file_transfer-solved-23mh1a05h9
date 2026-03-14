# Large File Transfer Service

A high-performance, memory-efficient file transfer service with chunked/resumable uploads and background job management.

## Features

- **Chunked Uploads**: Large files are split into smaller chunks for reliability.
- **Resumable**: Uploads can be paused and resumed from where they left off.
- **Memory Efficient**: Uses Node.js streams to handle large file assembly without loading into RAM.
- **Docker Orchestrated**: Simple one-command startup with Docker Compose.
- **Background Cleanup**: Automatically removes stale or incomplete uploads.

## Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Database**: SQLite (better-sqlite3)
- **Object Storage**: MinIO (S3-compatible)
- **Validation**: Zod
- **Infrastructure**: Docker, Docker Compose

## Quick Start

```bash
# Clone the repository
git clone git@github.com:nathimike102/large_file_transfer-solved-23mh1a05h9.git
cd large_file_transfer-solved-23mh1a05h9

# Create environment file
cp .env.example .env

# Start the services
docker-compose up -d
```

## API Endpoints

### Health
- `GET /api/health`: Check system status (DB, Storage).

### Uploads
- `POST /api/upload/init`: Initialize an upload.
  - Body: `{ "fileName": "string", "fileSize": number, "chunkSize": number (optional) }`
- `GET /api/upload/:uploadId/status`: Check which chunks are uploaded.
- `PUT /api/upload/:uploadId/chunk/:chunkIndex`: Upload a binary chunk (`application/octet-stream`).
- `POST /api/upload/:uploadId/complete`: Finalize the upload and assemble chunks.
- `DELETE /api/upload/:uploadId`: Cancel an upload and clean up.

### Downloads
- `GET /api/download/:fileId`: Stream the final file.

### Maintenance
- `POST /api/testing/run-cleanup`: Manually trigger the stale upload cleanup worker.

## Development & Verification

1.  **Run with Docker**: `docker-compose up --build`
2.  **Run Locally**: `npm install && npm run dev`
3.  **Test the Flow**: `npm run test` (uses `src/test-client.ts`)

## Production Deployment

To deploy the service in a production environment:

1.  **Environment Variables**: Ensure `.env` is properly configured with production secrets and endpoints.
2.  **Docker Compose**: Use `docker-compose up -d --build` to launch the API and MinIO.
3.  **Reverse Proxy**: It is recommended to use a reverse proxy like Nginx or Caddy to handle SSL and exposure on port 80/443.
4.  **Data Persistence**: The `data` directory and `minio_data` volume should be backed up regularly.

## Licensing
MIT

