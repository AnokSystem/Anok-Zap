
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { TableDiscoveryService } from './tableDiscoveryService';
import { DisparosFilterService } from './disparosFilterService';
import { DisparosSampleDataService } from './disparosSampleDataService';

export class DisparosDataService extends BaseNocodbService {
  private tableDiscovery: TableDiscoveryService;
  private filterService: DisparosFilterService;
  private sampleDataService: DisparosSampleDataService;
  private cachedTableId: string | null = null;

  constructor(config: NocodbConfig) {
    super(config);
    this.tableDiscovery = new TableDiscoveryService(config);
    this.filterService = new DisparosFilterService(config);
    this.sampleDataService = new DisparosSampleDataService(config);
  }

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  private async getDisparosTableId(baseId: string): Promise<string | null> {
    if (this.cachedTableId) {
      return this.cachedTableId;
    }

    console.log('🔍 Usando ID fixo da tabela de disparos: myx4lsmm5i02xcd');
    
    // Usar o ID específico da tabela fornecido
    const tableId = 'myx4lsmm5i02xcd';
    
    // Verificar se a tabela existe tentando acessá-la
    try {
      const testResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1`,
        {
          headers: this.headers,
        }
      );

      if (testResponse.ok) {
        console.log('✅ Tabela de disparos acessível com ID:', tableId);
        this.cachedTableId = tableId;
        return tableId;
      } else {
        console.log('❌ Tabela de disparos não acessível:', testResponse.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar tabela de disparos:', error);
      return null;
    }
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      const tableId = await this.getDisparosTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de disparos myx4lsmm5i02xcd');
        return [];
      }

      console.log('📨 Buscando disparos recentes da tabela myx4lsmm5i02xcd para cliente:', clientId);

      // Usar sort sem campo específico para evitar erro de campo não encontrado
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos encontrados na tabela myx4lsmm5i02xcd`);
        console.log('📋 Amostra dos dados:', allDisparos.slice(0, 2));
        
        // Filtrar por cliente se necessário
        const clientDisparos = allDisparos.filter(d => {
          if (!d.client_id && !d.Client_id && !d.clientId) {
            return true; // Incluir registros sem client_id
          }
          return d.client_id === clientId || d.Client_id === clientId || d.clientId === clientId;
        });
        
        console.log(`✅ ${clientDisparos.length} disparos para cliente ${clientId}`);
        return clientDisparos;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao buscar disparos (${response.status}):`, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar disparos recentes:', error);
      return [];
    }
  }

  async getAllDisparos(baseId: string): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      const tableId = await this.getDisparosTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de disparos myx4lsmm5i02xcd');
        return [];
      }

      console.log('📋 Buscando TODOS os disparos da tabela myx4lsmm5i02xcd para cliente:', clientId);
      
      // Usar sort sem campo específico para evitar erro de campo não encontrado
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=10000`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos totais na tabela myx4lsmm5i02xcd`);
        
        // Filtrar por cliente se necessário
        const filteredDisparos = allDisparos.filter(d => {
          if (!d.client_id && !d.Client_id && !d.clientId) {
            return true;
          }
          return d.client_id === clientId || d.Client_id === clientId || d.clientId === clientId;
        });
        
        console.log(`✅ ${filteredDisparos.length} disparos para o cliente ${clientId}`);
        return filteredDisparos;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar todos os disparos:', error);
      return [];
    }
  }

  async getDisparosWithFilters(baseId: string, filters: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    instanceId?: string;
    campaignName?: string;
  } = {}): Promise<any[]> {
    const tableId = await this.getDisparosTableId(baseId);
    if (!tableId) {
      return [];
    }
    return await this.filterService.getDisparosWithFilters(baseId, tableId, filters);
  }

  async createSampleData(baseId: string): Promise<boolean> {
    const tableId = await this.getDisparosTableId(baseId);
    if (!tableId) {
      return false;
    }
    return await this.sampleDataService.createSampleData(baseId, tableId);
  }
}
