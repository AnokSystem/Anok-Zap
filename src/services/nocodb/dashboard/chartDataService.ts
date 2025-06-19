import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { userContextService } from '@/services/userContextService';

export class ChartDataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // ID fixo da tabela de disparos em massa
  private MASS_MESSAGING_TABLE_ID = 'myx4lsmm5i02xcd';
  // ID correto da tabela de notificações por plataforma
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private async getClientId(): Promise<string> {
    const userId = userContextService.getUserId();
    const clientId = userContextService.getClientId();
    
    console.log('🔍 GRÁFICO - Dados do usuário:', { userId, clientId });
    
    return clientId || userId || 'default';
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📈 Buscando dados da tabela de disparos em massa para gráfico...');
      console.log('🎯 Cliente ID:', clientId);
      console.log('🗓️ Últimos', days, 'dias');

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

      const userId = userContextService.getUserId();
      const userClientId = userContextService.getClientId();
      
      const clientDisparos = allDisparos.filter(d => {
        const recordClientId = d['Cliente ID'] || d.client_id;
        
        const belongsToUser = recordClientId === userId || 
                             recordClientId === userClientId ||
                             recordClientId === clientId;
                             
        console.log('🔍 GRÁFICO - Filtrando disparo:', {
          recordClientId,
          userId,
          userClientId,
          clientId,
          belongsToUser
        });
        
        return belongsToUser;
      });
      
      console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId} (userId: ${userId})`);

      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dateStr = date.toISOString().split('T')[0];
        
        const dayDisparos = clientDisparos.filter(d => {
          const createdAt = d.CreatedAt || d['Criado em'] || d.created_at || d['Hora de Início'];
          if (!createdAt) return false;
          
          const recordDate = new Date(createdAt);
          return recordDate >= date && recordDate < nextDate;
        });
        
        console.log(`📅 ${dateStr}: ${dayDisparos.length} disparos encontrados`);
        
        const totalDisparos = dayDisparos.reduce((acc, d) => {
          const count = parseInt(d['Total de Destinatários'] || d.recipient_count || '0');
          return acc + count;
        }, 0);
        
        const totalSucesso = dayDisparos.reduce((acc, d) => {
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

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      
      console.log('📊 GRÁFICO NOTIF - Buscando dados para usuário ID:', userId);
      console.log('📊 GRÁFICO NOTIF - Client ID:', clientId);
      console.log('🎯 GRÁFICO NOTIF - Usando tabela ID:', this.NOTIFICACOES_PLATAFORMAS_TABLE_ID);
      
      const timestamp = Date.now();
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?limit=10000&sort=-Id&_t=${timestamp}`;
      
      console.log('📡 GRÁFICO NOTIF - URL da requisição:', url);
      
      const response = await fetch(url, {
        headers: {
          ...this.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      console.log('📡 GRÁFICO NOTIF - Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GRÁFICO NOTIF - Erro na resposta:', response.status, errorText);
        return this.createEmptyNotificationsChartData(days);
      }

      const data = await response.json();
      console.log('📊 GRÁFICO NOTIF - Resposta bruta:', data);
      
      const allNotifications = data.list || [];
      
      console.log(`📊 ${allNotifications.length} notificações totais encontradas`);
      
      if (allNotifications.length > 0) {
        console.log('📋 GRÁFICO NOTIF - Campos disponíveis:', Object.keys(allNotifications[0]));
        console.log('📝 GRÁFICO NOTIF - Primeiros 3 registros:', allNotifications.slice(0, 3));
      }
      
      // Filtrar usando a coluna "Cliente ID" específica
      const clientNotifications = allNotifications.filter(n => {
        const recordClientId = n['Cliente ID'] || n.client_id;
        
        // Verificar se pertence ao usuário atual usando Cliente ID
        const belongsToUser = recordClientId === userId || recordClientId === clientId;
        
        console.log('🔍 GRÁFICO NOTIF - Análise do registro:', { 
          recordId: n.Id || n.id,
          recordClientId, 
          userId, 
          clientId, 
          belongsToUser
        });
        
        return belongsToUser;
      });
      
      console.log(`📊 ${clientNotifications.length} notificações filtradas para usuário ${userId}`);
      
      if (clientNotifications.length === 0) {
        console.log('⚠️ GRÁFICO NOTIF - Nenhuma notificação filtrada, retornando dados vazios');
        return this.createEmptyNotificationsChartData(days);
      }
      
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayNotifications = clientNotifications.filter(n => {
          const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt || n['Data do Evento'];
          return eventDate && eventDate.startsWith(dateStr);
        });
        
        console.log(`📅 GRÁFICO NOTIF - ${dateStr}: ${dayNotifications.length} notificações encontradas`);
        
        const hotmart = dayNotifications.filter(n => {
          const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
          return platform.includes('hotmart');
        }).length;
        
        const eduzz = dayNotifications.filter(n => {
          const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
          return platform.includes('eduzz');
        }).length;
        
        const monetizze = dayNotifications.filter(n => {
          const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
          return platform.includes('monetizze');
        }).length;
        
        const outras = dayNotifications.length - (hotmart + eduzz + monetizze);
        
        console.log(`📊 GRÁFICO NOTIF - ${dateStr}: hotmart=${hotmart}, eduzz=${eduzz}, monetizze=${monetizze}, outras=${outras}`);
        
        chartData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          hotmart: hotmart,
          eduzz: eduzz,
          monetizze: monetizze + outras
        });
      }

      console.log('📊 GRÁFICO NOTIF - Dados finais calculados:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('❌ GRÁFICO NOTIF - Erro crítico:', error);
      console.error('❌ GRÁFICO NOTIF - Stack trace:', error.stack);
      
      return this.createEmptyNotificationsChartData(days);
    }
  }

  private createEmptyChartData(days: number): any[] {
    console.log('⚠️ Criando dados vazios para o gráfico de disparos');
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

  private createEmptyNotificationsChartData(days: number): any[] {
    console.log('⚠️ Criando dados vazios para o gráfico de notificações');
    const emptyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      emptyData.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        hotmart: 0,
        eduzz: 0,
        monetizze: 0
      });
    }
    return emptyData;
  }
}
