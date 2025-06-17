
import { CoreNocodbService } from './coreService';
import { ContactsReachedService } from './data/contactsReachedService';

// Criar instância principal do serviço
const coreService = new CoreNocodbService();

// Criar instância do serviço de contatos alcançados
const contactsReachedService = new ContactsReachedService(coreService.config);

// Exportar serviço principal
export const nocodbService = {
  // Métodos existentes do core service
  testConnection: () => coreService.testConnection(),
  getHotmartNotifications: () => coreService.getHotmartNotifications(),
  saveHotmartNotification: (data: any) => coreService.saveHotmartNotification(data),
  deleteNotification: (baseId: string, recordId: string) => coreService.deleteNotification(baseId, recordId),
  saveContacts: (contacts: any[], instanceId: string) => coreService.saveContacts(contacts, instanceId),
  saveInstance: (instanceData: any) => coreService.saveInstance(instanceData),
  saveMassMessagingLog: (campaignData: any) => coreService.saveMassMessagingLog(campaignData),
  syncLocalData: () => coreService.syncLocalData(),
  createAllTables: () => coreService.createAllTables(),
  initializeDashboardTables: () => coreService.initializeDashboardTables(),
  
  // Métodos de dashboard
  getDashboardStats: () => coreService.getDashboardStats(),
  getRecentDisparos: (limit?: number) => coreService.getRecentDisparos(limit),
  getAllDisparos: () => coreService.getAllDisparos(),
  getDisparosWithFilters: (filters: any) => coreService.getDisparosWithFilters(filters),
  getRecentNotifications: (limit?: number) => coreService.getRecentNotifications(limit),
  getAllNotifications: () => coreService.getAllNotifications(),
  getNotificationsWithFilters: (filters: any) => coreService.getNotificationsWithFilters(filters),
  getDisparosChartData: (days?: number) => coreService.getDisparosChartData(days),
  getNotificationsChartData: (days?: number) => coreService.getNotificationsChartData(days),
  
  // Novos métodos para gerenciar contatos alcançados
  initializeCampaign: (campaignId: string, totalContacts: number) => {
    const baseId = coreService.getTargetBaseId();
    if (baseId) {
      return contactsReachedService.initializeCampaign(baseId, campaignId, totalContacts);
    }
    return Promise.resolve(false);
  },
  
  incrementContactsReached: (campaignId: string) => {
    const baseId = coreService.getTargetBaseId();
    if (baseId) {
      return contactsReachedService.incrementContactsReached(baseId, campaignId);
    }
    return Promise.resolve(false);
  },
  
  finalizeCampaign: (campaignId: string, status: string = 'concluido') => {
    const baseId = coreService.getTargetBaseId();
    if (baseId) {
      return contactsReachedService.finalizeCampaign(baseId, campaignId, status);
    }
    return Promise.resolve(false);
  }
};

// Expor também o serviço principal para casos específicos
export { coreService as nocodb };

// Expor configuração para outros serviços
export const nocodbConfig = coreService.config;

// Expor serviços específicos
export { ContactsReachedService } from './data/contactsReachedService';
