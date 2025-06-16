import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';

export class DashboardService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async getDashboardStats(baseId: string): Promise<any> {
    try {
      console.log('📊 Buscando estatísticas do dashboard na base:', baseId);
      
      // Verificar se a base está acessível
      const baseTest = await this.testBaseConnection(baseId);
      if (!baseTest) {
        console.log('❌ Base não acessível, retornando estatísticas calculadas');
        return await this.getCalculatedStats(baseId);
      }

      const tableId = await this.getTableId(baseId, 'DashboardStats');
      if (!tableId) {
        console.log('❌ Tabela DashboardStats não encontrada, calculando em tempo real');
        return await this.getCalculatedStats(baseId);
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
          console.log('✅ Estatísticas encontradas na tabela:', data.list[0]);
          return data.list[0];
        }
      }

      // Se não encontrar estatísticas do dia, calcular em tempo real
      console.log('🔄 Calculando estatísticas em tempo real...');
      return await this.getCalculatedStats(baseId);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return await this.getCalculatedStats(baseId);
    }
  }

  private async testBaseConnection(baseId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        headers: this.headers,
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao testar conexão com a base:', error);
      return false;
    }
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
      
      // Tentar salvar as estatísticas calculadas para cache futuro
      await this.saveDashboardStats(baseId, stats);
      
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

  private async saveDashboardStats(baseId: string, stats: any): Promise<void> {
    try {
      const tableId = await this.getTableId(baseId, 'DashboardStats');
      if (!tableId) {
        console.log('⚠️ Tabela DashboardStats não encontrada, não foi possível salvar cache');
        return;
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          date: stats.date,
          total_disparos: stats.total_disparos,
          total_notifications: stats.total_notifications,
          success_rate: stats.success_rate,
          unique_contacts: stats.unique_contacts,
          disparos_today: stats.disparos_today,
          notifications_today: stats.notifications_today,
          client_id: 'default', // Identificação do cliente
          updated_at: new Date().toISOString()
        }),
      });

      if (response.ok) {
        console.log('✅ Estatísticas salvas em cache');
      }
    } catch (error) {
      console.log('⚠️ Erro ao salvar cache de estatísticas:', error);
    }
  }

  private async getClientId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async getDisparosStats(baseId: string): Promise<any> {
    try {
      const clientId = await this.getClientId();
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (!tableId) {
        console.log('❌ Tabela MassMessagingLogs não encontrada');
        return { total: 0, today: 0, successRate: 0, uniqueContacts: 0 };
      }

      console.log('📡 Buscando dados de disparos na tabela:', tableId);
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&limit=1000&sort=-start_time`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const disparos = data.list || [];
        
        console.log(`📊 ${disparos.length} disparos encontrados para cliente ${clientId}`);
        
        const today = new Date().toISOString().split('T')[0];
        const disparosToday = disparos.filter(d => 
          d.start_time && d.start_time.startsWith(today)
        );

        const totalSent = disparos.reduce((acc, d) => acc + (parseInt(d.sent_count) || 0), 0);
        const totalErrors = disparos.reduce((acc, d) => acc + (parseInt(d.error_count) || 0), 0);
        const successRate = totalSent > 0 ? ((totalSent - totalErrors) / totalSent) * 100 : 0;

        const stats = {
          total: disparos.length,
          today: disparosToday.length,
          successRate: Math.round(successRate * 10) / 10,
          uniqueContacts: totalSent
        };

        console.log('📈 Estatísticas de disparos:', stats);
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
      const tableId = await this.getTableId(baseId, 'NotificacoesPlataformas');
      if (!tableId) {
        console.log('❌ Tabela NotificacoesPlataformas não encontrada');
        return { total: 0, today: 0 };
      }

      console.log('📡 Buscando dados de notificações na tabela:', tableId);
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&limit=1000&sort=-event_date`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const notifications = data.list || [];
        
        console.log(`📊 ${notifications.length} notificações encontradas para cliente ${clientId}`);
        
        const today = new Date().toISOString().split('T')[0];
        const notificationsToday = notifications.filter(n => 
          n.event_date && n.event_date.startsWith(today)
        );

        const stats = {
          total: notifications.length,
          today: notificationsToday.length
        };

        console.log('📈 Estatísticas de notificações:', stats);
        return stats;
      }

      console.log('❌ Erro na resposta da API:', response.status);
      return { total: 0, today: 0 };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de notificações:', error);
      return { total: 0, today: 0 };
    }
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      console.log('📨 Buscando disparos recentes para cliente:', clientId);
      
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (!tableId) {
        console.log('❌ Tabela MassMessagingLogs não encontrada');
        return [];
      }

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&limit=${limit}&sort=-start_time`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.list?.length || 0} disparos recentes encontrados`);
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
      const clientId = await this.getClientId();
      console.log('🔔 Buscando notificações recentes para cliente:', clientId);
      
      const tableId = await this.getTableId(baseId, 'NotificacoesPlataformas');
      if (!tableId) {
        console.log('❌ Tabela NotificacoesPlataformas não encontrada');
        return [];
      }

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&limit=${limit}&sort=-event_date`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.list?.length || 0} notificações recentes encontradas`);
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
      const clientId = await this.getClientId();
      console.log('📈 Buscando dados do gráfico de disparos para cliente:', clientId);
      
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (!tableId) return [];

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&sort=-start_time&limit=1000`,
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
          
          const totalSent = dayDisparos.reduce((acc, d) => acc + (parseInt(d.sent_count) || 0), 0);
          const totalErrors = dayDisparos.reduce((acc, d) => acc + (parseInt(d.error_count) || 0), 0);
          
          chartData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            disparos: totalSent,
            sucesso: totalSent - totalErrors
          });
        }

        console.log('📊 Dados do gráfico calculados:', chartData);
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
      const clientId = await this.getClientId();
      console.log('📊 Buscando dados do gráfico de notificações para cliente:', clientId);
      
      const tableId = await this.getTableId(baseId, 'NotificacoesPlataformas');
      if (!tableId) return [];

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&sort=-event_date&limit=1000`,
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

        console.log('📊 Dados do gráfico de notificações calculados:', chartData);
        return chartData;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de notificações:', error);
      return [];
    }
  }
}
