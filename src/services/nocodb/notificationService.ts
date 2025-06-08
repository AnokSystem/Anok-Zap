
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';

export class NotificationService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async getHotmartNotifications(baseId: string): Promise<any[]> {
    try {
      console.log('🔍 Buscando notificações Hotmart do NocoDB...');
      console.log('Base ID:', baseId);
      
      // Obter ID da tabela
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      if (!tableId) {
        console.log('❌ ID da tabela NotificacoesHotmart não encontrado');
        console.log('Tentando buscar com nome alternativo...');
        
        // Tentar com nome alternativo
        const altTableId = await this.getTableId(baseId, 'Notificações Hotmart');
        if (!altTableId) {
          console.log('❌ Tabela de notificações não encontrada');
          return [];
        }
        console.log('✅ Tabela encontrada com nome alternativo:', altTableId);
      } else {
        console.log('✅ Tabela encontrada:', tableId);
      }
      
      const finalTableId = tableId || await this.getTableId(baseId, 'Notificações Hotmart');
      
      // Buscar notificações
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${finalTableId}?limit=100&sort=-CreatedAt`;
      console.log('🌐 URL de consulta:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });
      
      console.log('📡 Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resposta completa do NocoDB:', data);
        
        const notifications = data.list || [];
        console.log(`📋 ${notifications.length} notificações encontradas`);
        
        // Log das primeiras notificações para debug
        if (notifications.length > 0) {
          console.log('📄 Primeira notificação:', notifications[0]);
        }
        
        return notifications;
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro HTTP ${response.status}:`, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      return [];
    }
  }

  async saveHotmartNotification(baseId: string, notificationData: any): Promise<boolean> {
    try {
      console.log('💾 Salvando notificação Hotmart no NocoDB...');
      console.log('📋 Dados originais:', notificationData);
      
      // Estruturar os dados corretamente para o NocoDB
      const data = {
        'Tipo de Evento': notificationData.eventType || '',
        'ID da Instância': notificationData.instance || '',
        'Papel do Usuário': notificationData.userRole || '',
        'Plataforma': notificationData.platform || '',
        'Perfil Hotmart': notificationData.profileName || '',
        'URL do Webhook': notificationData.webhookUrl || '',
        'Contagem de Mensagens': notificationData.messages ? notificationData.messages.length : 0,
        'Telefone de Notificação': notificationData.notificationPhone || '',
        'Dados Completos (JSON)': JSON.stringify({
          ...notificationData,
          saved_timestamp: new Date().toISOString()
        })
      };
      
      console.log('🔧 Dados formatados para NocoDB:', data);
      
      // Tentar salvar na tabela de notificações
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      let finalTableId = tableId;
      
      if (!tableId) {
        console.log('⚠️ Tabela NotificacoesHotmart não encontrada, tentando nome alternativo...');
        finalTableId = await this.getTableId(baseId, 'Notificações Hotmart');
      }
      
      if (!finalTableId) {
        console.error('❌ Nenhuma tabela de notificações encontrada');
        return false;
      }

      const success = await this.saveToTable(baseId, finalTableId, data);
      if (success) {
        console.log('✅ Dados salvos com sucesso na tabela de notificações');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Erro geral ao salvar notificação Hotmart:', error);
      return false;
    }
  }

  private async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      console.log('🌐 URL de salvamento:', url);
      console.log('📤 Dados a serem enviados:', data);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      console.log('📡 Status do salvamento:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados salvos com sucesso:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro ao salvar ${response.status}:`, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro interno ao salvar:', error);
      return false;
    }
  }
}
