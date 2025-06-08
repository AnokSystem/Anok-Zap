
import { NocodbConfig, ConnectionTestResult } from './types';
import { NocodbTableManager } from './tableManager';
import { NotificationService } from './notificationService';
import { DataService } from './dataService';
import { FallbackService } from './fallbackService';

class NocodbService {
  private config: NocodbConfig = {
    baseUrl: 'https://kovalski.novahagencia.com.br',
    apiToken: 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ'
  };

  private tableManager: NocodbTableManager;
  private notificationService: NotificationService;
  private dataService: DataService;
  private fallbackService: FallbackService;

  constructor() {
    this.tableManager = new NocodbTableManager(this.config);
    this.notificationService = new NotificationService(this.config);
    this.dataService = new DataService(this.config);
    this.fallbackService = new FallbackService();
  }

  async getHotmartNotifications(): Promise<any[]> {
    try {
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (!targetBaseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada');
        return [];
      }
      
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('NotificacoesHotmart');
      
      // Buscar notificações
      const notifications = await this.notificationService.getHotmartNotifications(targetBaseId);
      console.log(`✅ ${notifications.length} notificações encontradas`);
      
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações Hotmart:', error);
      return [];
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      console.log('Testando conexão com NocoDB...');
      
      const bases = await this.tableManager.discoverBases();
      const discoveredBases = this.tableManager.getDiscoveredBases();
      const targetBaseId = this.tableManager.getTargetBaseId();
      
      if (bases && discoveredBases.length > 0) {
        console.log('NocoDB conectado com sucesso, bases disponíveis:', discoveredBases);
        
        if (targetBaseId) {
          return { success: true, bases: discoveredBases, targetBase: targetBaseId };
        } else {
          return { success: false, error: 'Base "Notificação Inteligente" não encontrada' };
        }
      }
      
      return { success: false, error: 'Nenhuma base encontrada' };
    } catch (error) {
      console.error('Erro ao conectar com NocoDB:', error);
      return { success: false, error: error.message };
    }
  }

  async createAllTables() {
    return await this.tableManager.createAllTables();
  }

  async saveHotmartNotification(notificationData: any) {
    try {
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('NotificacoesHotmart');
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (!targetBaseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada');
        this.fallbackService.saveLocalFallback('hotmart_notifications', notificationData);
        return true;
      }
      
      const success = await this.notificationService.saveHotmartNotification(targetBaseId, notificationData);
      if (success) {
        return true;
      }
      
      // Se falhou, salvar como fallback
      console.log('❌ Falha ao salvar, usando fallback local');
      this.fallbackService.saveLocalFallback('hotmart_notifications', notificationData);
      return true;
      
    } catch (error) {
      console.error('Erro geral ao salvar notificação Hotmart:', error);
      this.fallbackService.saveLocalFallback('hotmart_notifications', notificationData);
      return true;
    }
  }

  async saveMassMessagingLog(campaignData: any) {
    try {
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('MassMessagingLogs');
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (targetBaseId) {
        return await this.dataService.saveMassMessagingLog(targetBaseId, campaignData);
      }
      
      console.log('❌ Falha ao salvar no NocoDB, usando modo desenvolvimento');
      return true;
    } catch (error) {
      console.error('Erro geral ao salvar log:', error);
      return true;
    }
  }

  async saveContacts(contacts: any[], instanceId: string) {
    try {
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('WhatsAppContacts');
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (targetBaseId) {
        return await this.dataService.saveContacts(targetBaseId, contacts, instanceId);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      return true;
    }
  }

  async saveInstance(instanceData: any) {
    try {
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('WhatsAppInstances');
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (targetBaseId) {
        return await this.dataService.saveInstance(targetBaseId, instanceData);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      return true;
    }
  }

  async syncLocalData() {
    const targetBaseId = this.tableManager.getTargetBaseId();
    return await this.fallbackService.syncLocalData(targetBaseId, this.saveHotmartNotification.bind(this));
  }
}

export const nocodbService = new NocodbService();
