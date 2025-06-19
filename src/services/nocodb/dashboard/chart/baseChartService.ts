
import { BaseNocodbService } from '../../baseService';
import { NocodbConfig } from '../../types';
import { userContextService } from '@/services/userContextService';

export class BaseChartService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  protected async getClientId(): Promise<string> {
    const userId = userContextService.getUserId();
    const clientId = userContextService.getClientId();
    
    console.log('🔍 GRÁFICO - Dados do usuário:', { userId, clientId });
    
    return clientId || userId || 'default';
  }

  protected async fetchTableData(baseId: string, tableId: string, limit: number = 1000): Promise<any[]> {
    const timestamp = Date.now();
    const dataResponse = await fetch(
      `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&sort=-CreatedAt&_t=${timestamp}`,
      {
        headers: {
          ...this.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      }
    );

    if (!dataResponse.ok) {
      console.error('❌ Erro ao buscar dados da tabela:', dataResponse.status);
      throw new Error(`Erro ${dataResponse.status}: ${await dataResponse.text()}`);
    }

    const data = await dataResponse.json();
    return data.list || [];
  }

  protected filterDataByUser(allData: any[], clientId: string): any[] {
    const userId = userContextService.getUserId();
    const userClientId = userContextService.getClientId();
    
    return allData.filter(record => {
      const recordClientId = record['Cliente ID'] || record.client_id;
      
      const belongsToUser = recordClientId === userId || 
                           recordClientId === userClientId ||
                           recordClientId === clientId;
                           
      console.log('🔍 GRÁFICO - Filtrando registro:', {
        recordClientId,
        userId,
        userClientId,
        clientId,
        belongsToUser
      });
      
      return belongsToUser;
    });
  }
}
