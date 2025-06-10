
import { MinioConfig, UploadOptions, MinioHeaders } from './types';
import { MinioAuth } from './auth';

export class MinioUploadOperations {
  private config: MinioConfig;
  private auth: MinioAuth;

  constructor(config: MinioConfig, auth: MinioAuth) {
    this.config = config;
    this.auth = auth;
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
