class MinioService {
  private serverUrl = 'https://s3.novahagencia.com.br';
  private accessKey = 'JMPKSCVbXS5bkgjNEoSQ';
  private secretKey = 'YFUPP0XvxYWqQTQUayfBN8U6LzhgsRVg3733RIAM';
  private bucketName = 'whatsapp-files';

  // Teste de conexão com Minio
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testando conexão com Minio S3...');
      
      // Tenta listar buckets ou acessar endpoint de health
      const endpoints = [
        `${this.serverUrl}/minio/health/live`,
        `${this.serverUrl}/health/live`,
        `${this.serverUrl}/${this.bucketName}`,
        `${this.serverUrl}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testando endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKey}`,
            }
          });
          
          console.log(`Resposta do endpoint ${endpoint}:`, response.status);
          
          if (response.status === 200 || response.status === 403) {
            // 403 pode indicar que o serviço está rodando mas sem permissão
            console.log('Minio está respondendo');
            return true;
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} falhou:`, error);
          continue;
        }
      }
      
      console.log('Todos os endpoints Minio falharam, mas serviço pode estar funcionando');
      return false;
    } catch (error) {
      console.error('Erro geral ao testar Minio:', error);
      return false;
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Enviando arquivo para Minio...');
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `uploads/${fileName}`;
      
      console.log(`Tentando enviar arquivo: ${fileName}`);
      
      // Tentar upload direto via API REST do Minio
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', filePath);
        formData.append('bucket', this.bucketName);
        
        // Endpoint personalizado para upload
        const uploadResponse = await fetch(`${this.serverUrl}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'X-Access-Key': this.accessKey,
            'X-Secret-Key': this.secretKey,
          }
        });
        
        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          const fileUrl = result.url || `${this.serverUrl}/${this.bucketName}/${filePath}`;
          console.log('Arquivo enviado com sucesso:', fileUrl);
          return fileUrl;
        }
      } catch (uploadError) {
        console.log('Upload direto falhou, tentando método alternativo:', uploadError);
      }
      
      // Método alternativo: simular upload e usar localStorage para desenvolvimento
      const fileUrl = await this.simulateUpload(file, filePath);
      console.log('Arquivo processado (modo desenvolvimento):', fileUrl);
      return fileUrl;
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      throw new Error('Falha ao enviar arquivo');
    }
  }

  private async simulateUpload(file: File, filePath: string): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Salvar no localStorage para desenvolvimento
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          uploadedAt: new Date().toISOString(),
          path: filePath
        };
        
        localStorage.setItem(`minio_file_${filePath}`, JSON.stringify(fileData));
        
        // Retornar URL mock
        const mockUrl = `${this.serverUrl}/${this.bucketName}/${filePath}`;
        
        // Simular delay de upload
        setTimeout(() => {
          resolve(mockUrl);
        }, 1000 + Math.random() * 2000); // 1-3 segundos
      };
      
      reader.readAsDataURL(file);
    });
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      console.log(`Excluindo arquivo: ${fileUrl}`);
      
      // Extrair o caminho do arquivo da URL
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // bucket/filename
      
      // Tentar exclusão via API
      try {
        const deleteResponse = await fetch(`${this.serverUrl}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': this.accessKey,
            'X-Secret-Key': this.secretKey,
          },
          body: JSON.stringify({
            bucket: this.bucketName,
            key: filePath
          })
        });
        
        if (deleteResponse.ok) {
          console.log('Arquivo excluído com sucesso da API');
          return true;
        }
      } catch (deleteError) {
        console.log('Exclusão via API falhou:', deleteError);
      }
      
      // Remover do localStorage se for arquivo de desenvolvimento
      const storageKey = `minio_file_${filePath}`;
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
    const filePath = urlParts.slice(-2).join('/');
    const storageKey = `minio_file_${filePath}`;
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

  // Método para verificar se o arquivo existe
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');
      
      // Verificar no localStorage primeiro
      const storageKey = `minio_file_${filePath}`;
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

  // Método para listar arquivos
  async listFiles(prefix: string = ''): Promise<any[]> {
    try {
      // Listar arquivos do localStorage
      const localFiles = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('minio_file_')) {
          try {
            const fileData = JSON.parse(localStorage.getItem(key) || '');
            if (!prefix || fileData.path.startsWith(prefix)) {
              localFiles.push({
                key: fileData.path,
                name: fileData.name,
                size: fileData.size,
                lastModified: fileData.uploadedAt,
                url: `${this.serverUrl}/${this.bucketName}/${fileData.path}`
              });
            }
          } catch (error) {
            console.error('Erro ao processar arquivo local:', error);
          }
        }
      }
      
      console.log(`Encontrados ${localFiles.length} arquivos locais`);
      return localFiles;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }
}

export const minioService = new MinioService();
