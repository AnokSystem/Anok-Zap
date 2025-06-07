
import { MinioClient } from './client';
import { MinioConfig } from './types';

class MinioService {
  private client: MinioClient;

  constructor() {
    const config: MinioConfig = {
      serverUrl: 'https://s3.novahagencia.com.br',
      accessKey: 'JMPKSCVbXS5bkgjNEoSQ',
      secretKey: 'YFUPP0XvxYWqQTQUayfBN8U6LzhgsRVg3733RIAM',
      bucketName: 'dispador-inteligente',
      region: 'us-east-1'
    };

    this.client = new MinioClient(config);
  }

  async testConnection(): Promise<boolean> {
    return this.client.testConnection();
  }

  async uploadFile(file: File): Promise<string> {
    return this.client.uploadFile(file);
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    return this.client.deleteFile(fileUrl);
  }

  getFilePreviewUrl(fileUrl: string): string {
    return this.client.getFilePreviewUrl(fileUrl);
  }

  async fileExists(fileUrl: string): Promise<boolean> {
    return this.client.fileExists(fileUrl);
  }

  async listFiles(prefix: string = ''): Promise<any[]> {
    return this.client.listFiles(prefix);
  }

  async testUpload(): Promise<boolean> {
    return this.client.testUpload();
  }
}

export const minioService = new MinioService();
