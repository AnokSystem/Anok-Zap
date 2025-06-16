
import { ClientService } from './clientService';
import { NocodbConfig } from '../types';

export class DataOperationsService extends ClientService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async getClientData(baseId: string, tableName: string, limit: number = 100): Promise<any[]> {
    try {
      const clientId = this.getClientId();
      const tableId = await this.getTableId(baseId, tableName);
      
      if (!tableId) {
        console.log(`❌ Tabela ${tableName} não encontrada`);
        return [];
      }

      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&limit=${limit}&sort=-CreatedAt`;
      console.log('📡 Buscando dados do cliente:', url);
      
      const response = await fetch(url, {
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.list?.length || 0} registros encontrados para cliente ${clientId}`);
        return data.list || [];
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao buscar dados (${response.status}):`, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do cliente:', error);
      return [];
    }
  }
}
