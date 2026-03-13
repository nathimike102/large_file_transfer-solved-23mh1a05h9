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
git clone <repository-url>
cd p4

# Create environment file
cp .env.example .env

# Start the services
docker-compose up -d
```

## API Documentation

The API documentation will be updated as endpoints are implemented.
