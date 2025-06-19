
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { userContextService } from '../../userContextService';

export class ClientService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  protected getClientId(): string {
    return userContextService.getClientId();
  }

  protected getCurrentUser() {
    return userContextService.getCurrentUser();
  }

  protected async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      // Ensure client_id is always included
      const dataWithClient = {
        ...data,
        client_id: this.getClientId()
      };

      console.log('💾 Salvando dados com client_id:', dataWithClient.client_id);

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(dataWithClient),
        }
      );

      if (response.ok) {
        console.log('✅ Dados salvos com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao salvar:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar na tabela:', error);
      return false;
    }
  }

  protected async getClientFilteredData(baseId: string, tableId: string, limit: number = 100): Promise<any[]> {
    try {
      const clientId = this.getClientId();
      console.log('🔍 Buscando dados filtrados para cliente:', clientId);

      // Add timestamp for cache busting
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&sort=-Id&_t=${timestamp}`,
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
        const allRecords = data.list || [];
        
        console.log(`📊 ${allRecords.length} registros totais encontrados`);
        
        // Filter by client - be flexible with different field names
        const clientRecords = allRecords.filter(record => {
          const recordClientId = record.client_id || 
                                record.Client_id || 
                                record.clientId ||
                                record['Cliente ID'];
          
          // If no client_id field exists, include the record (for backwards compatibility)
          if (!recordClientId) {
            return true;
          }
          
          return recordClientId === clientId;
        });
        
        console.log(`✅ ${clientRecords.length} registros filtrados para cliente ${clientId}`);
        return clientRecords;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar dados:', response.status, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados filtrados:', error);
      return [];
    }
  }
}
