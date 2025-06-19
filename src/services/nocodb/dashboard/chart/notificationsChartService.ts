
import { BaseChartService } from './baseChartService';
import { NocodbConfig } from '../../types';
import { createDateRange } from './dateUtils';
import { userContextService } from '@/services/userContextService';

export class NotificationsChartService extends BaseChartService {
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  constructor(config: NocodbConfig) {
    super(config);
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      
      console.log('📊 GRÁFICO NOTIF - Buscando dados para usuário ID:', userId);
      console.log('📊 GRÁFICO NOTIF - Client ID:', clientId);
      console.log('🎯 GRÁFICO NOTIF - Usando tabela ID:', this.NOTIFICACOES_PLATAFORMAS_TABLE_ID);
      
      const allNotifications = await this.fetchTableData(baseId, this.NOTIFICACOES_PLATAFORMAS_TABLE_ID, 10000);
      
      console.log(`📊 ${allNotifications.length} notificações totais encontradas`);
      
      if (allNotifications.length > 0) {
        console.log('📋 GRÁFICO NOTIF - Campos disponíveis:', Object.keys(allNotifications[0]));
        console.log('📝 GRÁFICO NOTIF - Primeiros 3 registros:', allNotifications.slice(0, 3));
      }
      
      const clientNotifications = this.filterDataByUser(allNotifications, clientId);
      
      console.log(`📊 ${clientNotifications.length} notificações filtradas para usuário ${userId}`);
      
      if (clientNotifications.length === 0) {
        console.log('⚠️ GRÁFICO NOTIF - Nenhuma notificação filtrada, retornando dados vazios');
        return this.createEmptyNotificationsData(days);
      }
      
      return this.processNotificationsData(clientNotifications, days);
      
    } catch (error) {
      console.error('❌ GRÁFICO NOTIF - Erro crítico:', error);
      console.error('❌ GRÁFICO NOTIF - Stack trace:', error.stack);
      
      return this.createEmptyNotificationsData(days);
    }
  }

  private processNotificationsData(notifications: any[], days: number): any[] {
    const dateRange = createDateRange(days);
    const chartData = [];

    for (const { dateStr, displayDate } of dateRange) {
      const dayNotifications = notifications.filter(n => {
        const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt || n['Data do Evento'];
        return eventDate && eventDate.startsWith(dateStr);
      });
      
      console.log(`📅 GRÁFICO NOTIF - ${dateStr}: ${dayNotifications.length} notificações encontradas`);
      
      const platformCounts = this.countNotificationsByPlatform(dayNotifications);
      
      console.log(`📊 GRÁFICO NOTIF - ${dateStr}:`, platformCounts);
      
      chartData.push({
        date: displayDate,
        ...platformCounts
      });
    }

    console.log('📊 GRÁFICO NOTIF - Dados finais calculados:', chartData);
    return chartData;
  }

  private countNotificationsByPlatform(notifications: any[]) {
    const hotmart = notifications.filter(n => {
      const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
      return platform.includes('hotmart');
    }).length;
    
    const eduzz = notifications.filter(n => {
      const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
      return platform.includes('eduzz');
    }).length;
    
    const monetizze = notifications.filter(n => {
      const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
      return platform.includes('monetizze');
    }).length;
    
    const outras = notifications.length - (hotmart + eduzz + monetizze);
    
    return {
      hotmart,
      eduzz,
      monetizze: monetizze + outras
    };
  }

  private createEmptyNotificationsData(days: number): any[] {
    console.log('⚠️ Criando dados vazios para o gráfico de notificações');
    const dateRange = createDateRange(days);
    return dateRange.map(({ displayDate }) => ({
      date: displayDate,
      hotmart: 0,
      eduzz: 0,
      monetizze: 0
    }));
  }
}
