import { NocodbConfig, ConnectionTestResult } from './types';
import { NocodbTableManager } from './tableManager';
import { NotificationService } from './notificationService';
import { DataService } from './dataService';
import { FallbackService } from './fallbackService';
import { DashboardService } from './dashboardService';

export class CoreNocodbService {
  private _config: NocodbConfig = {
    baseUrl: 'https://kovalski.novahagencia.com.br',
    apiToken: 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ'
  };

  private tableManager: NocodbTableManager;
  private notificationService: NotificationService;
  private dataService: DataService;
  private fallbackService: FallbackService;
  private dashboardService: DashboardService;
  private TARGET_BASE_ID = 'pddywozzup2sc85'; // ID fixo da base "Notificação Inteligente"
  private initialized = false;

  constructor() {
    this.tableManager = new NocodbTableManager(this._config);
    this.notificationService = new NotificationService(this._config);
    this.dataService = new DataService(this._config);
    this.fallbackService = new FallbackService();
    this.dashboardService = new DashboardService(this._config);
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
    return this.TARGET_BASE_ID;
  }

  // Métodos públicos para acesso aos serviços
  public async getDashboardStats() {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return null;
    return await this.dashboardService.getDashboardStats(targetBaseId);
  }

  public async initializeDashboardTables() {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return false;
    return await this.dashboardService.initializeTables(targetBaseId);
  }

  public async getRecentDisparos(limit: number = 10) {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getRecentDisparos(targetBaseId, limit);
  }

  public async getAllDisparos() {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getAllDisparos(targetBaseId);
  }

  public async getDisparosWithFilters(filters: any) {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getDisparosWithFilters(targetBaseId, filters);
  }

  public async getRecentNotifications(limit: number = 10) {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getRecentNotifications(targetBaseId, limit);
  }

  public async getAllNotifications() {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getAllNotifications(targetBaseId);
  }

  public async getNotificationsWithFilters(filters: any) {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getNotificationsWithFilters(targetBaseId, filters);
  }

  public async getDisparosChartData(days: number = 7) {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getDisparosChartData(targetBaseId, days);
  }

  public async getNotificationsChartData(days: number = 7) {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return [];
    return await this.dashboardService.getNotificationsChartData(targetBaseId, days);
  }

  public async saveMassMessagingLog(campaignData: any) {
    await this.ensureInitialized();
    const targetBaseId = this.getTargetBaseId();
    if (!targetBaseId) return false;
    return await this.dataService.saveMassMessagingLog(targetBaseId, campaignData);
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🔧 Inicializando NocoDB Service...');
    console.log('🎯 Base target:', this.TARGET_BASE_ID);
    
    // Verificar se a base está acessível
    const baseAccessible = await this.testBaseAccess();
    if (!baseAccessible) {
      console.error('❌ Base não acessível, verifique configurações');
      return;
    }
    
    // Descobrir bases disponíveis
    await this.tableManager.discoverBases();
    
    // Forçar criação de todas as tabelas na base target
    console.log('🏗️ Verificando e criando todas as tabelas necessárias...');
    const tablesCreated = await this.tableManager.createAllTables();
    
    if (tablesCreated) {
      console.log('✅ Todas as tabelas verificadas/criadas com sucesso');
    } else {
      console.log('⚠️ Algumas tabelas podem não ter sido criadas');
    }
    
    // Verificar se todas as tabelas essenciais existem
    await this.verifyEssentialTables();
    
    this.initialized = true;
    console.log('✅ NocoDB Service inicializado com sucesso');
  }

  private async testBaseAccess(): Promise<boolean> {
    try {
      console.log('🔌 Testando acesso à base...');
      const response = await fetch(`${this._config.baseUrl}/api/v1/db/meta/projects/${this.TARGET_BASE_ID}/tables`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        console.log('✅ Base acessível');
        return true;
      } else {
        console.error('❌ Base não acessível:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao testar acesso à base:', error);
      return false;
    }
  }

  private async verifyEssentialTables(): Promise<void> {
    const essentialTables = [
      'MassMessagingLogs',      // Tabela para disparos automáticos
      'NotificacoesPlataformas', // Tabela para notificações das plataformas
      'WhatsAppContacts',
      'WhatsAppInstances',
      'DashboardStats',
      'Usuarios'
    ];

    console.log('🔍 Verificando tabelas essenciais...');
    
    for (const tableName of essentialTables) {
      const tableId = await this.getTableId(this.TARGET_BASE_ID, tableName);
      if (tableId) {
        console.log(`✅ Tabela ${tableName} verificada (ID: ${tableId})`);
      } else {
        console.log(`❌ Tabela ${tableName} não encontrada, tentando criar...`);
        await this.tableManager.ensureTableExists(tableName);
      }
    }
  }

  async ensureTableExists(tableName: string): Promise<boolean> {
    await this.ensureInitialized();
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
          (tableName === 'Usuarios' && t.title === 'Usuários') ||
          (tableName === 'DashboardStats' && t.title === 'Estatísticas Dashboard') ||
          (tableName === 'MassMessagingLogs' && t.title === 'Disparos em Massa') ||
          (tableName === 'NotificacoesPlataformas' && t.title === 'Notificações das Plataformas') ||
          (tableName === 'WhatsAppContacts' && t.title === 'Contatos WhatsApp') ||
          (tableName === 'WhatsAppInstances' && t.title === 'Instâncias WhatsApp')
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
      console.log('🔌 Testando conexão completa com NocoDB...');
      
      await this.ensureInitialized();
      
      const bases = await this.tableManager.discoverBases();
      const discoveredBases = this.tableManager.getDiscoveredBases();
      const targetBaseId = this.getTargetBaseId();
      
      if (bases && discoveredBases.length > 0) {
        console.log('✅ NocoDB conectado com sucesso');
        
        const targetBase = discoveredBases.find(base => base.id === targetBaseId);
        
        if (targetBase) {
          console.log('✅ Base "Notificação Inteligente" encontrada e configurada');
          
          // Verificar se todas as tabelas estão criadas
          const tablesVerified = await this.verifyAllTables();
          
          return { 
            success: true, 
            bases: discoveredBases, 
            targetBase: targetBaseId,
            tablesVerified 
          };
        } else {
          console.warn('⚠️ Base com ID pddywozzup2sc85 não encontrada');
          return { success: false, error: 'Base com ID pddywozzup2sc85 não encontrada' };
        }
      }
      
      return { success: false, error: 'Nenhuma base encontrada' };
    } catch (error) {
      console.error('❌ Erro ao conectar com NocoDB:', error);
      return { success: false, error: error.message };
    }
  }

  private async verifyAllTables(): Promise<boolean> {
    const tableNames = [
      'MassMessagingLogs',      // Tabela para disparos automáticos
      'NotificacoesPlataformas', // Tabela para notificações das plataformas
      'WhatsAppContacts',
      'WhatsAppInstances', 
      'DashboardStats',
      'Usuarios'
    ];

    let allTablesExist = true;
    
    for (const tableName of tableNames) {
      const tableId = await this.getTableId(this.TARGET_BASE_ID, tableName);
      if (!tableId) {
        console.log(`❌ Tabela ${tableName} não encontrada`);
        allTablesExist = false;
      } else {
        console.log(`✅ Tabela ${tableName} encontrada`);
      }
    }

    return allTablesExist;
  }

  async createAllTables() {
    await this.ensureInitialized();
    return await this.tableManager.createAllTables();
  }

  async syncLocalData() {
    const targetBaseId = this.getTargetBaseId();
    return await this.fallbackService.syncLocalData(targetBaseId, this.saveHotmartNotification.bind(this));
  }

  async getHotmartNotifications(): Promise<any[]> {
    try {
      console.log('🔄 Iniciando busca de notificações...');
      
      await this.ensureInitialized();
      
      const targetBaseId = this.getTargetBaseId();
      if (!targetBaseId) {
        console.error('❌ Base "Notificação Inteligente" não encontrada');
        return [];
      }
      
      console.log('✅ Base target encontrada:', targetBaseId);
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
      
      await this.ensureInitialized();
      
      const targetBaseId = this.getTargetBaseId();
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

  async deleteNotification(baseId: string, recordId: string): Promise<boolean> {
    return await this.notificationService.deleteNotification(baseId, recordId);
  }

  async saveContacts(contacts: any[], instanceId: string) {
    try {
      await this.ensureInitialized();
      
      const targetBaseId = this.getTargetBaseId();
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
      await this.ensureInitialized();
      
      const targetBaseId = this.getTargetBaseId();
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
