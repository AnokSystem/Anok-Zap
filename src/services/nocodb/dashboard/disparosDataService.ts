
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { TableDiscoveryService } from './tableDiscoveryService';

export class DisparosDataService extends BaseNocodbService {
  private tableDiscovery: TableDiscoveryService;
  private cachedTableId: string | null = null;

  constructor(config: NocodbConfig) {
    super(config);
    this.tableDiscovery = new TableDiscoveryService(config);
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
    try {
      const allDisparos = await this.getAllDisparos(baseId);
      
      let filteredData = allDisparos;
      
      // Aplicar filtros
      if (filters.dateFrom) {
        filteredData = filteredData.filter(d => {
          const disparoDate = new Date(d.start_time || d.CreatedAt || d.created_at);
          return disparoDate >= new Date(filters.dateFrom!);
        });
      }
      
      if (filters.dateTo) {
        filteredData = filteredData.filter(d => {
          const disparoDate = new Date(d.start_time || d.CreatedAt || d.created_at);
          return disparoDate <= new Date(filters.dateTo!);
        });
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(d => 
          (d.status || '').toLowerCase().includes(filters.status!.toLowerCase())
        );
      }
      
      if (filters.instanceId) {
        filteredData = filteredData.filter(d => 
          (d.instance_id || d.instance_name || '').toLowerCase().includes(filters.instanceId!.toLowerCase())
        );
      }
      
      if (filters.campaignName) {
        filteredData = filteredData.filter(d => 
          (d.campaign_name || '').toLowerCase().includes(filters.campaignName!.toLowerCase())
        );
      }
      
      console.log(`🔍 ${filteredData.length} disparos após aplicar filtros`);
      return filteredData;
    } catch (error) {
      console.error('❌ Erro ao buscar disparos com filtros:', error);
      return [];
    }
  }

  async createSampleData(baseId: string): Promise<boolean> {
    try {
      const tableId = await this.getDisparosTableId(baseId);
      const clientId = await this.getClientId();
      
      if (!tableId) {
        console.error('❌ Tabela não disponível para criar dados de exemplo');
        return false;
      }

      console.log('📝 Criando dados de exemplo para disparos...');

      const sampleData = [
        {
          campaign_name: 'Campanha de Boas-vindas',
          instance_name: 'Instance Principal',
          instance_id: 'inst_001',
          recipient_count: 150,
          sent_count: 148,
          error_count: 2,
          status: 'Concluído',
          message_type: 'text',
          start_time: new Date().toISOString(),
          client_id: clientId
        },
        {
          campaign_name: 'Promoção Black Friday',
          instance_name: 'Instance Secundária',
          instance_id: 'inst_002',
          recipient_count: 300,
          sent_count: 285,
          error_count: 15,
          status: 'Concluído',
          message_type: 'media',
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          client_id: clientId
        }
      ];

      for (const data of sampleData) {
        await fetch(
          `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
          {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
          }
        );
      }

      console.log('✅ Dados de exemplo criados para disparos');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar dados de exemplo:', error);
      return false;
    }
  }
}
