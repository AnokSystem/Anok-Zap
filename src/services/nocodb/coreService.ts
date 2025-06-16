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

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🔧 Inicializando NocoDB Service...');
    
    // Descobrir bases disponíveis
    await this.tableManager.discoverBases();
    
    // Forçar criação de todas as tabelas na base target
    console.log('🏗️ Criando todas as tabelas necessárias...');
    await this.tableManager.createAllTables();
    
    this.initialized = true;
    console.log('✅ NocoDB Service inicializado com sucesso');
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
          (tableName === 'MassMessagingLogs' && t.title === 'Logs de Disparo em Massa') ||
          (tableName === 'NotificacoesHotmart' && t.title === 'Notificações Hotmart')
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
      
      await this.ensureInitialized();
      
      const bases = await this.tableManager.discoverBases();
      const discoveredBases = this.tableManager.getDiscoveredBases();
      const targetBaseId = this.getTargetBaseId();
      
      if (bases && discoveredBases.length > 0) {
        console.log('✅ NocoDB conectado com sucesso');
        
        const targetBase = discoveredBases.find(base => base.id === targetBaseId);
        
        if (targetBase) {
          console.log('✅ Base "Notificação Inteligente" encontrada e tabelas criadas');
          return { success: true, bases: discoveredBases, targetBase: targetBaseId };
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

  async createAllTables() {
    await this.ensureInitialized();
    return await this.tableManager.createAllTables();
  }

  async syncLocalData() {
    const targetBaseId = this.getTargetBaseId();
    return await this.fallbackService.syncLocalData(targetBaseId, this.saveHotmartNotification.bind(this));
  }

  async getDashboardStats() {
    try {
      console.log('📊 Iniciando busca de estatísticas...');
      
      await this.ensureInitialized();
      const targetBaseId = this.getTargetBaseId();
      
      if (!targetBaseId) {
        console.error('❌ Base não encontrada para estatísticas');
        return null;
      }

      console.log('✅ Buscando estatísticas na base:', targetBaseId);
      return await this.dashboardService.getDashboardStats(targetBaseId);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas do dashboard:', error);
      return null;
    }
  }

  async getRecentDisparos(limit: number = 10) {
    try {
      console.log('📨 Iniciando busca de disparos recentes...');
      
      await this.ensureInitialized();
      const targetBaseId = this.getTargetBaseId();
      
      if (!targetBaseId) {
        console.error('❌ Base não encontrada para disparos');
        return [];
      }

      return await this.dashboardService.getRecentDisparos(targetBaseId, limit);
    } catch (error) {
      console.error('❌ Erro ao buscar disparos recentes:', error);
      return [];
    }
  }

  async getRecentNotifications(limit: number = 10) {
    try {
      console.log('🔔 Iniciando busca de notificações recentes...');
      
      await this.ensureInitialized();
      const targetBaseId = this.getTargetBaseId();
      
      if (!targetBaseId) {
        console.error('❌ Base não encontrada para notificações');
        return [];
      }

      return await this.dashboardService.getRecentNotifications(targetBaseId, limit);
    } catch (error) {
      console.error('❌ Erro ao buscar notificações recentes:', error);
      return [];
    }
  }

  async getDisparosChartData(days: number = 7) {
    try {
      console.log('📈 Iniciando busca de dados do gráfico...');
      
      await this.ensureInitialized();
      const targetBaseId = this.getTargetBaseId();
      
      if (!targetBaseId) {
        console.error('❌ Base não encontrada para gráfico');
        return [];
      }

      return await this.dashboardService.getDisparosChartData(targetBaseId, days);
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de disparos:', error);
      return [];
    }
  }

  async getNotificationsChartData(days: number = 7) {
    try {
      console.log('📊 Iniciando busca de dados do gráfico de notificações...');
      
      await this.ensureInitialized();
      const targetBaseId = this.getTargetBaseId();
      
      if (!targetBaseId) {
        console.error('❌ Base não encontrada para gráfico');
        return [];
      }

      return await this.dashboardService.getNotificationsChartData(targetBaseId, days);
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de notificações:', error);
      return [];
    }
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

  async saveMassMessagingLog(campaignData: any) {
    try {
      console.log('💾 Iniciando salvamento de log de campanha...');
      console.log('📋 Dados da campanha:', campaignData);
      
      await this.ensureInitialized();
      
      const targetBaseId = this.getTargetBaseId();
      if (targetBaseId) {
        console.log('✅ Salvando log no NocoDB...');
        const success = await this.dataService.saveMassMessagingLog(targetBaseId, campaignData);
        
        if (success) {
          console.log('✅ Log salvo com sucesso no NocoDB');
        } else {
          console.log('❌ Falha ao salvar no NocoDB');
        }
        
        return success;
      }
      
      console.log('❌ Base target não encontrada para salvamento');
      return false;
    } catch (error) {
      console.error('❌ Erro geral ao salvar log:', error);
      return false;
    }
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
