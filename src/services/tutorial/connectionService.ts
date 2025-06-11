
import { nocodbService } from '../nocodb';

class TutorialConnectionService {
  private isConnected = false;
  private connectionTested = false;

  async testConnection(): Promise<boolean> {
    if (this.connectionTested) return this.isConnected;
    
    try {
      console.log('🔌 Testando conexão com NocoDB...');
      
      // Verificar se temos configuração básica
      if (!nocodbService.config.baseUrl || !nocodbService.config.apiToken) {
        console.error('❌ Configuração do NocoDB incompleta');
        this.isConnected = false;
        this.connectionTested = true;
        return false;
      }
      
      const targetBaseId = nocodbService.getTargetBaseId();
      console.log('📋 Base ID encontrado:', targetBaseId);
      
      if (!targetBaseId) {
        console.warn('❌ Base do NocoDB não encontrada');
        this.isConnected = false;
        this.connectionTested = true;
        return false;
      }

      // Testar acesso às tabelas do projeto
      const testUrl = `${nocodbService.config.baseUrl}/api/v1/db/meta/projects/${targetBaseId}/tables`;
      console.log('🔗 Testando URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          ...nocodbService.headers,
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response status da conexão:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conexão com NocoDB estabelecida - Tabelas encontradas:', data.list?.length || 0);
        this.isConnected = true;
      } else {
        console.warn('❌ Falha na conexão com NocoDB:', response.status);
        const errorText = await response.text();
        console.warn('❌ Detalhes do erro:', errorText);
        this.isConnected = false;
      }
      
      this.connectionTested = true;
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
    console.log('🔄 Conexão resetada - próxima chamada irá testar novamente');
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Método para forçar reconexão
  async forceReconnect(): Promise<boolean> {
    this.resetConnection();
    return await this.testConnection();
  }
}

export const tutorialConnectionService = new TutorialConnectionService();
