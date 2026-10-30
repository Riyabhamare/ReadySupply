import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { StorageInterface } from './storageInterface.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LocalPrivateStorage extends StorageInterface {
  constructor() {
    super();
    // Files are saved outside any static public folder
    this.uploadDir = path.resolve(__dirname, '../../uploads/private');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save({ buffer, originalName, mimeType }) {
    const ext = path.extname(originalName) || '.bin';
    const randomName = `${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(this.uploadDir, randomName);

    await fs.promises.writeFile(targetPath, buffer);
    const stats = await fs.promises.stat(targetPath);

    return {
      filename: randomName,
      storagePath: targetPath,
      size: stats.size,
    };
  }

  async getStream(storagePath) {
    // Prevent path traversal
    const safePath = path.resolve(storagePath);
    if (!safePath.startsWith(this.uploadDir)) {
      throw new Error('Access denied: Invalid storage path outside upload directory');
    }

    if (!fs.existsSync(safePath)) {
      throw new Error('File not found in storage');
    }

    return fs.createReadStream(safePath);
  }

  async delete(storagePath) {
    const safePath = path.resolve(storagePath);
    if (!safePath.startsWith(this.uploadDir)) {
      throw new Error('Access denied: Invalid storage path outside upload directory');
    }

    if (fs.existsSync(safePath)) {
      await fs.promises.unlink(safePath);
      return true;
    }
    return false;
  }

  async getSignedAccess(storagePath, expiresInSeconds = 300) {
    // Local storage does not serve files directly via static URL;
    // authenticated streaming route is used instead.
    return null;
  }
}

