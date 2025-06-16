
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class DisparosFilterService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async getDisparosWithFilters(baseId: string, tableId: string, filters: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    instanceId?: string;
    campaignName?: string;
  } = {}): Promise<any[]> {
    try {
      const allDisparos = await this.getAllDisparos(baseId, tableId);
      
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

  private async getAllDisparos(baseId: string, tableId: string): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📋 Buscando TODOS os disparos da tabela myx4lsmm5i02xcd para cliente:', clientId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=10000&sort=-id`,
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
}
