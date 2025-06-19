
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { userContextService } from '../../userContextService';

export class StatsCalculationService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // IDs específicos das tabelas
  private DISPARO_EM_MASSA_TABLE_ID = 'myx4lsmm5i02xcd';
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private getClientId(): string {
    return userContextService.getClientId();
  }

  private getUserId(): string {
    return userContextService.getUserId();
  }

  async getCalculatedStats(baseId: string): Promise<any> {
    try {
      const userId = this.getUserId();
      const clientId = this.getClientId();
      console.log('🔄 Calculando estatísticas para usuário:', { userId, clientId });
      
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
        date: new Date().toISOString().split('T')[0],
        user_id: userId,
        client_id: clientId
      };

      console.log('✅ Estatísticas calculadas para usuário', userId, ':', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return {
        total_disparos: 0,
        total_notifications: 0,
        success_rate: 0,
        unique_contacts: 0,
        disparos_today: 0,
        notifications_today: 0,
        user_id: this.getUserId(),
        client_id: this.getClientId()
      };
    }
  }

  async getDisparosStats(baseId: string): Promise<any> {
    try {
      const userId = this.getUserId();
      const clientId = this.getClientId();
      
      console.log('📡 Buscando estatísticas de disparos para usuário:', { userId, clientId });
      
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
        
        // Enhanced filtering with multiple user identification fields
        const userDisparos = allDisparos.filter(d => {
          const recordUserId = d.user_id || d.User_id || d.userId;
          const recordClientId = d['Cliente ID'] || d.client_id || d.Client_id || d.clientId;
          
          // Match against both user_id and client_id for maximum compatibility
          return recordUserId === userId || recordClientId === clientId || recordClientId === userId;
        });

        console.log(`📊 ${userDisparos.length} disparos filtrados para usuário ${userId}`);
        
        if (userDisparos.length === 0) {
          console.log('⚠️ Nenhum disparo encontrado para este usuário');
          return { total: 0, today: 0, successRate: 0, uniqueContacts: 0, totalSent: 0, totalRecipients: 0 };
        }
        
        const today = new Date().toISOString().split('T')[0];
        const disparosToday = userDisparos.filter(d => {
          const createdAt = d.CreatedAt || d['Criado em'] || d.created_at;
          return createdAt && createdAt.startsWith(today);
        });

        // Calcular estatísticas usando os campos corretos da tabela
        const totalCampaigns = userDisparos.length;
        
        // Somar total de destinatários de todas as campanhas
        const totalRecipients = userDisparos.reduce((acc, d) => {
          const count = parseInt(d['Total de Destinatários'] || d.recipient_count || '0');
          return acc + count;
        }, 0);

        // Somar mensagens enviadas com sucesso
        const totalSent = userDisparos.reduce((acc, d) => {
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

        console.log('📈 Estatísticas de disparos para usuário', userId, ':', stats);
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
      const userId = this.getUserId();
      const clientId = this.getClientId();
      
      console.log('📡 Buscando estatísticas de notificações para usuário:', { userId, clientId });
      
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
        
        // Filtrar notificações pelo usuário atual
        const userNotifications = allNotifications.filter(n => {
          const recordUserId = n.user_id || n.User_id || n.userId;
          const recordClientId = n['Cliente ID'] || n.client_id || n.Client_id || n.clientId;
          
          // Verificar se a notificação pertence ao usuário atual
          const belongsToUser = recordUserId === userId || recordClientId === clientId || recordClientId === userId;
          
          console.log('🔍 Verificando notificação:', {
            id: n.Id || n.id,
            recordUserId,
            recordClientId,
            currentUserId: userId,
            currentClientId: clientId,
            belongsToUser
          });
          
          return belongsToUser;
        });
        
        console.log(`📊 ${userNotifications.length} notificações filtradas para usuário ${userId}`);
        
        const today = new Date().toISOString().split('T')[0];
        const notificationsToday = userNotifications.filter(n => {
          const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt;
          return eventDate && eventDate.startsWith(today);
        });

        // Contar notificações ativas (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeNotifications = userNotifications.filter(n => {
          const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt;
          if (!eventDate) return false;
          
          const notificationDate = new Date(eventDate);
          return notificationDate >= thirtyDaysAgo;
        });

        const stats = {
          total: activeNotifications.length, // Mudança: usar notificações ativas em vez do total
          today: notificationsToday.length,
          active: activeNotifications.length, // Notificações dos últimos 30 dias
          allTime: userNotifications.length // Total histórico
        };

        console.log('📈 Estatísticas de notificações para usuário', userId, ':', stats);
        return stats;
      }

      console.log('❌ Erro na resposta da API de notificações:', response.status);
      return { total: 0, today: 0, active: 0, allTime: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de notificações:', error);
      return { total: 0, today: 0, active: 0, allTime: 0 };
    }
  }
}
