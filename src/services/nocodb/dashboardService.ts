
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';
import { StatsCalculationService } from './dashboard/statsCalculationService';
import { ChartDataService } from './dashboard/chartDataService';
import { NotificationsDataService } from './dashboard/notificationsDataService';

export class DashboardService extends BaseNocodbService {
  private statsCalculationService: StatsCalculationService;
  private chartDataService: ChartDataService;
  private notificationsDataService: NotificationsDataService;

  constructor(config: NocodbConfig) {
    super(config);
    this.statsCalculationService = new StatsCalculationService(config);
    this.chartDataService = new ChartDataService(config);
    this.notificationsDataService = new NotificationsDataService(config);
  }

  async getDashboardStats(baseId: string): Promise<any> {
    try {
      console.log('📊 Buscando estatísticas do dashboard na base:', baseId);
      
      console.log('🔄 Calculando estatísticas em tempo real...');
      return await this.statsCalculationService.getCalculatedStats(baseId);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return await this.statsCalculationService.getCalculatedStats(baseId);
    }
  }

  async getRecentNotifications(baseId: string, limit: number = 10): Promise<any[]> {
    return await this.notificationsDataService.getRecentNotifications(baseId, limit);
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    return await this.chartDataService.getDisparosChartData(baseId, days);
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    return await this.chartDataService.getNotificationsChartData(baseId, days);
  }
}
