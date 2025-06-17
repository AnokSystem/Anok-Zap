import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class ChartDataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // Nome da tabela de disparos em massa
  private MASS_MESSAGING_TABLE_NAME = 'mass_messaging_logs';
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📈 Buscando dados da tabela mass_messaging_logs para cliente:', clientId);
      
      // Primeiro, descobrir o ID da tabela mass_messaging_logs
      const tablesResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`,
        {
          headers: this.headers,
        }
      );

      if (!tablesResponse.ok) {
        console.error('❌ Erro ao buscar tabelas:', tablesResponse.status);
        return [];
      }

      const tablesData = await tablesResponse.json();
      const tables = tablesData.list || [];
      
      console.log('📋 Tabelas disponíveis:', tables.map(t => t.table_name));
      
      // Procurar a tabela mass_messaging_logs
      const massMessagingTable = tables.find(t => 
        t.table_name === this.MASS_MESSAGING_TABLE_NAME || 
        t.title === 'Disparos em Massa' ||
        t.table_name.includes('mass_messaging') ||
        t.table_name.includes('disparo')
      );

      if (!massMessagingTable) {
        console.error('❌ Tabela mass_messaging_logs não encontrada');
        return [];
      }

      console.log('✅ Tabela encontrada:', massMessagingTable.table_name, 'ID:', massMessagingTable.id);

      // Buscar dados da tabela
      const timestamp = Date.now();
      const dataResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${massMessagingTable.id}?limit=1000&sort=-created_at&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (!dataResponse.ok) {
        console.error('❌ Erro ao buscar dados:', dataResponse.status);
        return [];
      }

      const data = await dataResponse.json();
      const allDisparos = data.list || [];
      
      console.log(`📊 ${allDisparos.length} disparos encontrados na tabela`);
      
      if (allDisparos.length > 0) {
        console.log('📋 Campos disponíveis no primeiro registro:', Object.keys(allDisparos[0]));
        console.log('📝 Exemplo de registro:', allDisparos[0]);
      }

      // Filtrar por client_id
      const clientDisparos = allDisparos.filter(d => {
        const hasClientId = d.client_id === clientId || 
                           d.Cliente_ID === clientId || 
                           d['Cliente ID'] === clientId ||
                           d.clientId === clientId;
        // Se não há client_id definido, incluir para debug
        if (!d.client_id && !d.Cliente_ID && !d['Cliente ID'] && !d.clientId) {
          return true;
        }
        return hasClientId;
      });
      
      console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId}`);

      // Gerar dados para os últimos 7 dias
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0); // Zerar horas para comparação exata de datas
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Filtrar disparos do dia
        const dayDisparos = clientDisparos.filter(d => {
          const createdAt = d.created_at || d.CreatedAt || d['Criado em'] || d.start_time || d['Hora de Início'];
          if (!createdAt) return false;
          
          const recordDate = new Date(createdAt);
          return recordDate >= date && recordDate < nextDate;
        });
        
        console.log(`📅 ${dateStr}: ${dayDisparos.length} disparos encontrados`);
        
        // Calcular totais do dia
        const totalDisparos = dayDisparos.reduce((acc, d) => {
          const count = parseInt(d.recipient_count || d['Total de Destinatários'] || d.recipientCount || '0');
          return acc + count;
        }, 0);
        
        const totalSucesso = dayDisparos.reduce((acc, d) => {
          const reached = parseInt(d.contacts_reached || d['Contatos Alcançados'] || d.contactsReached || d.sent_count || '0');
          return acc + reached;
        }, 0);
        
        chartData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          disparos: totalDisparos,
          sucesso: totalSucesso
        });
      }

      console.log('📊 Dados finais do gráfico:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico:', error);
      return [];
    }
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
