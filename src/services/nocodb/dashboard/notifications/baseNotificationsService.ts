
import { BaseNocodbService } from '../../baseService';
import { NocodbConfig } from '../../types';
import { userContextService } from '@/services/userContextService';

export class BaseNotificationsService extends BaseNocodbService {
  protected NOTIFICATIONS_TABLE_ID = 'mzup2t8ygoiy5ub';
  protected cachedTableId: string | null = null;

  constructor(config: NocodbConfig) {
    super(config);
  }

  protected async getNotificationsTableId(baseId: string): Promise<string | null> {
    if (this.cachedTableId) {
      return this.cachedTableId;
    }

    console.log('🔍 Usando ID fixo da tabela de notificações: mzup2t8ygoiy5ub');
    
    const tableId = this.NOTIFICATIONS_TABLE_ID;
    
    try {
      const testResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1`,
        {
          headers: this.headers,
        }
      );

      if (testResponse.ok) {
        console.log('✅ Tabela de notificações acessível com ID:', tableId);
        this.cachedTableId = tableId;
        return tableId;
      } else {
        console.log('❌ Tabela de notificações não acessível:', testResponse.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar tabela de notificações:', error);
      return null;
    }
  }

  protected getUserInfo() {
    return {
      userId: userContextService.getUserId(),
      clientId: userContextService.getClientId()
    };
  }

  protected createRequestHeaders() {
    return {
      ...this.headers,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
  }
}
