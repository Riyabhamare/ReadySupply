import { StorageInterface } from './storageInterface.js';

/**
 * Production Stub for AWS S3 Storage Adapter.
 * Demonstrates clean pluggability via the StorageInterface.
 * To activate: Set STORAGE_DRIVER=s3 in .env and configure AWS credentials.
 */
export class S3StorageAdapter extends StorageInterface {
  constructor(config = {}) {
    super();
    this.bucket = config.bucket || process.env.AWS_S3_BUCKET || 'readysupply-vault';
    this.region = config.region || process.env.AWS_REGION || 'ap-south-1';
    console.log(`[STORAGE] S3 Driver initialized for bucket: ${this.bucket} (${this.region})`);
  }

  async save({ buffer, originalName, mimeType }) {
    // In production, would use @aws-sdk/client-s3 PutObjectCommand
    console.log(`[STORAGE STUB] Would upload ${originalName} to S3 bucket ${this.bucket}`);
    return {
      filename: `s3-${Date.now()}-${originalName}`,
      storagePath: `s3://${this.bucket}/${Date.now()}-${originalName}`,
      size: buffer ? buffer.length : 0,
    };
  }

  async getStream(storagePath) {
    // In production, would use @aws-sdk/client-s3 GetObjectCommand stream
    throw new Error('S3 driver is in stub mode. Switch STORAGE_DRIVER=local for local development.');
  }

  async delete(storagePath) {
    console.log(`[STORAGE STUB] Would delete ${storagePath} from S3`);
    return true;
  }

  async getSignedAccess(storagePath, expiresInSeconds = 300) {
    // In production, would use @aws-sdk/s3-request-presigner getSignedUrl
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/mock-signed-url?expires=${expiresInSeconds}`;
  }
}

