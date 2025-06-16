
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class ChartDataService extends BaseNocodbService {
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

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📈 Buscando TODOS os dados do gráfico de disparos para cliente:', clientId);
      
      // Buscar TODOS os disparos sem limite restritivo
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?sort=-Id&limit=10000`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos totais encontrados`);
        
        // Filtro mais flexível para client_id
        const clientDisparos = allDisparos.filter(d => {
          if (!d.client_id && !d.Client_id && !d.clientId) {
            return true; // Incluir disparos sem client_id
          }
          const hasClientId = d.client_id === clientId || 
                             d.Client_id === clientId || 
                             d.clientId === clientId;
          return hasClientId;
        });
        
        console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId}`);
        
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayDisparos = clientDisparos.filter(d => {
            const createdAt = d.CreatedAt || d.created_at || d.start_time || d.createdAt;
            return createdAt && createdAt.startsWith(dateStr);
          });
          
          const totalSent = dayDisparos.reduce((acc, d) => {
            const count = parseInt(d.sent_count || d.sentCount || d.recipient_count || 0);
            return acc + count;
          }, 0);
          
          const totalErrors = dayDisparos.reduce((acc, d) => {
            const errors = parseInt(d.error_count || d.errorCount || 0);
            return acc + errors;
          }, 0);
          
          chartData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            disparos: totalSent,
            sucesso: Math.max(0, totalSent - totalErrors)
          });
        }

        console.log('📊 Dados do gráfico calculados:', chartData);
        return chartData;
      }

      console.log('❌ Erro ao buscar dados do gráfico:', response.status);
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico:', error);
      return [];
    }
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      console.log('📊 Buscando TODOS os dados do gráfico de notificações para cliente:', clientId);
      
      // Buscar TODAS as notificações sem limite restritivo
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?sort=-Id&limit=10000`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais encontradas`);
        
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
        
        console.log(`📊 ${clientNotifications.length} notificações filtradas para cliente ${clientId}`);
        
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayNotifications = clientNotifications.filter(n => {
            const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt;
            return eventDate && eventDate.startsWith(dateStr);
          });
          
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
