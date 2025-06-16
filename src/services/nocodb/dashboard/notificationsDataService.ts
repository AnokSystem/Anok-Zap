
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
      console.log('🎯 Usando tabela específica ID:', this.NOTIFICACOES_PLATAFORMAS_TABLE_ID);
      
      // Buscar todas as notificações da tabela específica
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?limit=10000&sort=-Id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais encontradas na tabela específica`);
        
        // Filtro mais flexível para client_id
        const clientNotifications = allNotifications.filter(n => {
          // Se não há client_id definido, incluir para todos os clientes
          if (!n.client_id && !n.Client_id && !n.clientId) {
            return true;
          }
          // Verificar múltiplas variações do campo client_id
          const hasClientId = n.client_id === clientId || 
                             n.Client_id === clientId || 
                             n.clientId === clientId;
          return hasClientId;
        });
        
        // Aplicar limite apenas após o filtro
        const limitedNotifications = clientNotifications.slice(0, limit);
        
        console.log(`✅ ${limitedNotifications.length} notificações recentes encontradas para cliente ${clientId}`);
        console.log('📋 Amostra dos dados:', limitedNotifications.slice(0, 2));
        
        return limitedNotifications;
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

  async getAllNotifications(baseId: string): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      console.log('📋 Buscando TODAS as notificações para cliente:', clientId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?limit=10000&sort=-Id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais na tabela`);
        
        // Filtrar por cliente se necessário
        const filteredNotifications = allNotifications.filter(n => {
          if (!n.client_id && !n.Client_id && !n.clientId) {
            return true;
          }
          return n.client_id === clientId || n.Client_id === clientId || n.clientId === clientId;
        });
        
        console.log(`✅ ${filteredNotifications.length} notificações para o cliente ${clientId}`);
        return filteredNotifications;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar todas as notificações:', error);
      return [];
    }
  }

  async getNotificationsWithFilters(baseId: string, filters: {
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
    platform?: string;
    status?: string;
  } = {}): Promise<any[]> {
    try {
      const allNotifications = await this.getAllNotifications(baseId);
      
      let filteredData = allNotifications;
      
      // Aplicar filtros
      if (filters.dateFrom) {
        filteredData = filteredData.filter(n => {
          const notificationDate = new Date(n.event_date || n.CreatedAt || n.created_at);
          return notificationDate >= new Date(filters.dateFrom!);
        });
      }
      
      if (filters.dateTo) {
        filteredData = filteredData.filter(n => {
          const notificationDate = new Date(n.event_date || n.CreatedAt || n.created_at);
          return notificationDate <= new Date(filters.dateTo!);
        });
      }
      
      if (filters.eventType) {
        filteredData = filteredData.filter(n => 
          (n.event_type || '').toLowerCase().includes(filters.eventType!.toLowerCase())
        );
      }
      
      if (filters.platform) {
        filteredData = filteredData.filter(n => 
          (n.platform || '').toLowerCase().includes(filters.platform!.toLowerCase())
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(n => 
          (n.status || '').toLowerCase().includes(filters.status!.toLowerCase())
        );
      }
      
      console.log(`🔍 ${filteredData.length} notificações após aplicar filtros`);
      return filteredData;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações com filtros:', error);
      return [];
    }
  }
}
