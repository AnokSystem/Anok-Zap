
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
      console.log('💾 Salvando/Atualizando notificação Hotmart no NocoDB...');
      console.log('📋 Dados originais recebidos:', notificationData);
      
      // Estruturar os dados corretamente para o NocoDB com todos os campos necessários
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
          eventType: notificationData.eventType,
          instance: notificationData.instance,
          userRole: notificationData.userRole,
          platform: notificationData.platform,
          profileName: notificationData.profileName,
          messages: notificationData.messages || [],
          webhookUrl: notificationData.webhookUrl,
          notificationPhone: notificationData.notificationPhone || '',
          timestamp: notificationData.timestamp || new Date().toISOString(),
          saved_timestamp: new Date().toISOString(),
          ruleId: notificationData.ruleId || null
        }, null, 2)
      };
      
      console.log('🔧 Dados formatados para NocoDB (completos):', data);
      console.log('📊 Validação dos campos obrigatórios:');
      console.log('- Tipo de Evento:', data['Tipo de Evento']);
      console.log('- ID da Instância:', data['ID da Instância']);
      console.log('- Papel do Usuário:', data['Papel do Usuário']);
      console.log('- Plataforma:', data['Plataforma']);
      console.log('- Perfil Hotmart:', data['Perfil Hotmart']);
      console.log('- URL do Webhook:', data['URL do Webhook']);
      console.log('- Contagem de Mensagens:', data['Contagem de Mensagens']);
      
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

      console.log('✅ Tabela encontrada para operação:', finalTableId);

      // Verificar se é uma atualização ou criação
      if (notificationData.ruleId) {
        console.log('📝 Atualizando notificação existente com ID:', notificationData.ruleId);
        const success = await this.updateInTable(baseId, finalTableId, notificationData.ruleId, data);
        if (success) {
          console.log('✅ Notificação atualizada com sucesso - todos os dados salvos');
          return true;
        } else {
          console.error('❌ Falha ao atualizar notificação');
          return false;
        }
      } else {
        console.log('➕ Criando nova notificação com todos os dados');
        const success = await this.saveToTable(baseId, finalTableId, data);
        if (success) {
          console.log('✅ Nova notificação criada com sucesso - todos os dados salvos');
          return true;
        } else {
          console.error('❌ Falha ao criar nova notificação');
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ Erro geral ao salvar/atualizar notificação Hotmart:', error);
      console.error('❌ Stack trace:', error.stack);
      return false;
    }
  }

  private async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      console.log('🌐 URL de criação:', url);
      console.log('📤 Dados completos a serem enviados:', JSON.stringify(data, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      console.log('📡 Status da criação:', response.status);
      console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados criados com sucesso no NocoDB:', result);
        
        // Verificar se todos os campos foram salvos
        console.log('🔍 Verificação dos campos salvos:');
        Object.keys(data).forEach(key => {
          if (result[key] !== undefined) {
            console.log(`✅ Campo '${key}' salvo com sucesso:`, result[key]);
          } else {
            console.warn(`⚠️ Campo '${key}' pode não ter sido salvo corretamente`);
          }
        });
        
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro ao criar ${response.status}:`, errorText);
        console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Erro interno ao criar:', error);
      console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
      return false;
    }
  }

  private async updateInTable(baseId: string, tableId: string, recordId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`;
      console.log('🌐 URL de atualização:', url);
      console.log('📤 Dados completos a serem atualizados:', JSON.stringify(data, null, 2));
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      console.log('📡 Status da atualização:', response.status);
      console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados atualizados com sucesso no NocoDB:', result);
        
        // Verificar se todos os campos foram atualizados
        console.log('🔍 Verificação dos campos atualizados:');
        Object.keys(data).forEach(key => {
          console.log(`✅ Campo '${key}' processado para atualização:`, data[key]);
        });
        
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro ao atualizar ${response.status}:`, errorText);
        console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Erro interno ao atualizar:', error);
      console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
      return false;
    }
  }
}
