
import { NocodbConfig, ConnectionTestResult } from './types';
import { NocodbTableManager } from './tableManager';
import { NotificationService } from './notificationService';
import { DataService } from './dataService';
import { FallbackService } from './fallbackService';

export class CoreNocodbService {
  private _config: NocodbConfig = {
    baseUrl: 'https://kovalski.novahagencia.com.br',
    apiToken: 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ'
  };

  private tableManager: NocodbTableManager;
  private notificationService: NotificationService;
  private dataService: DataService;
  private fallbackService: FallbackService;

  constructor() {
    this.tableManager = new NocodbTableManager(this._config);
    this.notificationService = new NotificationService(this._config);
    this.dataService = new DataService(this._config);
    this.fallbackService = new FallbackService();
  }

  get config() {
    return this._config;
  }

  get headers() {
    return {
      'Content-Type': 'application/json',
      'xc-token': this._config.apiToken,
    };
  }

  getTargetBaseId(): string | null {
    return this.tableManager.getTargetBaseId();
  }

  async ensureTableExists(tableName: string): Promise<boolean> {
    return await this.tableManager.ensureTableExists(tableName);
  }

  async getTableId(baseId: string, tableName: string): Promise<string | null> {
    try {
      const response = await fetch(`${this._config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        const tables = data.list || [];
        
        const table = tables.find((t: any) => 
          t.table_name === tableName || 
          t.title === tableName ||
          (tableName === 'Usuarios' && t.title === 'Usuários')
        );
        
        return table?.id || null;
      }
      
      return null;
    } catch (error) {
      console.log('❌ Erro ao obter ID da tabela:', error);
      return null;
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      console.log('🔌 Testando conexão com NocoDB...');
      
      const bases = await this.tableManager.discoverBases();
      const discoveredBases = this.tableManager.getDiscoveredBases();
      const targetBaseId = this.tableManager.getTargetBaseId();
      
      console.log('📋 Bases descobertas:', discoveredBases);
      console.log('🎯 Base target:', targetBaseId);
      
      if (bases && discoveredBases.length > 0) {
        console.log('✅ NocoDB conectado com sucesso');
        
        if (targetBaseId) {
          return { success: true, bases: discoveredBases, targetBase: targetBaseId };
        } else {
          console.warn('⚠️ Base "Notificação Inteligente" não encontrada');
          return { success: false, error: 'Base "Notificação Inteligente" não encontrada' };
        }
      }
      
      return { success: false, error: 'Nenhuma base encontrada' };
    } catch (error) {
      console.error('❌ Erro ao conectar com NocoDB:', error);
      return { success: false, error: error.message };
    }
  }

  async createAllTables() {
    return await this.tableManager.createAllTables();
  }

  async syncLocalData() {
    const targetBaseId = this.tableManager.getTargetBaseId();
    return await this.fallbackService.syncLocalData(targetBaseId, this.saveHotmartNotification.bind(this));
  }

  // Delegate notification methods
  async getHotmartNotifications(): Promise<any[]> {
    try {
      console.log('🔄 Iniciando busca de notificações...');
      
      await this.tableManager.discoverBases();
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (!targetBaseId) {
        console.error('❌ Base "Notificação Inteligente" não encontrada');
        
        const bases = this.tableManager.getDiscoveredBases();
        console.log('📋 Bases disponíveis:', bases.map(b => b.title));
        
        return [];
      }
      
      console.log('✅ Base target encontrada:', targetBaseId);
      
      console.log('🔧 Verificando se a tabela existe...');
      await this.tableManager.ensureTableExists('NotificacoesHotmart');
      
      console.log('📡 Buscando notificações...');
      const notifications = await this.notificationService.getHotmartNotifications(targetBaseId);
      console.log(`✅ ${notifications.length} notificações encontradas`);
      
      return notifications;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações Hotmart:', error);
      return [];
    }
  }

  async saveHotmartNotification(notificationData: any) {
    try {
      console.log('💾 Iniciando salvamento de notificação...');
      console.log('📋 Dados a salvar:', notificationData);
      
      await this.tableManager.discoverBases();
      await this.tableManager.ensureTableExists('NotificacoesHotmart');
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (!targetBaseId) {
        console.error('❌ Base "Notificação Inteligente" não encontrada para salvamento');
        this.fallbackService.saveLocalFallback('hotmart_notifications', notificationData);
        return true;
      }
      
      console.log('✅ Base encontrada para salvamento:', targetBaseId);
      
      const success = await this.notificationService.saveHotmartNotification(targetBaseId, notificationData);
      if (success) {
        console.log('✅ Notificação salva com sucesso');
        return true;
      }
      
      console.log('❌ Falha ao salvar, usando fallback local');
      this.fallbackService.saveLocalFallback('hotmart_notifications', notificationData);
      return true;
      
    } catch (error) {
      console.error('❌ Erro geral ao salvar notificação Hotmart:', error);
      this.fallbackService.saveLocalFallback('hotmart_notifications', notificationData);
      return true;
    }
  }

  // Delegate data service methods
  async saveMassMessagingLog(campaignData: any) {
    try {
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
}
