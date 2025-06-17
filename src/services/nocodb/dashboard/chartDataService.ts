
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
      
      console.log('📈 Buscando dados do gráfico de disparos para cliente:', clientId);
      console.log('🎯 Usando tabela ID:', this.DISPARO_EM_MASSA_TABLE_ID);
      
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?limit=10000&sort=-Id&_t=${timestamp}`,
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
        console.log('📋 Campos disponíveis:', Object.keys(allDisparos[0] || {}));
        console.log('📝 Primeiros 2 registros:', allDisparos.slice(0, 2));
        
        // Filtro para client_id com mais flexibilidade
        const clientDisparos = allDisparos.filter(d => {
          const hasClientId = d['Cliente ID'] === clientId || 
                             d.client_id === clientId || 
                             d.Client_id === clientId || 
                             d.clientId === clientId;
          // Se não há client_id, incluir para debug
          if (!d['Cliente ID'] && !d.client_id && !d.Client_id && !d.clientId) {
            return true;
          }
          return hasClientId;
        });
        
        console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId}`);
        
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayDisparos = clientDisparos.filter(d => {
            const createdAt = d.CreatedAt || d['Criado em'] || d.created_at || d['Hora de Início'];
            if (!createdAt) return false;
            
            const recordDate = new Date(createdAt).toISOString().split('T')[0];
            return recordDate === dateStr;
          });
          
          console.log(`📅 ${dateStr}: ${dayDisparos.length} disparos encontrados`);
          
          // Calcular totais do dia
          const totalDisparos = dayDisparos.reduce((acc, d) => {
            const count = parseInt(d['Total de Destinatários'] || d.recipient_count || d.recipientCount || '0');
            return acc + count;
          }, 0);
          
          const totalSucesso = dayDisparos.reduce((acc, d) => {
            const reached = parseInt(d['Contatos Alcançados'] || d.contacts_reached || d.contactsReached || '0');
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
      } else {
        console.log('❌ Erro na resposta da API:', response.status, await response.text());
        return [];
      }
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
