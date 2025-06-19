
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { DisparosChartService } from './chart/disparosChartService';
import { NotificationsChartService } from './chart/notificationsChartService';

export class ChartDataService extends BaseNocodbService {
  private disparosChartService: DisparosChartService;
  private notificationsChartService: NotificationsChartService;

  constructor(config: NocodbConfig) {
    super(config);
    this.disparosChartService = new DisparosChartService(config);
    this.notificationsChartService = new NotificationsChartService(config);
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    return await this.disparosChartService.getDisparosChartData(baseId, days);
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    return await this.notificationsChartService.getNotificationsChartData(baseId, days);
  }
}
