
import { BaseNotificationsService } from './baseNotificationsService';

export class NotificationsDataFetcher extends BaseNotificationsService {
  async fetchAllNotifications(baseId: string): Promise<any[]> {
    try {
      const tableId = await this.getNotificationsTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de notificações mzup2t8ygoiy5ub');
        return [];
      }

      console.log('📋 Buscando TODAS as notificações da tabela mzup2t8ygoiy5ub');
      
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=10000&sort=-CreatedAt&_t=${timestamp}`,
        {
          headers: this.createRequestHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais na tabela mzup2t8ygoiy5ub`);
        if (allNotifications.length > 0) {
          console.log('📋 Campos disponíveis:', Object.keys(allNotifications[0] || {}));
        }
        
        return allNotifications;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar todas as notificações:', error);
      return [];
    }
  }

  async fetchRecentNotifications(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const tableId = await this.getNotificationsTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de notificações mzup2t8ygoiy5ub');
        return [];
      }

      console.log('🔔 Buscando notificações recentes da tabela mzup2t8ygoiy5ub');

      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit * 3}&sort=-CreatedAt&_t=${timestamp}`,
        {
          headers: this.createRequestHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações encontradas na tabela mzup2t8ygoiy5ub`);
        if (allNotifications.length > 0) {
          console.log('📋 Primeiro registro para análise:', allNotifications[0]);
        }
        
        return allNotifications;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro na resposta (${response.status}):`, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar notificações recentes:', error);
      return [];
    }
  }
}
