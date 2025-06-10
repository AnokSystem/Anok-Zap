
import { MinioConfig, MinioHeaders } from './types';
import { MinioAuth } from './auth';

export class MinioTestOperations {
  private config: MinioConfig;
  private auth: MinioAuth;

  constructor(config: MinioConfig, auth: MinioAuth) {
    this.config = config;
    this.auth = auth;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testando conexão com MinIO...');
      
      const url = new URL(this.config.serverUrl);
      const path = `/${this.config.bucketName}/`;
      
      const headers: MinioHeaders = {
        'Host': url.hostname,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };

      try {
        const authorization = await this.auth.createSignature(
          'HEAD', 
          path, 
          '', 
          headers, 
          '',
          this.config.accessKey,
          this.config.secretKey,
          this.config.region
        );
        
        const response = await fetch(`${this.config.serverUrl}${path}`, {
          method: 'HEAD',
          headers: {
            ...headers,
            'Authorization': authorization
          }
        });

        console.log(`Status da conexão MinIO: ${response.status}`);
        return response.status === 200 || response.status === 403 || response.status === 404;
      } catch (error) {
        console.log('Erro na autenticação MinIO:', error);
        return false;
      }
    } catch (error) {
      console.error('Erro ao testar conexão MinIO:', error);
      return false;
    }
  }
}
