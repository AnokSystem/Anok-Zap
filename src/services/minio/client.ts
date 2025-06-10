import { MinioConfig, UploadOptions, MinioHeaders } from './types';
import { MinioAuth } from './auth';

export class MinioClient {
  private config: MinioConfig;
  private auth: MinioAuth;

  constructor(config: MinioConfig) {
    this.config = config;
    this.auth = new MinioAuth();
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

  async uploadFile(file: File, options: UploadOptions = {}): Promise<string> {
    try {
      console.log('Iniciando upload para MinIO...', file.name);
      
      // Usar o nome do arquivo que já vem com o caminho da pasta
      const filePath = file.name;
      
      const url = new URL(this.config.serverUrl);
      const path = `/${this.config.bucketName}/${filePath}`;
      
      // Calcular hash do payload
      const fileArrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileArrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const payloadHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Headers corrigidos
      const amzDate = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
      const headers: MinioHeaders = {
        'Host': url.hostname,
        'X-Amz-Date': amzDate,
        'X-Amz-Content-Sha256': payloadHash,
        'Content-Type': options.contentType || file.type || 'application/octet-stream',
        'Content-Length': file.size.toString()
      };

      console.log('Upload para caminho:', filePath);
      console.log('Headers de upload:', headers);

      const authorization = await this.auth.createSignature(
        'PUT', 
        path, 
        '', 
        headers, 
        payloadHash,
        this.config.accessKey,
        this.config.secretKey,
        this.config.region
      );
      
      const fullUrl = `${this.config.serverUrl}${path}`;
      console.log('URL de upload:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          ...headers,
          'Authorization': authorization
        },
        body: file
      });

      console.log(`Status do upload MinIO: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ Upload realizado com sucesso no MinIO:', fullUrl);
        return fullUrl;
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('❌ Erro no upload MinIO:', response.status, errorText);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(`Upload falhou: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro geral no upload:', error);
      throw error;
    }
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

  getFilePreviewUrl(fileUrl: string): string {
    return fileUrl;
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

  async testUpload(): Promise<boolean> {
    try {
      console.log('Testando upload no MinIO...');
      
      const testContent = `Teste MinIO - ${new Date().toISOString()}`;
      const testFile = new File([testContent], 'teste-minio.txt', { type: 'text/plain' });
      
      const result = await this.uploadFile(testFile);
      console.log('Teste de upload MinIO concluído:', result);
      return true;
    } catch (error) {
      console.log('Teste de upload MinIO falhou:', error);
      return false;
    }
  }
}
