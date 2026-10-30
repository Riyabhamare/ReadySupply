import { env } from '../../config/env.js';
import { LocalPrivateStorage } from './localPrivateStorage.js';
import { S3StorageAdapter } from './s3StorageStub.js';

let storageInstance = null;

export const getStorage = () => {
  if (!storageInstance) {
    if (env.STORAGE_DRIVER === 's3') {
      storageInstance = new S3StorageAdapter();
    } else {
      storageInstance = new LocalPrivateStorage();
    }
  }
  return storageInstance;
};

