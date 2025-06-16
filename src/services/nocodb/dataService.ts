
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';
import { MessagingService } from './data/messagingService';
import { NotificationsService } from './data/notificationsService';
import { ContactsService } from './data/contactsService';
import { InstancesService } from './data/instancesService';
import { DataOperationsService } from './data/dataOperationsService';

export class DataService extends BaseNocodbService {
  private messagingService: MessagingService;
  private notificationsService: NotificationsService;
  private contactsService: ContactsService;
  private instancesService: InstancesService;
  private dataOperationsService: DataOperationsService;

  constructor(config: NocodbConfig) {
    super(config);
    this.messagingService = new MessagingService(config);
    this.notificationsService = new NotificationsService(config);
    this.contactsService = new ContactsService(config);
    this.instancesService = new InstancesService(config);
    this.dataOperationsService = new DataOperationsService(config);
  }

  async saveMassMessagingLog(baseId: string, campaignData: any): Promise<boolean> {
    return await this.messagingService.saveMassMessagingLog(baseId, campaignData);
  }

  async saveNotificationFromPlatform(baseId: string, notificationData: any): Promise<boolean> {
    return await this.notificationsService.saveNotificationFromPlatform(baseId, notificationData);
  }

  async saveContacts(baseId: string, contacts: any[], instanceId: string): Promise<boolean> {
    return await this.contactsService.saveContacts(baseId, contacts, instanceId);
  }

  async saveInstance(baseId: string, instanceData: any): Promise<boolean> {
    return await this.instancesService.saveInstance(baseId, instanceData);
  }

  async getClientData(baseId: string, tableName: string, limit: number = 100): Promise<any[]> {
    return await this.dataOperationsService.getClientData(baseId, tableName, limit);
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    return await this.messagingService.getRecentDisparos(baseId, limit);
  }
}
