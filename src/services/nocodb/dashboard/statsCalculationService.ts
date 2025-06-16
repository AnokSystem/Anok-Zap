
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class StatsCalculationService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // IDs específicos das tabelas
  private DISPARO_EM_MASSA_TABLE_ID = 'myx4lsmm5i02xcd';
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async getCalculatedStats(baseId: string): Promise<any> {
    try {
      console.log('🔄 Calculando estatísticas em tempo real para base:', baseId);
      
      const [disparosStats, notificationsStats] = await Promise.all([
        this.getDisparosStats(baseId),
        this.getNotificationsStats(baseId)
      ]);

      const stats = {
        total_disparos: disparosStats.total,
        total_notifications: notificationsStats.total,
        success_rate: disparosStats.successRate,
        unique_contacts: disparosStats.uniqueContacts,
        disparos_today: disparosStats.today,
        notifications_today: notificationsStats.today,
        date: new Date().toISOString().split('T')[0]
      };

      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return {
        total_disparos: 0,
        total_notifications: 0,
        success_rate: 0,
        unique_contacts: 0,
        disparos_today: 0,
        notifications_today: 0
      };
    }
  }

  async getDisparosStats(baseId: string): Promise<any> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📡 Buscando TODOS os dados de disparos na tabela:', this.DISPARO_EM_MASSA_TABLE_ID);
      
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?limit=10000&_t=${timestamp}`,
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
        
        console.log(`📊 ${allDisparos.length} disparos totais encontrados na tabela`);
        console.log('📋 Exemplo de dados:', allDisparos.slice(0, 1));
        
        // Filtrar por cliente se necessário
        const clientDisparos = allDisparos.filter(d => {
          if (!d.client_id && !d.Client_id && !d.clientId) {
            return true;
          }
          const hasClientId = d.client_id === clientId || 
                             d.Client_id === clientId || 
                             d.clientId === clientId;
          return hasClientId;
        });

        console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId}`);
        
        const today = new Date().toISOString().split('T')[0];
        const disparosToday = clientDisparos.filter(d => {
          const createdAt = d.CreatedAt || d.created_at || d.start_time || d.createdAt;
          return createdAt && createdAt.startsWith(today);
        });

        // Calcular estatísticas baseadas nos campos reais da tabela
        const totalSent = clientDisparos.reduce((acc, d) => {
          // Buscar diferentes variações dos campos de contagem
          const count = parseInt(
            d.recipient_count || 
            d.recipientCount || 
            d.sent_count || 
            d.total_recipients ||
            d.total_contacts ||
            0
          );
          return acc + count;
        }, 0);

        const totalSuccess = clientDisparos.reduce((acc, d) => {
          const sent = parseInt(
            d.sent_count || 
            d.sentCount || 
            d.recipient_count || 
            d.successful_sends ||
            0
          );
          const errors = parseInt(
            d.error_count || 
            d.errorCount || 
            d.failed_sends ||
            0
          );
          return acc + Math.max(0, sent - errors);
        }, 0);

        const successRate = totalSent > 0 ? ((totalSuccess / totalSent) * 100) : 0;

        const stats = {
          total: clientDisparos.length,
          today: disparosToday.length,
          successRate: Math.round(successRate * 10) / 10,
          uniqueContacts: totalSent
        };

        console.log('📈 Estatísticas de disparos calculadas:', stats);
        return stats;
      }

      console.log('❌ Erro na resposta da API:', response.status);
      return { total: 0, today: 0, successRate: 0, uniqueContacts: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de disparos:', error);
      return { total: 0, today: 0, successRate: 0, uniqueContacts: 0 };
    }
  }

  async getNotificationsStats(baseId: string): Promise<any> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📡 Buscando TODAS as notificações na tabela:', this.NOTIFICACOES_PLATAFORMAS_TABLE_ID);
      
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?limit=10000&_t=${timestamp}`,
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
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais encontradas na tabela`);
        console.log('📋 Exemplo de dados:', allNotifications.slice(0, 1));
        
        // Filtrar por cliente se necessário
        const clientNotifications = allNotifications.filter(n => {
          if (!n.client_id && !n.Client_id && !n.clientId) {
            return true;
          }
          const hasClientId = n.client_id === clientId || 
                             n.Client_id === clientId || 
                             n.clientId === clientId;
          return hasClientId;
        });
        
        console.log(`📊 ${clientNotifications.length} notificações filtradas para cliente ${clientId}`);
        
        const today = new Date().toISOString().split('T')[0];
        const notificationsToday = clientNotifications.filter(n => {
          const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt;
          return eventDate && eventDate.startsWith(today);
        });

        const stats = {
          total: clientNotifications.length,
          today: notificationsToday.length
        };

        console.log('📈 Estatísticas de notificações calculadas:', stats);
        return stats;
      }

      console.log('❌ Erro na resposta da API:', response.status);
      return { total: 0, today: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de notificações:', error);
      return { total: 0, today: 0 };
    }
  }
}
