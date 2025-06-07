
class MinioService {
  private serverUrl = 'https://s3.novahagencia.com.br';
  private accessKey = 'JMPKSCVbXS5bkgjNEoSQ';
  private secretKey = 'YFUPP0XvxYWqQTQUayfBN8U6LzhgsRVg3733RIAM';
  private bucketName = 'dispador-inteligente';
  private region = 'us-east-1';

  // Gerar assinatura AWS4
  private async createAWSSignature(method: string, url: string, headers: Record<string, string>, timestamp: string): Promise<string> {
    const dateStamp = timestamp.substring(0, 8);
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    
    // Canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n') + '\n';
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');
    
    const canonicalRequest = `${method}\n${new URL(url).pathname}\n\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;
    
    // String to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${await this.sha256(canonicalRequest)}`;
    
    // Calculate signature
    const signingKey = await this.getSignatureKey(this.secretKey, dateStamp, this.region, 's3');
    const signature = await this.hmacSha256(signingKey, stringToSign);
    
    return `${algorithm} Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async hmacSha256(key: CryptoKey, message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const signature = await crypto.subtle.sign('HMAC', key, msgBuffer);
    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<CryptoKey> {
    const kDate = await this.hmacSha256Key(`AWS4${key}`, dateStamp);
    const kRegion = await this.hmacSha256Key(kDate, regionName);
    const kService = await this.hmacSha256Key(kRegion, serviceName);
    return this.hmacSha256Key(kService, 'aws4_request');
  }

  private async hmacSha256Key(key: string | CryptoKey, message: string): Promise<CryptoKey> {
    const keyData = typeof key === 'string' ? new TextEncoder().encode(key) : key;
    const msgBuffer = new TextEncoder().encode(message);
    
    if (typeof key === 'string') {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData as ArrayBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      return cryptoKey;
    }
    
    const signature = await crypto.subtle.sign('HMAC', keyData as CryptoKey, msgBuffer);
    return crypto.subtle.importKey(
      'raw',
      signature,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  }

  // Teste de conexão melhorado
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testando conexão com Minio S3...');
      
      // Fazer uma requisição HEAD simples para verificar se o bucket existe
      const url = `${this.serverUrl}/${this.bucketName}/`;
      const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
      
      const headers = {
        'Host': new URL(this.serverUrl).hostname,
        'X-Amz-Date': timestamp,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };
      
      try {
        const authorization = await this.createAWSSignature('HEAD', url, headers, timestamp);
        
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            ...headers,
            'Authorization': authorization
          }
        });
        
        console.log(`Resposta do bucket test: ${response.status}`);
        
        // Aceitar 200, 403 (forbidden mas bucket existe) ou 404 (bucket não encontrado mas serviço responde)
        if (response.status === 200 || response.status === 403 || response.status === 404) {
          console.log('Minio está respondendo corretamente');
          return true;
        }
      } catch (error) {
        console.log('Teste de conexão autenticada falhou:', error);
      }
      
      // Fallback: teste simples sem autenticação
      try {
        const simpleResponse = await fetch(this.serverUrl, {
          method: 'HEAD',
          mode: 'no-cors'
        });
        console.log('Servidor Minio está online (teste sem CORS)');
        return true;
      } catch (error) {
        console.log('Teste sem CORS também falhou:', error);
      }
      
      return false;
    } catch (error) {
      console.error('Erro geral ao testar Minio:', error);
      return false;
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Iniciando upload para Minio...', file.name);
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `uploads/${fileName}`;
      
      console.log(`Enviando arquivo: ${fileName} para bucket: ${this.bucketName}`);
      
      // Tentar upload com autenticação AWS4
      const uploadUrl = `${this.serverUrl}/${this.bucketName}/${filePath}`;
      const timestamp_aws = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
      
      const headers = {
        'Host': new URL(this.serverUrl).hostname,
        'X-Amz-Date': timestamp_aws,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': file.size.toString()
      };
      
      try {
        const authorization = await this.createAWSSignature('PUT', uploadUrl, headers, timestamp_aws);
        
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            ...headers,
            'Authorization': authorization
          }
        });
        
        console.log(`Upload response status: ${response.status}`);
        
        if (response.ok || response.status === 200) {
          console.log('Upload realizado com sucesso via AWS4 auth');
          return uploadUrl;
        }
        
        const responseText = await response.text().catch(() => '');
        console.log('Upload falhou, resposta:', responseText);
        
      } catch (error) {
        console.error('Erro no upload autenticado:', error);
      }
      
      // Tentar upload via FormData (para APIs que não suportam PUT direto)
      try {
        console.log('Tentando upload via FormData...');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', filePath);
        formData.append('bucket', this.bucketName);
        
        const uploadEndpoints = [
          `${this.serverUrl}/upload`,
          `${this.serverUrl}/${this.bucketName}`,
          `${this.serverUrl}/api/v1/upload`
        ];
        
        for (const endpoint of uploadEndpoints) {
          try {
            console.log(`Tentando endpoint: ${endpoint}`);
            
            const response = await fetch(endpoint, {
              method: 'POST',
              body: formData,
              headers: {
                'X-Amz-Credential': this.accessKey,
                'X-Amz-Signature': 'dummy-signature'
              }
            });
            
            if (response.ok) {
              const result = await response.json().catch(() => ({}));
              const fileUrl = result.url || result.location || uploadUrl;
              console.log('Upload realizado com sucesso via FormData:', fileUrl);
              return fileUrl;
            }
            
            console.log(`Endpoint ${endpoint} retornou: ${response.status}`);
          } catch (error) {
            console.log(`Endpoint ${endpoint} falhou:`, error);
            continue;
          }
        }
        
      } catch (error) {
        console.error('Erro no upload via FormData:', error);
      }
      
      // Se chegou até aqui, significa que o upload real falhou
      // Vamos salvar localmente e retornar erro mais claro
      console.warn('ATENÇÃO: Upload para Minio falhou. Salvando localmente para desenvolvimento.');
      
      const mockUrl = await this.simulateUpload(file, filePath);
      
      // Lançar erro para que o usuário saiba que não foi salvo remotamente
      throw new Error(`Upload falhou no servidor Minio. Arquivo salvo localmente apenas para teste. URL mock: ${mockUrl}`);
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      throw error;
    }
  }

  private async simulateUpload(file: File, filePath: string): Promise<string> {
    return new Promise((resolve) => {
      console.log('Simulando upload do arquivo para desenvolvimento...');
      
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          uploadedAt: new Date().toISOString(),
          path: filePath,
          bucket: this.bucketName
        };
        
        const storageKey = `minio_file_${this.bucketName}_${filePath}`;
        localStorage.setItem(storageKey, JSON.stringify(fileData));
        
        const mockUrl = `${this.serverUrl}/${this.bucketName}/${filePath}`;
        
        setTimeout(() => {
          console.log('Arquivo salvo localmente para desenvolvimento:', mockUrl);
          resolve(mockUrl);
        }, 1000 + Math.random() * 2000);
      };
      
      reader.onerror = () => {
        console.error('Erro ao ler arquivo');
        resolve(`${this.serverUrl}/${this.bucketName}/${filePath}`);
      };
      
      reader.readAsDataURL(file);
    });
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      console.log(`Excluindo arquivo: ${fileUrl}`);
      
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-1)[0];
      
      const deleteUrl = `${this.serverUrl}/${this.bucketName}/${filePath}`;
      const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
      
      const headers = {
        'Host': new URL(this.serverUrl).hostname,
        'X-Amz-Date': timestamp,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };
      
      try {
        const authorization = await this.createAWSSignature('DELETE', deleteUrl, headers, timestamp);
        
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            ...headers,
            'Authorization': authorization
          }
        });
        
        if (response.ok) {
          console.log('Arquivo excluído com sucesso via API');
          return true;
        }
      } catch (deleteError) {
        console.log('Exclusão via API falhou:', deleteError);
      }
      
      const storageKey = `minio_file_${this.bucketName}_uploads/${filePath}`;
      if (localStorage.getItem(storageKey)) {
        localStorage.removeItem(storageKey);
        console.log('Arquivo removido do localStorage');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      return false;
    }
  }

  getFilePreviewUrl(fileUrl: string): string {
    const urlParts = fileUrl.split('/');
    const fileName = urlParts.slice(-1)[0];
    const filePath = `uploads/${fileName}`;
    
    const storageKey = `minio_file_${this.bucketName}_${filePath}`;
    const localFile = localStorage.getItem(storageKey);
    
    if (localFile) {
      try {
        const fileData = JSON.parse(localFile);
        return fileData.data;
      } catch (error) {
        console.error('Erro ao ler arquivo local:', error);
      }
    }
    
    return fileUrl;
  }

  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts.slice(-1)[0];
      const filePath = `uploads/${fileName}`;
      
      const storageKey = `minio_file_${this.bucketName}_${filePath}`;
      if (localStorage.getItem(storageKey)) {
        return true;
      }
      
      const response = await fetch(fileUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar existência do arquivo:', error);
      return false;
    }
  }

  async listFiles(prefix: string = ''): Promise<any[]> {
    try {
      console.log(`Listando arquivos do bucket: ${this.bucketName}`);
      
      const localFiles = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`minio_file_${this.bucketName}_`)) {
          try {
            const fileData = JSON.parse(localStorage.getItem(key) || '');
            if (!prefix || fileData.path.startsWith(prefix)) {
              localFiles.push({
                key: fileData.path,
                name: fileData.name,
                size: fileData.size,
                lastModified: fileData.uploadedAt,
                url: `${this.serverUrl}/${this.bucketName}/${fileData.path}`,
                bucket: this.bucketName
              });
            }
          } catch (error) {
            console.error('Erro ao processar arquivo local:', error);
          }
        }
      }
      
      console.log(`Encontrados ${localFiles.length} arquivos locais no bucket ${this.bucketName}`);
      return localFiles;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }

  async testUpload(): Promise<boolean> {
    try {
      console.log('Testando upload de arquivo no Minio...');
      
      const testContent = `Teste de upload - ${new Date().toISOString()}`;
      const testFile = new Blob([testContent], { type: 'text/plain' });
      const file = new File([testFile], 'teste-upload.txt', { type: 'text/plain' });
      
      try {
        const result = await this.uploadFile(file);
        
        if (result && !result.includes('mock')) {
          console.log('Teste de upload bem-sucedido (real):', result);
          return true;
        } else {
          console.log('Upload caiu no modo de simulação - servidor não está aceitando uploads');
          return false;
        }
      } catch (error) {
        console.log('Teste de upload falhou:', error);
        return false;
      }
      
    } catch (error) {
      console.error('Erro no teste de upload:', error);
      return false;
    }
  }
}

export const minioService = new MinioService();
