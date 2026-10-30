/**
 * Storage Interface defining contracts for storage adapters.
 * All adapters (LocalPrivateStorage, S3, Cloudinary) must implement these methods.
 */
export class StorageInterface {
  /**
   * Save a file buffer or stream.
   * @param {Object} params - { buffer, filename, originalName, mimeType }
   * @returns {Promise<{ filename: string, storagePath: string, size: number }>}
   */
  async save(params) {
    throw new Error('Method save() must be implemented.');
  }

  /**
   * Retrieve file as a readable stream.
   * @param {string} storagePath
   * @returns {Promise<ReadableStream|fs.ReadStream>}
   */
  async getStream(storagePath) {
    throw new Error('Method getStream() must be implemented.');
  }

  /**
   * Delete a stored file.
   * @param {string} storagePath
   * @returns {Promise<boolean>}
   */
  async delete(storagePath) {
    throw new Error('Method delete() must be implemented.');
  }

  /**
   * Optional: Get signed temporary access URL (for S3/Cloudinary).
   * @param {string} storagePath
   * @param {number} expiresInSeconds
   * @returns {Promise<string|null>}
   */
  async getSignedAccess(storagePath, expiresInSeconds = 300) {
    return null;
  }
}

