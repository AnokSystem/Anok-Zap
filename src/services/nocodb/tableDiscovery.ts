
import { NocodbConfig, DiscoveredBase } from './types';

export class TableDiscovery {
  private config: NocodbConfig;
  private headers: Record<string, string>;
  private discoveredBases: DiscoveredBase[] = [];
  private targetBaseId: string | null = null;

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  async discoverBases() {
    try {
      console.log('Descobrindo bases disponíveis no NocoDB...');
      
      const response = await fetch(`${this.config.baseUrl}/api/v1/db/meta/projects`, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bases descobertas:', data);
        this.discoveredBases = data.list || [];
        
        // Procurar especificamente pela base "Notificação Inteligente"
        const notificationBase = this.discoveredBases.find(base => 
          base.title === 'Notificação Inteligente' || 
          base.title.toLowerCase().includes('notificação') ||
          base.title.toLowerCase().includes('notificacao')
        );
        
        if (notificationBase) {
          this.targetBaseId = notificationBase.id;
          console.log('✅ Base "Notificação Inteligente" encontrada:', notificationBase);
        } else {
          console.log('❌ Base "Notificação Inteligente" não encontrada nas bases disponíveis');
        }
        
        return data;
      } else {
        console.log('Erro ao descobrir bases:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Erro ao descobrir bases:', error);
      return null;
    }
  }

  getTargetBaseId(): string | null {
    return this.targetBaseId;
  }

  getDiscoveredBases(): DiscoveredBase[] {
    return this.discoveredBases;
  }
}
