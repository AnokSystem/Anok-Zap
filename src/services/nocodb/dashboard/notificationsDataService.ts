
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class NotificationsDataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // IDs específicos das tabelas
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async getRecentNotifications(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      console.log('🔔 Buscando TODAS as notificações recentes para cliente:', clientId);
      
      // Buscar todas as notificações sem filtro restritivo na URL
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?limit=10000&sort=-Id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais encontradas na tabela`);
        
        // Filtro mais flexível para client_id
        const clientNotifications = allNotifications.filter(n => {
          if (!n.client_id && !n.Client_id && !n.clientId) {
            return true; // Incluir notificações sem client_id
          }
          const hasClientId = n.client_id === clientId || 
                             n.Client_id === clientId || 
                             n.clientId === clientId;
          return hasClientId;
        });
        
        // Aplicar limite apenas após o filtro
        const limitedNotifications = clientNotifications.slice(0, limit);
        
        console.log(`✅ ${limitedNotifications.length} notificações recentes encontradas para cliente ${clientId}`);
        return limitedNotifications;
      }

      console.log('❌ Erro na resposta:', response.status);
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar notificações recentes:', error);
      return [];
    }
  }
}
