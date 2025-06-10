
import { MinioConfig, UploadOptions } from './types';
import { MinioAuth } from './auth';
import { MinioUploadOperations } from './uploadOperations';
import { MinioDeleteOperations } from './deleteOperations';
import { MinioListOperations } from './listOperations';
import { MinioTestOperations } from './testOperations';

export class MinioClient {
  private config: MinioConfig;
  private auth: MinioAuth;
  private uploadOps: MinioUploadOperations;
  private deleteOps: MinioDeleteOperations;
  private listOps: MinioListOperations;
  private testOps: MinioTestOperations;

  constructor(config: MinioConfig) {
    this.config = config;
    this.auth = new MinioAuth();
    this.uploadOps = new MinioUploadOperations(config, this.auth);
    this.deleteOps = new MinioDeleteOperations(config, this.auth);
    this.listOps = new MinioListOperations(config, this.auth);
    this.testOps = new MinioTestOperations(config, this.auth);
  }

  async testConnection(): Promise<boolean> {
    return this.testOps.testConnection();
  }

  async uploadFile(file: File, options: UploadOptions = {}): Promise<string> {
    return this.uploadOps.uploadFile(file, options);
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    return this.deleteOps.deleteFile(fileUrl);
  }

  getFilePreviewUrl(fileUrl: string): string {
    return this.listOps.getFilePreviewUrl(fileUrl);
  }

  async fileExists(fileUrl: string): Promise<boolean> {
    return this.listOps.fileExists(fileUrl);
  }

  async listFiles(prefix: string = ''): Promise<any[]> {
    return this.listOps.listFiles(prefix);
  }

  async testUpload(): Promise<boolean> {
    return this.uploadOps.testUpload();
  }
}
