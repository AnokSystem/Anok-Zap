
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

    console.log('🔍 Buscando ID da tabela de disparos...');
    const { disparosTableId } = await this.tableDiscovery.discoverTableIds(baseId);
    
    if (!disparosTableId) {
      console.log('⚠️ Tabela de disparos não encontrada, tentando criar...');
      const newTableId = await this.tableDiscovery.createDisparosTable(baseId);
      this.cachedTableId = newTableId;
      return newTableId;
    }

    this.cachedTableId = disparosTableId;
    return disparosTableId;
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      const tableId = await this.getDisparosTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível obter/criar tabela de disparos');
        return [];
      }

      console.log('📨 Buscando disparos recentes para cliente:', clientId);
      console.log('🎯 Usando tabela ID:', tableId);

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&sort=-id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos encontrados na tabela`);
        
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
        console.error('❌ Não foi possível obter/criar tabela de disparos');
        return [];
      }

      console.log('📋 Buscando TODOS os disparos para cliente:', clientId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=10000&sort=-id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos totais na tabela`);
        
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
