
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';

export class NotificationService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async getHotmartNotifications(baseId: string): Promise<any[]> {
    try {
      console.log('Buscando notificações Hotmart do NocoDB...');
      
      // Obter ID da tabela
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      if (!tableId) {
        console.log('❌ ID da tabela NotificacoesHotmart não encontrado');
        return [];
      }
      
      // Buscar notificações
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=100`;
      console.log('URL de consulta:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Resposta completa do NocoDB:', data);
        const notifications = data.list || [];
        console.log('Notificações encontradas:', notifications);
        return notifications;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao buscar notificações: ${response.status}`, errorText);
        return [];
      }
    } catch (error) {
      console.log('❌ Erro ao buscar notificações:', error);
      return [];
    }
  }

  async saveHotmartNotification(baseId: string, notificationData: any): Promise<boolean> {
    try {
      console.log('Salvando notificação Hotmart no NocoDB...');
      console.log('Dados originais:', notificationData);
      
      // Estruturar os dados corretamente para o NocoDB
      const data = {
        event_type: notificationData.eventType || '',
        instance_id: notificationData.instance || '',
        user_role: notificationData.userRole || '',
        hotmart_profile: notificationData.hotmartProfile || '',
        webhook_url: notificationData.webhookUrl || '',
        message_count: notificationData.messages ? notificationData.messages.length : 0,
        notification_phone: notificationData.notificationPhone || '',
        created_at: notificationData.timestamp || new Date().toISOString(),
        data_json: JSON.stringify({
          ...notificationData,
          saved_timestamp: new Date().toISOString()
        })
      };
      
      console.log('Dados formatados para NocoDB:', data);
      
      // Tentar salvar na tabela de notificações
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      if (!tableId) {
        console.log('❌ Tabela NotificacoesHotmart não encontrada');
        return false;
      }

      const success = await this.saveToTable(baseId, tableId, data);
      if (success) {
        console.log('✅ Dados salvos com sucesso na tabela NotificacoesHotmart');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Erro geral ao salvar notificação Hotmart:', error);
      return false;
    }
  }

  private async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados salvos com sucesso:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao salvar ${response.status}:`, errorText);
        return false;
      }
    } catch (error) {
      console.log('❌ Erro interno ao salvar:', error);
      return false;
    }
  }
}
