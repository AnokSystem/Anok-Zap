
import { nocodbService } from '../nocodb';

class TutorialConnectionService {
  private isConnected = false;
  private connectionTested = false;
  private targetBaseId: string | null = null;

  async testConnection(): Promise<boolean> {
    if (this.connectionTested) return this.isConnected;
    
    try {
      console.log('🔌 Testando conexão com NocoDB...');
      
      // Verificar se temos configuração básica
      if (!nocodbService.config.baseUrl || !nocodbService.config.apiToken) {
        console.error('❌ Configuração do NocoDB incompleta');
        console.error('BaseURL:', nocodbService.config.baseUrl);
        console.error('ApiToken presente:', !!nocodbService.config.apiToken);
        this.isConnected = false;
        this.connectionTested = true;
        return false;
      }
      
      // Primeiro, buscar todas as bases disponíveis
      const basesUrl = `${nocodbService.config.baseUrl}/api/v1/db/meta/projects`;
      console.log('🔗 Buscando bases em:', basesUrl);
      
      const basesResponse = await fetch(basesUrl, {
        method: 'GET',
        headers: {
          ...nocodbService.headers,
          'Accept': 'application/json',
        },
      });

      if (!basesResponse.ok) {
        console.error('❌ Erro ao buscar bases:', basesResponse.status);
        const errorText = await basesResponse.text();
        console.error('❌ Detalhes do erro:', errorText);
        this.isConnected = false;
        this.connectionTested = true;
        return false;
      }

      const basesData = await basesResponse.json();
      console.log('📊 Bases encontradas:', basesData);
      
      if (!basesData.list || basesData.list.length === 0) {
        console.error('❌ Nenhuma base encontrada no NocoDB');
        this.isConnected = false;
        this.connectionTested = true;
        return false;
      }

      // Pegar a primeira base disponível ou procurar por uma específica
      this.targetBaseId = basesData.list[0].id;
      console.log('✅ Base ID encontrado:', this.targetBaseId);

      // Testar acesso às tabelas do projeto
      const testUrl = `${nocodbService.config.baseUrl}/api/v1/db/meta/projects/${this.targetBaseId}/tables`;
      console.log('🔗 Testando acesso às tabelas:', testUrl);
      
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

  getTargetBaseId(): string | null {
    return this.targetBaseId;
  }

  resetConnection(): void {
    this.connectionTested = false;
    this.isConnected = false;
    this.targetBaseId = null;
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
