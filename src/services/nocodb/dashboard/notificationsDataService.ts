
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { NotificationsDataFetcher } from './notifications/notificationsDataFetcher';
import { NotificationsFilterService } from './notifications/notificationsFilterService';
import { NotificationsSampleDataService } from './notifications/notificationsSampleDataService';

export class NotificationsDataService extends BaseNocodbService {
  private dataFetcher: NotificationsDataFetcher;
  private filterService: NotificationsFilterService;
  private sampleDataService: NotificationsSampleDataService;

  constructor(config: NocodbConfig) {
    super(config);
    this.dataFetcher = new NotificationsDataFetcher(config);
    this.filterService = new NotificationsFilterService(config);
    this.sampleDataService = new NotificationsSampleDataService(config);
  }

  async getRecentNotifications(baseId: string, limit: number = 10): Promise<any[]> {
    const allNotifications = await this.dataFetcher.fetchRecentNotifications(baseId, limit);
    const userNotifications = this.filterService.filterByUser(allNotifications);
    return userNotifications.slice(0, limit);
  }

  async getAllNotifications(baseId: string): Promise<any[]> {
    const allNotifications = await this.dataFetcher.fetchAllNotifications(baseId);
    return this.filterService.filterByUser(allNotifications);
  }

  async getNotificationsWithFilters(baseId: string, filters: {
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
    platform?: string;
    status?: string;
  } = {}): Promise<any[]> {
    const allNotifications = await this.getAllNotifications(baseId);
    return this.filterService.applyFilters(allNotifications, filters);
  }

  async createSampleData(baseId: string): Promise<boolean> {
    return await this.sampleDataService.createSampleData(baseId);
  }
}
