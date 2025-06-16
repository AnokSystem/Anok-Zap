
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';
import { StatsCalculationService } from './dashboard/statsCalculationService';
import { ChartDataService } from './dashboard/chartDataService';
import { NotificationsDataService } from './dashboard/notificationsDataService';
import { DisparosDataService } from './dashboard/disparosDataService';
import { TableDiscoveryService } from './dashboard/tableDiscoveryService';

export class DashboardService extends BaseNocodbService {
  private statsCalculationService: StatsCalculationService;
  private chartDataService: ChartDataService;
  private notificationsDataService: NotificationsDataService;
  private disparosDataService: DisparosDataService;
  private tableDiscoveryService: TableDiscoveryService;

  constructor(config: NocodbConfig) {
    super(config);
    this.statsCalculationService = new StatsCalculationService(config);
    this.chartDataService = new ChartDataService(config);
    this.notificationsDataService = new NotificationsDataService(config);
    this.disparosDataService = new DisparosDataService(config);
    this.tableDiscoveryService = new TableDiscoveryService(config);
  }

  async initializeTables(baseId: string): Promise<boolean> {
    try {
      console.log('🚀 Inicializando tabelas do Dashboard...');
      
      // Descobrir tabelas existentes
      const { disparosTableId, notificationsTableId } = await this.tableDiscoveryService.discoverTableIds(baseId);
      
      let success = true;
      
      // Criar tabela de disparos se não existir
      if (!disparosTableId) {
        const newDisparosTableId = await this.tableDiscoveryService.createDisparosTable(baseId);
        if (newDisparosTableId) {
          await this.disparosDataService.createSampleData(baseId);
        } else {
          success = false;
        }
      }
      
      // Criar tabela de notificações se não existir
      if (!notificationsTableId) {
        const newNotificationsTableId = await this.tableDiscoveryService.createNotificationsTable(baseId);
        if (newNotificationsTableId) {
          await this.notificationsDataService.createSampleData(baseId);
        } else {
          success = false;
        }
      }
      
      console.log('✅ Inicialização das tabelas concluída');
      return success;
    } catch (error) {
      console.error('❌ Erro ao inicializar tabelas:', error);
      return false;
    }
  }

  async getDashboardStats(baseId: string): Promise<any> {
    try {
      console.log('📊 Buscando estatísticas do dashboard na base:', baseId);
      
      // Garantir que as tabelas existem
      await this.initializeTables(baseId);
      
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

  async getAllNotifications(baseId: string): Promise<any[]> {
    return await this.notificationsDataService.getAllNotifications(baseId);
  }

  async getNotificationsWithFilters(baseId: string, filters: any): Promise<any[]> {
    return await this.notificationsDataService.getNotificationsWithFilters(baseId, filters);
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    return await this.disparosDataService.getRecentDisparos(baseId, limit);
  }

  async getAllDisparos(baseId: string): Promise<any[]> {
    return await this.disparosDataService.getAllDisparos(baseId);
  }

  async getDisparosWithFilters(baseId: string, filters: any): Promise<any[]> {
    return await this.disparosDataService.getDisparosWithFilters(baseId, filters);
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    return await this.chartDataService.getDisparosChartData(baseId, days);
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    return await this.chartDataService.getNotificationsChartData(baseId, days);
  }
}
