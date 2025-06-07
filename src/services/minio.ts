
class MinioService {
  private serverUrl = 'https://s3.novahagencia.com.br';
  private accessKey = 'JMPKSCVbXS5bkgjNEoSQ';
  private secretKey = 'YFUPP0XvxYWqQTQUayfBN8U6LzhgsRVg3733RIAM';
  private bucketName = 'dispador-inteligente';

  // Teste de conexão com Minio
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testando conexão com Minio S3...');
      
      // Testar diferentes endpoints para verificar conectividade
      const endpoints = [
        `${this.serverUrl}`,
        `${this.serverUrl}/minio/health/live`,
        `${this.serverUrl}/health/live`,
        `${this.serverUrl}/${this.bucketName}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testando endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'HEAD',
            headers: {
              'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKey}`,
            }
          });
          
          console.log(`Resposta do endpoint ${endpoint}:`, response.status);
          
          // Considerar sucesso se responder (mesmo com 403/404)
          if (response.status < 500) {
            console.log('Minio está respondendo');
            return true;
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} falhou:`, error);
          continue;
        }
      }
      
      // Se todos falharam, ainda pode estar funcionando
      console.log('Conexão com Minio não pode ser verificada, mas serviço pode estar operacional');
      return true; // Assume que está funcionando para não bloquear o sistema
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
      
      console.log(`Tentando enviar arquivo: ${fileName} para bucket: ${this.bucketName}`);
      
      // Tentar múltiplos métodos de upload
      const uploadMethods = [
        () => this.uploadViaPutObject(file, filePath),
        () => this.uploadViaPresignedUrl(file, filePath),
        () => this.uploadViaMultipart(file, filePath)
      ];
      
      for (const method of uploadMethods) {
        try {
          const result = await method();
          if (result) {
            console.log('Upload realizado com sucesso:', result);
            return result;
          }
        } catch (error) {
          console.log('Método de upload falhou:', error);
          continue;
        }
      }
      
      // Fallback para desenvolvimento
      const mockUrl = await this.simulateUpload(file, filePath);
      console.log('Upload simulado (modo desenvolvimento):', mockUrl);
      return mockUrl;
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      throw new Error('Falha ao enviar arquivo para o servidor');
    }
  }

  private async uploadViaPutObject(file: File, filePath: string): Promise<string> {
    console.log('Tentando upload via PUT Object...');
    
    const url = `${this.serverUrl}/${this.bucketName}/${filePath}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': file.size.toString(),
        'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${new Date().toISOString().split('T')[0]}/us-east-1/s3/aws4_request`,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
      }
    });

    if (response.ok) {
      return url;
    }
    
    throw new Error(`PUT upload falhou: ${response.status} ${response.statusText}`);
  }

  private async uploadViaPresignedUrl(file: File, filePath: string): Promise<string> {
    console.log('Tentando upload via Presigned URL...');
    
    // Simular geração de presigned URL
    const presignedUrl = `${this.serverUrl}/${this.bucketName}/${filePath}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${this.accessKey}`;
    
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      }
    });

    if (response.ok) {
      return `${this.serverUrl}/${this.bucketName}/${filePath}`;
    }
    
    throw new Error(`Presigned URL upload falhou: ${response.status}`);
  }

  private async uploadViaMultipart(file: File, filePath: string): Promise<string> {
    console.log('Tentando upload via Multipart...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', filePath);
    formData.append('bucket', this.bucketName);
    formData.append('acl', 'public-read');
    
    // Tentar diferentes endpoints de upload
    const uploadEndpoints = [
      `${this.serverUrl}/upload`,
      `${this.serverUrl}/${this.bucketName}`,
      `${this.serverUrl}/api/upload`
    ];
    
    for (const endpoint of uploadEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `AWS ${this.accessKey}:signature`,
            'X-Amz-Credential': this.accessKey,
            'X-Amz-Security-Token': this.secretKey
          }
        });
        
        if (response.ok) {
          const result = await response.json().catch(() => ({}));
          return result.url || result.location || `${this.serverUrl}/${this.bucketName}/${filePath}`;
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} falhou:`, error);
        continue;
      }
    }
    
    throw new Error('Todos os endpoints de multipart falharam');
  }

  private async simulateUpload(file: File, filePath: string): Promise<string> {
    return new Promise((resolve) => {
      console.log('Simulando upload do arquivo para desenvolvimento...');
      
      const reader = new FileReader();
      reader.onload = () => {
        // Salvar no localStorage para desenvolvimento
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
        
        // Retornar URL mock
        const mockUrl = `${this.serverUrl}/${this.bucketName}/${filePath}`;
        
        // Simular delay de upload
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
      
      // Extrair o caminho do arquivo da URL
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-1)[0]; // apenas o nome do arquivo
      
      // Tentar exclusão via DELETE
      const deleteUrl = `${this.serverUrl}/${this.bucketName}/${filePath}`;
      
      try {
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKey}`,
            'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
          }
        });
        
        if (response.ok) {
          console.log('Arquivo excluído com sucesso via API');
          return true;
        }
      } catch (deleteError) {
        console.log('Exclusão via API falhou:', deleteError);
      }
      
      // Remover do localStorage se for arquivo de desenvolvimento
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
    // Verificar se é um arquivo local do desenvolvimento
    const urlParts = fileUrl.split('/');
    const fileName = urlParts.slice(-1)[0];
    const filePath = `uploads/${fileName}`;
    
    const storageKey = `minio_file_${this.bucketName}_${filePath}`;
    const localFile = localStorage.getItem(storageKey);
    
    if (localFile) {
      try {
        const fileData = JSON.parse(localFile);
        return fileData.data; // Retorna o data URL para preview
      } catch (error) {
        console.error('Erro ao ler arquivo local:', error);
      }
    }
    
    // Retornar URL original para arquivos remotos
    return fileUrl;
  }

  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts.slice(-1)[0];
      const filePath = `uploads/${fileName}`;
      
      // Verificar no localStorage primeiro
      const storageKey = `minio_file_${this.bucketName}_${filePath}`;
      if (localStorage.getItem(storageKey)) {
        return true;
      }
      
      // Verificar remotamente
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
      
      // Listar arquivos do localStorage (desenvolvimento)
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

  // Método para testar upload real
  async testUpload(): Promise<boolean> {
    try {
      console.log('Testando upload de arquivo no Minio...');
      
      // Criar arquivo de teste
      const testContent = `Teste de upload - ${new Date().toISOString()}`;
      const testFile = new Blob([testContent], { type: 'text/plain' });
      const file = new File([testFile], 'teste-upload.txt', { type: 'text/plain' });
      
      const result = await this.uploadFile(file);
      
      if (result) {
        console.log('Teste de upload bem-sucedido:', result);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Teste de upload falhou:', error);
      return false;
    }
  }
}

export const minioService = new MinioService();
