
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
      
      console.log('📡 Buscando estatísticas de disparos da tabela:', this.DISPARO_EM_MASSA_TABLE_ID);
      
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
        
        console.log(`📊 ${allDisparos.length} disparos totais encontrados`);
        
        // Filtrar por cliente
        const clientDisparos = allDisparos.filter(d => {
          const clientMatches = d['Cliente ID'] === clientId || 
                               d.client_id === clientId ||
                               (!d['Cliente ID'] && !d.client_id);
          return clientMatches;
        });

        console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId}`);
        
        const today = new Date().toISOString().split('T')[0];
        const disparosToday = clientDisparos.filter(d => {
          const createdAt = d.CreatedAt || d['Criado em'] || d.created_at;
          return createdAt && createdAt.startsWith(today);
        });

        // Calcular estatísticas usando os campos corretos da tabela
        const totalCampaigns = clientDisparos.length;
        
        // Somar total de destinatários de todas as campanhas
        const totalRecipients = clientDisparos.reduce((acc, d) => {
          const count = parseInt(d['Total de Destinatários'] || d.recipient_count || '0');
          return acc + count;
        }, 0);

        // Somar mensagens enviadas com sucesso
        const totalSent = clientDisparos.reduce((acc, d) => {
          const sent = parseInt(d['Mensagens Enviadas'] || d.sent_count || '0');
          return acc + sent;
        }, 0);

        // Calcular taxa de sucesso baseada em mensagens enviadas vs destinatários
        const successRate = totalRecipients > 0 ? ((totalSent / totalRecipients) * 100) : 0;

        // Contatos únicos são baseados no total de destinatários únicos
        const uniqueContacts = totalRecipients;

        const stats = {
          total: totalCampaigns, // Número total de campanhas de disparo
          today: disparosToday.length, // Campanhas iniciadas hoje
          successRate: Math.round(successRate * 10) / 10,
          uniqueContacts: uniqueContacts, // Total de contatos que receberam mensagens
          totalSent: totalSent, // Total de mensagens enviadas
          totalRecipients: totalRecipients // Total de destinatários
        };

        console.log('📈 Estatísticas de disparos calculadas:', stats);
        return stats;
      }

      console.log('❌ Erro na resposta da API de disparos:', response.status);
      return { total: 0, today: 0, successRate: 0, uniqueContacts: 0, totalSent: 0, totalRecipients: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de disparos:', error);
      return { total: 0, today: 0, successRate: 0, uniqueContacts: 0, totalSent: 0, totalRecipients: 0 };
    }
  }

  async getNotificationsStats(baseId: string): Promise<any> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📡 Buscando estatísticas de notificações da tabela:', this.NOTIFICACOES_PLATAFORMAS_TABLE_ID);
      
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
        
        console.log(`📊 ${allNotifications.length} notificações totais encontradas`);
        
        // Filtrar por cliente
        const clientNotifications = allNotifications.filter(n => {
          const clientMatches = n.client_id === clientId || 
                               n.Client_id === clientId || 
                               n.clientId === clientId ||
                               (!n.client_id && !n.Client_id && !n.clientId);
          return clientMatches;
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

      console.log('❌ Erro na resposta da API de notificações:', response.status);
      return { total: 0, today: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de notificações:', error);
      return { total: 0, today: 0 };
    }
  }
}
