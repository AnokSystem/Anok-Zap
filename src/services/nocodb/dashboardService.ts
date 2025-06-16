
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';

export class DashboardService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async getDashboardStats(baseId: string): Promise<any> {
    try {
      console.log('📊 Buscando estatísticas do dashboard...');
      
      const tableId = await this.getTableId(baseId, 'DashboardStats');
      if (!tableId) {
        console.log('❌ Tabela DashboardStats não encontrada');
        return this.getCalculatedStats(baseId);
      }

      // Buscar estatísticas do dia atual
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(date,eq,${today})&limit=1`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.list && data.list.length > 0) {
          console.log('✅ Estatísticas encontradas:', data.list[0]);
          return data.list[0];
        }
      }

      // Se não encontrar estatísticas do dia, calcular em tempo real
      return await this.getCalculatedStats(baseId);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return await this.getCalculatedStats(baseId);
    }
  }

  async getCalculatedStats(baseId: string): Promise<any> {
    try {
      console.log('🔄 Calculando estatísticas em tempo real...');
      
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
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (!tableId) return { total: 0, today: 0, successRate: 0, uniqueContacts: 0 };

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const disparos = data.list || [];
        
        const today = new Date().toISOString().split('T')[0];
        const disparosToday = disparos.filter(d => 
          d.start_time && d.start_time.startsWith(today)
        );

        const totalSent = disparos.reduce((acc, d) => acc + (d.sent_count || 0), 0);
        const totalErrors = disparos.reduce((acc, d) => acc + (d.error_count || 0), 0);
        const successRate = totalSent > 0 ? ((totalSent - totalErrors) / totalSent) * 100 : 0;

        return {
          total: disparos.length,
          today: disparosToday.length,
          successRate: Math.round(successRate * 10) / 10,
          uniqueContacts: totalSent
        };
      }

      return { total: 0, today: 0, successRate: 0, uniqueContacts: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de disparos:', error);
      return { total: 0, today: 0, successRate: 0, uniqueContacts: 0 };
    }
  }

  async getNotificationsStats(baseId: string): Promise<any> {
    try {
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      if (!tableId) return { total: 0, today: 0 };

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const notifications = data.list || [];
        
        const today = new Date().toISOString().split('T')[0];
        const notificationsToday = notifications.filter(n => 
          n.event_date && n.event_date.startsWith(today)
        );

        return {
          total: notifications.length,
          today: notificationsToday.length
        };
      }

      return { total: 0, today: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de notificações:', error);
      return { total: 0, today: 0 };
    }
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      console.log('📨 Buscando disparos recentes...');
      
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (!tableId) {
        console.log('❌ Tabela MassMessagingLogs não encontrada');
        return [];
      }

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&sort=-start_time`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.list?.length || 0} disparos encontrados`);
        return data.list || [];
      }

      console.log('❌ Erro na resposta:', response.status);
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar disparos recentes:', error);
      return [];
    }
  }

  async getRecentNotifications(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      console.log('🔔 Buscando notificações recentes...');
      
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      if (!tableId) {
        console.log('❌ Tabela NotificacoesHotmart não encontrada');
        return [];
      }

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&sort=-event_date`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.list?.length || 0} notificações encontradas`);
        return data.list || [];
      }

      console.log('❌ Erro na resposta:', response.status);
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar notificações recentes:', error);
      return [];
    }
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      console.log('📈 Buscando dados do gráfico de disparos...');
      
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (!tableId) return [];

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?sort=-start_time`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const disparos = data.list || [];
        
        // Agrupar por data
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayDisparos = disparos.filter(d => 
            d.start_time && d.start_time.startsWith(dateStr)
          );
          
          const totalSent = dayDisparos.reduce((acc, d) => acc + (d.sent_count || 0), 0);
          const totalErrors = dayDisparos.reduce((acc, d) => acc + (d.error_count || 0), 0);
          
          chartData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            disparos: totalSent,
            sucesso: totalSent - totalErrors
          });
        }

        return chartData;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico:', error);
      return [];
    }
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      console.log('📊 Buscando dados do gráfico de notificações...');
      
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      if (!tableId) return [];

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?sort=-event_date`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const notifications = data.list || [];
        
        // Agrupar por data e plataforma
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayNotifications = notifications.filter(n => 
            n.event_date && n.event_date.startsWith(dateStr)
          );
          
          const hotmart = dayNotifications.filter(n => n.platform === 'hotmart').length;
          const eduzz = dayNotifications.filter(n => n.platform === 'eduzz').length;
          const monetizze = dayNotifications.filter(n => n.platform === 'monetizze').length;
          
          chartData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            hotmart,
            eduzz,
            monetizze
          });
        }

        return chartData;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de notificações:', error);
      return [];
    }
  }
}
