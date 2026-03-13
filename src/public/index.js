const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const fileNameDisplay = document.getElementById('file-name-display');
const chunkInfo = document.getElementById('chunk-info');
const fileList = document.getElementById('file-list');
const noFiles = document.getElementById('no-files');

const API_BASE = '/api';
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

// Drag & Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

dropZone.addEventListener('dragover', () => dropZone.classList.add('dragging'));
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', e => {
  dropZone.classList.remove('dragging');
  const file = e.dataTransfer.files[0];
  if (file) handleFileUpload(file);
});

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFileUpload(file);
});

async function handleFileUpload(file) {
  progressContainer.style.display = 'block';
  fileNameDisplay.textContent = file.name;
  progressFill.style.width = '0%';
  progressPercent.textContent = '0%';

  try {
    // 1. Initialize
    const initRes = await fetch(`${API_BASE}/upload/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileSize: file.size })
    });
    const { uploadId } = await initRes.json();
    
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    // 2. Upload Chunks
    for (let i = 0; i < totalChunks; i++) {
      chunkInfo.textContent = `Uploading chunk ${i + 1} of ${totalChunks}...`;
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      await fetch(`${API_BASE}/upload/${uploadId}/chunk/${i}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: chunk
      });

      const progress = Math.round(((i + 1) / totalChunks) * 100);
      progressFill.style.width = `${progress}%`;
      progressPercent.textContent = `${progress}%`;
    }

    // 3. Complete
    chunkInfo.textContent = 'Assembling file...';
    const completeRes = await fetch(`${API_BASE}/upload/${uploadId}/complete`, {
      method: 'POST'
    });
    const result = await completeRes.json();
    
    addFileToList(result);
    chunkInfo.textContent = 'Upload complete!';
  } catch (error) {
    console.error('Upload failed:', error);
    chunkInfo.textContent = 'Upload failed. See console for details.';
    chunkInfo.style.color = '#ef4444';
  }
}

function addFileToList(file) {
  noFiles.style.display = 'none';
  const item = document.createElement('div');
  item.className = 'file-item';
  item.innerHTML = `
    <div class="file-info">
      <h3>${file.fileName}</h3>
      <p>${(file.fileSize / 1024 / 1024).toFixed(2)} MB • ${file.status}</p>
    </div>
    <a href="${API_BASE}/download/${file.fileId}" class="btn" style="padding: 0.5rem 1rem">
      <i class="fas fa-download"></i> Download
    </a>
  `;
  fileList.prepend(item);
}
