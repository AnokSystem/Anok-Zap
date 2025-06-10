
import { MinioConfig, MinioHeaders } from './types';
import { MinioAuth } from './auth';

export class MinioDeleteOperations {
  private config: MinioConfig;
  private auth: MinioAuth;

  constructor(config: MinioConfig, auth: MinioAuth) {
    this.config = config;
    this.auth = auth;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      console.log(`Excluindo arquivo do MinIO: ${fileUrl}`);
      
      const url = new URL(fileUrl);
      const path = url.pathname;
      
      const headers: MinioHeaders = {
        'Host': url.hostname,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };

      const authorization = await this.auth.createSignature(
        'DELETE', 
        path, 
        '', 
        headers, 
        '',
        this.config.accessKey,
        this.config.secretKey,
        this.config.region
      );
      
      const response = await fetch(fileUrl, {
        method: 'DELETE',
        headers: {
          ...headers,
          'Authorization': authorization
        }
      });

      const success = response.ok;
      console.log(`Exclusão no MinIO: ${success ? 'sucesso' : 'falha'} (${response.status})`);
      return success;
    } catch (error) {
      console.error('Erro ao excluir arquivo do MinIO:', error);
      return false;
    }
  }
}
