
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { TableDiscoveryService } from './tableDiscoveryService';

export class NotificationsDataService extends BaseNocodbService {
  private tableDiscovery: TableDiscoveryService;
  private cachedTableId: string | null = null;

  constructor(config: NocodbConfig) {
    super(config);
    this.tableDiscovery = new TableDiscoveryService(config);
  }

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  private async getNotificationsTableId(baseId: string): Promise<string | null> {
    if (this.cachedTableId) {
      return this.cachedTableId;
    }

    console.log('🔍 Buscando ID da tabela de notificações...');
    const { notificationsTableId } = await this.tableDiscovery.discoverTableIds(baseId);
    
    if (!notificationsTableId) {
      console.log('⚠️ Tabela de notificações não encontrada, tentando criar...');
      const newTableId = await this.tableDiscovery.createNotificationsTable(baseId);
      this.cachedTableId = newTableId;
      return newTableId;
    }

    this.cachedTableId = notificationsTableId;
    return notificationsTableId;
  }

  async getRecentNotifications(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      const tableId = await this.getNotificationsTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível obter/criar tabela de notificações');
        return [];
      }

      console.log('🔔 Buscando notificações recentes para cliente:', clientId);
      console.log('🎯 Usando tabela ID:', tableId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&sort=-id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações encontradas na tabela`);
        
        // Filtrar por cliente se necessário
        const clientNotifications = allNotifications.filter(n => {
          if (!n.client_id && !n.Client_id && !n.clientId) {
            return true; // Incluir registros sem client_id
          }
          return n.client_id === clientId || n.Client_id === clientId || n.clientId === clientId;
        });
        
        console.log(`✅ ${clientNotifications.length} notificações para cliente ${clientId}`);
        return clientNotifications;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro na resposta (${response.status}):`, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar notificações recentes:', error);
      return [];
    }
  }

  async getAllNotifications(baseId: string): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      const tableId = await this.getNotificationsTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível obter/criar tabela de notificações');
        return [];
      }

      console.log('📋 Buscando TODAS as notificações para cliente:', clientId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=10000&sort=-id`,
        {
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais na tabela`);
        
        // Filtrar por cliente se necessário
        const filteredNotifications = allNotifications.filter(n => {
          if (!n.client_id && !n.Client_id && !n.clientId) {
            return true;
          }
          return n.client_id === clientId || n.Client_id === clientId || n.clientId === clientId;
        });
        
        console.log(`✅ ${filteredNotifications.length} notificações para o cliente ${clientId}`);
        return filteredNotifications;
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar todas as notificações:', error);
      return [];
    }
  }

  async getNotificationsWithFilters(baseId: string, filters: {
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
    platform?: string;
    status?: string;
  } = {}): Promise<any[]> {
    try {
      const allNotifications = await this.getAllNotifications(baseId);
      
      let filteredData = allNotifications;
      
      // Aplicar filtros
      if (filters.dateFrom) {
        filteredData = filteredData.filter(n => {
          const notificationDate = new Date(n.event_date || n.CreatedAt || n.created_at);
          return notificationDate >= new Date(filters.dateFrom!);
        });
      }
      
      if (filters.dateTo) {
        filteredData = filteredData.filter(n => {
          const notificationDate = new Date(n.event_date || n.CreatedAt || n.created_at);
          return notificationDate <= new Date(filters.dateTo!);
        });
      }
      
      if (filters.eventType) {
        filteredData = filteredData.filter(n => 
          (n.event_type || '').toLowerCase().includes(filters.eventType!.toLowerCase())
        );
      }
      
      if (filters.platform) {
        filteredData = filteredData.filter(n => 
          (n.platform || '').toLowerCase().includes(filters.platform!.toLowerCase())
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(n => 
          (n.status || '').toLowerCase().includes(filters.status!.toLowerCase())
        );
      }
      
      console.log(`🔍 ${filteredData.length} notificações após aplicar filtros`);
      return filteredData;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações com filtros:', error);
      return [];
    }
  }

  async createSampleData(baseId: string): Promise<boolean> {
    try {
      const tableId = await this.getNotificationsTableId(baseId);
      const clientId = await this.getClientId();
      
      if (!tableId) {
        console.error('❌ Tabela não disponível para criar dados de exemplo');
        return false;
      }

      console.log('📝 Criando dados de exemplo para notificações...');

      const sampleData = [
        {
          event_type: 'purchase',
          platform: 'Hotmart',
          customer_name: 'João Silva',
          customer_email: 'joao.silva@email.com',
          product_name: 'Curso de Marketing Digital',
          value: 197.50,
          transaction_id: 'TXN_001',
          status: 'Aprovado',
          event_date: new Date().toISOString(),
          client_id: clientId
        },
        {
          event_type: 'subscription',
          platform: 'Eduzz',
          customer_name: 'Maria Santos',
          customer_email: 'maria.santos@email.com',
          product_name: 'Assinatura Premium',
          value: 29.90,
          transaction_id: 'TXN_002',
          status: 'Aprovado',
          event_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          client_id: clientId
        }
      ];

      for (const data of sampleData) {
        await fetch(
          `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
          {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
          }
        );
      }

      console.log('✅ Dados de exemplo criados para notificações');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar dados de exemplo:', error);
      return false;
    }
  }
}
