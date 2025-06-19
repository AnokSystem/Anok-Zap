
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

  protected getUserId(): string {
    return userContextService.getUserId();
  }

  protected getCurrentUser() {
    return userContextService.getCurrentUser();
  }

  protected async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      // Ensure both client_id and user_id are always included for maximum compatibility
      const dataWithUser = {
        ...data,
        client_id: this.getClientId(),
        user_id: this.getUserId()
      };

      console.log('💾 Salvando dados com identificadores de usuário:', {
        client_id: dataWithUser.client_id,
        user_id: dataWithUser.user_id
      });

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(dataWithUser),
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
      const userId = this.getUserId();
      console.log('🔍 Buscando dados filtrados para usuário:', { clientId, userId });

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
        
        // Filter by user - check multiple possible field names for maximum compatibility
        const userRecords = allRecords.filter(record => {
          const recordUserId = record.user_id || 
                              record.User_id || 
                              record.userId ||
                              record.client_id || 
                              record.Client_id || 
                              record.clientId ||
                              record['Cliente ID'] ||
                              record['User ID'];
          
          // If no user identification field exists, exclude the record for security
          if (!recordUserId) {
            return false;
          }
          
          // Match against both user_id and client_id for compatibility
          return recordUserId === userId || recordUserId === clientId;
        });
        
        console.log(`✅ ${userRecords.length} registros filtrados para usuário ${userId}`);
        return userRecords;
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
