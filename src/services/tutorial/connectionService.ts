
import { nocodbService } from '../nocodb';

class TutorialConnectionService {
  private isConnected = false;
  private connectionTested = false;

  async testConnection(): Promise<boolean> {
    if (this.connectionTested) return this.isConnected;
    
    try {
      console.log('🔌 Testando conexão com NocoDB...');
      const targetBaseId = nocodbService.getTargetBaseId();
      console.log('📋 Base ID encontrado:', targetBaseId);
      
      if (!targetBaseId) {
        console.warn('❌ Base do NocoDB não encontrada');
        this.isConnected = false;
        this.connectionTested = true;
        return false;
      }

      const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/meta/projects/${targetBaseId}/tables`, {
        method: 'GET',
        headers: nocodbService.headers,
      });

      console.log('📡 Response status da conexão:', response.status);
      this.isConnected = response.ok;
      this.connectionTested = true;
      
      if (this.isConnected) {
        console.log('✅ Conexão com NocoDB estabelecida');
      } else {
        console.warn('❌ Falha na conexão com NocoDB:', response.status);
        const errorText = await response.text();
        console.warn('❌ Detalhes do erro:', errorText);
      }
      
      return this.isConnected;
    } catch (error) {
      console.error('❌ Erro ao testar conexão com NocoDB:', error);
      this.isConnected = false;
      this.connectionTested = true;
      return false;
    }
  }

  resetConnection(): void {
    this.connectionTested = false;
    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const tutorialConnectionService = new TutorialConnectionService();
