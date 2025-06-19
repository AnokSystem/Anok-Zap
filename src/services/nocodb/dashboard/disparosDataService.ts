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
    return user.ID || user.client_id || user.Email?.split('@')[0] || 'default';
  }

  private async getUserId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.ID || user.user_id || user.Email?.split('@')[0] || 'default';
  }

  private async getDisparosTableId(baseId: string): Promise<string | null> {
    if (this.cachedTableId) {
      return this.cachedTableId;
    }

    console.log('🔍 Usando ID fixo da tabela de disparos: myx4lsmm5i02xcd');
    
    const tableId = 'myx4lsmm5i02xcd';
    
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
      const userId = await this.getUserId();
      const tableId = await this.getDisparosTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de disparos myx4lsmm5i02xcd');
        return [];
      }

      console.log('📨 Buscando disparos recentes da tabela myx4lsmm5i02xcd para usuário:', { userId, clientId });

      // Add timestamp to prevent caching and ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos encontrados na tabela myx4lsmm5i02xcd`);
        console.log('📋 Primeiro registro para análise:', allDisparos[0]);
        
        // Apply filtering using the correct field name "Cliente ID"
        const userDisparos = allDisparos.filter(d => {
          // Use exact field name "Cliente ID" as shown in console logs
          const recordClientId = d['Cliente ID'];
          
          console.log('🔍 Analisando registro:', {
            recordId: d.ID,
            recordClientId,
            currentUserId: userId,
            currentClientId: clientId
          });
          
          // Check if record belongs to current user using the "Cliente ID" field
          const belongsToUser = recordClientId === userId || recordClientId === clientId;
          
          console.log('📋 Resultado da verificação:', {
            recordId: d.ID,
            belongsToUser,
            reason: belongsToUser ? 'INCLUÍDO' : 'EXCLUÍDO',
            matchedWith: recordClientId === userId ? 'userId' : recordClientId === clientId ? 'clientId' : 'nenhum'
          });
          
          return belongsToUser;
        });
        
        console.log(`✅ ${userDisparos.length} disparos filtrados para usuário ${userId}/${clientId}`);
        return userDisparos;
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
      const userId = await this.getUserId();
      const tableId = await this.getDisparosTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de disparos myx4lsmm5i02xcd');
        return [];
      }

      console.log('📋 Buscando TODOS os disparos da tabela myx4lsmm5i02xcd para usuário:', { userId, clientId });
      
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=10000&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos totais na tabela myx4lsmm5i02xcd`);
        console.log('📋 Campos disponíveis:', Object.keys(allDisparos[0] || {}));
        
        // Apply strict filtering using only the "Cliente ID" field
        const userDisparos = allDisparos.filter(d => {
          const recordClientId = d['Cliente ID'];
          
          const belongsToUser = recordClientId === userId || recordClientId === clientId;
          
          return belongsToUser;
        });
        
        console.log(`✅ ${userDisparos.length} disparos para o usuário ${userId}/${clientId}`);
        return userDisparos;
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
