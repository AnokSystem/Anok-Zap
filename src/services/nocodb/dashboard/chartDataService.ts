
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class ChartDataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // ID fixo da tabela de disparos em massa
  private MASS_MESSAGING_TABLE_ID = 'myx4lsmm5i02xcd';
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📈 Buscando dados da tabela de disparos em massa para gráfico...');
      console.log('🎯 Cliente ID:', clientId);
      console.log('🗓️ Últimos', days, 'dias');

      // Buscar dados da tabela de disparos em massa com ID fixo
      const timestamp = Date.now();
      const dataResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.MASS_MESSAGING_TABLE_ID}?limit=1000&sort=-CreatedAt&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (!dataResponse.ok) {
        console.error('❌ Erro ao buscar dados da tabela de disparos:', dataResponse.status);
        return this.createEmptyChartData(days);
      }

      const data = await dataResponse.json();
      const allDisparos = data.list || [];
      
      console.log(`📊 ${allDisparos.length} disparos encontrados na tabela`);
      
      if (allDisparos.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(allDisparos[0]));
        console.log('📝 Primeiro registro:', allDisparos[0]);
      }

      // Filtrar por client_id
      const clientDisparos = allDisparos.filter(d => {
        const hasClientId = d['Cliente ID'] === clientId || 
                           d.client_id === clientId ||
                           (!d['Cliente ID'] && !d.client_id); // Incluir disparos sem client_id para debug
        return hasClientId;
      });
      
      console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId}`);

      // Gerar dados para os últimos dias
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Filtrar disparos do dia
        const dayDisparos = clientDisparos.filter(d => {
          const createdAt = d.CreatedAt || d['Criado em'] || d.created_at || d['Hora de Início'];
          if (!createdAt) return false;
          
          const recordDate = new Date(createdAt);
          return recordDate >= date && recordDate < nextDate;
        });
        
        console.log(`📅 ${dateStr}: ${dayDisparos.length} disparos encontrados`);
        
        // Calcular totais do dia
        const totalDisparos = dayDisparos.reduce((acc, d) => {
          const count = parseInt(d['Total de Destinatários'] || d.recipient_count || '0');
          return acc + count;
        }, 0);
        
        const totalSucesso = dayDisparos.reduce((acc, d) => {
          // Usar dados reais da tabela - contatos alcançados ou mensagens enviadas
          const reached = parseInt(d['Mensagens Enviadas'] || d.sent_count || '0');
          return acc + reached;
        }, 0);
        
        console.log(`📊 ${dateStr}: ${totalDisparos} disparos, ${totalSucesso} sucessos`);
        
        chartData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          disparos: totalDisparos,
          sucesso: totalSucesso
        });
      }

      console.log('📊 Dados finais do gráfico de disparos:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de disparos:', error);
      return this.createEmptyChartData(days);
    }
  }

  private createEmptyChartData(days: number): any[] {
    console.log('⚠️ Criando dados vazios para o gráfico');
    const emptyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      emptyData.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        disparos: 0,
        sucesso: 0
      });
    }
    return emptyData;
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      console.log('📊 Buscando dados do gráfico de notificações para cliente:', clientId);
      
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?limit=10000&sort=-Id&_t=${timestamp}`,
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
        
        // Filtro mais flexível para client_id
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
        
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayNotifications = clientNotifications.filter(n => {
            const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt;
            return eventDate && eventDate.startsWith(dateStr);
          });
          
          // Contar notificações por plataforma
          const hotmart = dayNotifications.filter(n => 
            (n.platform || '').toLowerCase().includes('hotmart') ||
            (n.source || '').toLowerCase().includes('hotmart')
          ).length;
          
          const eduzz = dayNotifications.filter(n => 
            (n.platform || '').toLowerCase().includes('eduzz') ||
            (n.source || '').toLowerCase().includes('eduzz')
          ).length;
          
          const monetizze = dayNotifications.filter(n => 
            (n.platform || '').toLowerCase().includes('monetizze') ||
            (n.source || '').toLowerCase().includes('monetizze')
          ).length;
          
          const outras = dayNotifications.length - (hotmart + eduzz + monetizze);
          
          chartData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            hotmart: hotmart || outras,
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
