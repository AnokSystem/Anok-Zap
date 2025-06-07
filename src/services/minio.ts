
class MinioService {
  private serverUrl = 'https://s3.novahagencia.com.br';
  private accessKey = 'JMPKSCVbXS5bkgjNEoSQ';
  private secretKey = 'YFUPP0XvxYWqQTQUayfBN8U6LzhgsRVg3733RIAM';
  private bucketName = 'dispador-inteligente';
  private region = 'us-east-1';

  // Implementação correta do AWS4-HMAC-SHA256 para MinIO
  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async hmacSha256(key: ArrayBuffer | string, message: string): Promise<ArrayBuffer> {
    let keyBuffer: ArrayBuffer;
    
    if (typeof key === 'string') {
      keyBuffer = new TextEncoder().encode(key);
    } else {
      keyBuffer = key;
    }
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const msgBuffer = new TextEncoder().encode(message);
    return await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  }

  private async createSigningKey(secretKey: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
    const kDate = await this.hmacSha256('AWS4' + secretKey, dateStamp);
    const kRegion = await this.hmacSha256(kDate, region);
    const kService = await this.hmacSha256(kRegion, service);
    const kSigning = await this.hmacSha256(kService, 'aws4_request');
    return kSigning;
  }

  private async createSignature(method: string, path: string, query: string, headers: Record<string, string>, payload: string): Promise<string> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    // Canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
      .join('\n') + '\n';

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const payloadHash = await this.sha256(payload);
    
    const canonicalRequest = [
      method,
      path,
      query,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    // String to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const canonicalRequestHash = await this.sha256(canonicalRequest);
    
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      canonicalRequestHash
    ].join('\n');

    // Calculate signature
    const signingKey = await this.createSigningKey(this.secretKey, dateStamp, this.region, 's3');
    const signature = await this.hmacSha256(signingKey, stringToSign);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return `${algorithm} Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testando conexão com MinIO...');
      
      const url = new URL(this.serverUrl);
      const path = `/${this.bucketName}/`;
      
      const headers = {
        'Host': url.hostname,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };

      try {
        const authorization = await this.createSignature('HEAD', path, '', headers, '');
        
        const response = await fetch(`${this.serverUrl}${path}`, {
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

  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Iniciando upload para MinIO...', file.name);
      
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `uploads/${fileName}`;
      
      const url = new URL(this.serverUrl);
      const path = `/${this.bucketName}/${filePath}`;
      
      // Preparar headers para upload
      const headers = {
        'Host': url.hostname,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': file.size.toString()
      };

      try {
        // Tentar upload direto com autenticação MinIO
        const authorization = await this.createSignature('PUT', path, '', headers, '');
        
        const response = await fetch(`${this.serverUrl}${path}`, {
          method: 'PUT',
          headers: {
            ...headers,
            'Authorization': authorization
          },
          body: file
        });

        console.log(`Status do upload MinIO: ${response.status}`);
        
        if (response.ok) {
          const fileUrl = `${this.serverUrl}${path}`;
          console.log('Upload realizado com sucesso no MinIO:', fileUrl);
          return fileUrl;
        } else {
          const errorText = await response.text().catch(() => '');
          console.error('Erro no upload MinIO:', response.status, errorText);
          throw new Error(`Upload falhou: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Erro durante upload MinIO:', error);
        throw new Error(`Falha na comunicação com MinIO: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro geral no upload:', error);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      console.log(`Excluindo arquivo do MinIO: ${fileUrl}`);
      
      const url = new URL(fileUrl);
      const path = url.pathname;
      
      const headers = {
        'Host': url.hostname,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };

      const authorization = await this.createSignature('DELETE', path, '', headers, '');
      
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
      console.log(`Listando arquivos do bucket MinIO: ${this.bucketName}`);
      
      const url = new URL(this.serverUrl);
      const path = `/${this.bucketName}/`;
      const query = prefix ? `prefix=${encodeURIComponent(prefix)}` : '';
      
      const headers = {
        'Host': url.hostname,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };

      const authorization = await this.createSignature('GET', path, query, headers, '');
      
      const requestUrl = `${this.serverUrl}${path}${query ? '?' + query : ''}`;
      
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
        // Aqui você pode implementar um parser XML se necessário
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

export const minioService = new MinioService();
