
import { NocodbConfig, DiscoveredBase } from './types';

export class TableDiscovery {
  private config: NocodbConfig;
  private headers: Record<string, string>;
  private discoveredBases: DiscoveredBase[] = [];
  private targetBaseId: string | null = 'pry2rly2dtgdfo5'; // ID fixo da base "Notificação Inteligente"

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
        
        // Verificar se a base específica existe
        const targetBase = this.discoveredBases.find(base => base.id === 'pry2rly2dtgdfo5');
        
        if (targetBase) {
          console.log('✅ Base "Notificação Inteligente" encontrada:', targetBase);
          this.targetBaseId = 'pry2rly2dtgdfo5';
        } else {
          console.log('❌ Base com ID pry2rly2dtgdfo5 não encontrada nas bases disponíveis');
          console.log('📋 Bases disponíveis:', this.discoveredBases.map(b => `${b.title} (${b.id})`));
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
