import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';

async function runTest() {
  console.log('--- Starting Integration Test ---');

  try {
    // 1. Health check
    console.log('\nChecking health...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('Health:', health.data);

    // 2. Initialize upload
    console.log('\nInitializing upload...');
    const init = await axios.post(`${API_URL}/upload/init`, {
      fileName: 'test-file.txt',
      fileSize: 1024 * 1024 * 5, // 5MB
    });
    const { uploadId } = init.data;
    console.log('Upload ID:', uploadId);

    // 3. Upload chunk
    console.log('\nUploading chunk 0...');
    const chunkData = Buffer.alloc(1024 * 1024 * 5, 'a');
    await axios.put(`${API_URL}/upload/${uploadId}/chunk/0`, chunkData, {
      headers: { 'Content-Type': 'application/octet-stream' }
    });
    console.log('Chunk uploaded.');

    // 4. Check status
    console.log('\nChecking status...');
    const status = await axios.get(`${API_URL}/upload/${uploadId}/status`);
    console.log('Status:', status.data);

    // 5. Complete upload
    console.log('\nCompleting upload...');
    const complete = await axios.post(`${API_URL}/upload/${uploadId}/complete`);
    console.log('Complete:', complete.data);

    // 6. Download
    console.log('\nDownloading file...');
    const download = await axios.get(`${API_URL}/download/${uploadId}`, {
      responseType: 'arraybuffer'
    });
    console.log('Downloaded bytes:', download.data.byteLength);

    console.log('\n--- Test Finished Successfully ---');
  } catch (err: any) {
    console.error('Test failed:', err.response?.data || err.message);
  }
}

runTest();
