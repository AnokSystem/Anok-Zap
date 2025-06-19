
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
    return user.ID || user.client_id || user.Email?.split('@')[0] || 'default';
  }

  private async getUserId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.ID || user.user_id || user.Email?.split('@')[0] || 'default';
  }

  private async getNotificationsTableId(baseId: string): Promise<string | null> {
    if (this.cachedTableId) {
      return this.cachedTableId;
    }

    console.log('🔍 Usando ID fixo da tabela de notificações: mzup2t8ygoiy5ub');
    
    const tableId = 'mzup2t8ygoiy5ub';
    
    try {
      const testResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1`,
        {
          headers: this.headers,
        }
      );

      if (testResponse.ok) {
        console.log('✅ Tabela de notificações acessível com ID:', tableId);
        this.cachedTableId = tableId;
        return tableId;
      } else {
        console.log('❌ Tabela de notificações não acessível:', testResponse.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar tabela de notificações:', error);
      return null;
    }
  }

  async getRecentNotifications(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      const userId = await this.getUserId();
      const tableId = await this.getNotificationsTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de notificações mzup2t8ygoiy5ub');
        return [];
      }

      console.log('🔔 Buscando notificações recentes da tabela mzup2t8ygoiy5ub para usuário:', { userId, clientId });

      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações encontradas na tabela mzup2t8ygoiy5ub`);
        console.log('📋 Primeiro registro para análise:', allNotifications[0]);
        
        // Aplicar filtragem usando o campo "client_id" corretamente
        const userNotifications = allNotifications.filter(n => {
          const recordClientId = n.client_id;
          
          console.log('🔍 Analisando notificação:', {
            recordId: n.id,
            recordClientId,
            currentUserId: userId,
            currentClientId: clientId
          });
          
          // Verificar se a notificação pertence ao usuário atual usando o campo "client_id"
          const belongsToUser = recordClientId === userId || recordClientId === clientId;
          
          console.log('📋 Resultado da verificação:', {
            recordId: n.id,
            belongsToUser,
            reason: belongsToUser ? 'INCLUÍDA' : 'EXCLUÍDA',
            matchedWith: recordClientId === userId ? 'userId' : recordClientId === clientId ? 'clientId' : 'nenhum'
          });
          
          return belongsToUser;
        });
        
        console.log(`✅ ${userNotifications.length} notificações filtradas para usuário ${userId}/${clientId}`);
        return userNotifications;
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
      const userId = await this.getUserId();
      const tableId = await this.getNotificationsTableId(baseId);
      
      if (!tableId) {
        console.error('❌ Não foi possível acessar a tabela de notificações mzup2t8ygoiy5ub');
        return [];
      }

      console.log('📋 Buscando TODAS as notificações da tabela mzup2t8ygoiy5ub para usuário:', { userId, clientId });
      
      const timestamp = Date.now();
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=10000&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.list || [];
        
        console.log(`📊 ${allNotifications.length} notificações totais na tabela mzup2t8ygoiy5ub`);
        console.log('📋 Campos disponíveis:', Object.keys(allNotifications[0] || {}));
        
        // Aplicar filtragem estrita usando apenas o campo "client_id"
        const userNotifications = allNotifications.filter(n => {
          const recordClientId = n.client_id;
          const belongsToUser = recordClientId === userId || recordClientId === clientId;
          return belongsToUser;
        });
        
        console.log(`✅ ${userNotifications.length} notificações para o usuário ${userId}/${clientId}`);
        return userNotifications;
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
      const userId = await this.getUserId();
      
      if (!tableId) {
        console.error('❌ Tabela não disponível para criar dados de exemplo');
        return false;
      }

      console.log('📝 Criando dados de exemplo para notificações na tabela mzup2t8ygoiy5ub...');
      console.log('👤 Usando client_id:', userId);

      const sampleData = [
        {
          client_id: userId, // Usar o ID do usuário atual
          platform: 'hotmart',
          event_type: 'purchase',
          transaction_id: `TXN_${Date.now()}_001`,
          product_id: 'PROD_001',
          product_name: 'Curso de Marketing Digital',
          customer_name: 'João Silva Teste',
          customer_email: 'joao.teste@email.com',
          customer_phone: '+5511999888777',
          value: 197.50,
          currency: 'BRL',
          commission_value: 39.50,
          status: 'approved',
          event_date: new Date().toISOString(),
          processed: false,
          webhook_data: JSON.stringify({
            source: 'test_data',
            created_at: new Date().toISOString()
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          client_id: userId, // Usar o ID do usuário atual
          platform: 'eduzz',
          event_type: 'subscription',
          transaction_id: `TXN_${Date.now()}_002`,
          product_id: 'PROD_002',
          product_name: 'Assinatura Premium Teste',
          customer_name: 'Maria Santos Teste',
          customer_email: 'maria.teste@email.com',
          customer_phone: '+5511888777666',
          value: 29.90,
          currency: 'BRL',
          commission_value: 8.97,
          status: 'approved',
          event_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          processed: false,
          webhook_data: JSON.stringify({
            source: 'test_data',
            created_at: new Date().toISOString()
          }),
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          client_id: userId, // Usar o ID do usuário atual
          platform: 'monetizze',
          event_type: 'purchase',
          transaction_id: `TXN_${Date.now()}_003`,
          product_id: 'PROD_003',
          product_name: 'E-book Vendas Online',
          customer_name: 'Carlos Oliveira Teste',
          customer_email: 'carlos.teste@email.com',
          customer_phone: '+5511777666555',
          value: 47.00,
          currency: 'BRL',
          commission_value: 14.10,
          status: 'approved',
          event_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          processed: false,
          webhook_data: JSON.stringify({
            source: 'test_data',
            created_at: new Date().toISOString()
          }),
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];

      console.log('📤 Enviando dados de teste:', sampleData);

      for (const data of sampleData) {
        try {
          const response = await fetch(
            `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
            {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify(data)
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Notificação de exemplo criada:', result);
          } else {
            const errorText = await response.text();
            console.error('❌ Erro ao criar notificação:', errorText);
          }
        } catch (error) {
          console.error('❌ Erro na requisição:', error);
        }
      }

      console.log('✅ Processo de criação de dados de exemplo concluído');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar dados de exemplo:', error);
      return false;
    }
  }
}
