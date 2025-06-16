
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class DisparosDataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // ID específico da tabela de Disparo em Massa
  private DISPARO_EM_MASSA_TABLE_ID = 'myx4lsmm5i02xcd';

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      console.log('📨 Buscando TODOS os disparos recentes para cliente:', clientId);
      console.log('🎯 Usando tabela específica ID:', this.DISPARO_EM_MASSA_TABLE_ID);

      // Buscar todos os disparos da tabela específica
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?limit=10000&sort=-Id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos totais encontrados na tabela específica`);
        
        // Filtro mais flexível para client_id
        const clientDisparos = allDisparos.filter(d => {
          // Se não há client_id definido, incluir para todos os clientes
          if (!d.client_id && !d.Client_id && !d.clientId) {
            return true;
          }
          // Verificar múltiplas variações do campo client_id
          const hasClientId = d.client_id === clientId || 
                             d.Client_id === clientId || 
                             d.clientId === clientId;
          return hasClientId;
        });
        
        // Aplicar limite apenas após o filtro
        const limitedDisparos = clientDisparos.slice(0, limit);
        
        console.log(`✅ ${limitedDisparos.length} disparos encontrados para cliente ${clientId}`);
        console.log('📋 Amostra dos dados:', limitedDisparos.slice(0, 2));
        
        return limitedDisparos;
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
      console.log('📋 Buscando TODOS os disparos para cliente:', clientId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?limit=10000&sort=-Id`,
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
}
