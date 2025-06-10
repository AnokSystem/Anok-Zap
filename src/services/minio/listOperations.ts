
import { MinioConfig, MinioHeaders } from './types';
import { MinioAuth } from './auth';

export class MinioListOperations {
  private config: MinioConfig;
  private auth: MinioAuth;

  constructor(config: MinioConfig, auth: MinioAuth) {
    this.config = config;
    this.auth = auth;
  }

  async listFiles(prefix: string = ''): Promise<any[]> {
    try {
      console.log(`Listando arquivos do bucket MinIO: ${this.config.bucketName}`);
      
      const url = new URL(this.config.serverUrl);
      const path = `/${this.config.bucketName}/`;
      const query = prefix ? `prefix=${encodeURIComponent(prefix)}` : '';
      
      const headers: MinioHeaders = {
        'Host': url.hostname,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };

      const authorization = await this.auth.createSignature(
        'GET', 
        path, 
        query, 
        headers, 
        '',
        this.config.accessKey,
        this.config.secretKey,
        this.config.region
      );
      
      const requestUrl = `${this.config.serverUrl}${path}${query ? '?' + query : ''}`;
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'Authorization': authorization
        }
      });

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Lista de arquivos MinIO obtida com sucesso');
        return [];
      } else {
        console.log(`Erro ao listar arquivos MinIO: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error('Erro ao listar arquivos MinIO:', error);
      return [];
    }
  }

  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar existência do arquivo:', error);
      return false;
    }
  }

  getFilePreviewUrl(fileUrl: string): string {
    return fileUrl;
  }
}
