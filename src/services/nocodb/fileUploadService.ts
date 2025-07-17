import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';

export class NocodbFileUploadService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async uploadFile(file: File, baseId: string = 'pry2rly2dtgdfo5'): Promise<string> {
    try {
      console.log('📤 Iniciando upload para NocoDB...', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/storage/upload`,
        {
          method: 'POST',
          headers: {
            'xc-token': this.config.apiToken,
          },
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        const fileUrl = data[0]?.url || data.url;
        console.log('✅ Upload para NocoDB concluído:', fileUrl);
        return fileUrl;
      } else {
        throw new Error(`Erro no upload: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro no upload para NocoDB:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔧 Testando conexão de upload NocoDB...');
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects`,
        {
          headers: {
            'xc-token': this.config.apiToken,
          }
        }
      );

      const isConnected = response.ok;
      console.log(`🔧 Resultado do teste de upload: ${isConnected ? 'SUCESSO' : 'FALHA'}`);
      return isConnected;
    } catch (error) {
      console.error('❌ Erro no teste de conexão de upload:', error);
      return false;
    }
  }
}