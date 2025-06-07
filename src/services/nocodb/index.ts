
import { NocodbConfig, ConnectionTestResult } from './types';
import { NocodbTableManager } from './tableManager';
import { NocodbDataOperations } from './dataOperations';

class NocodbService {
  private config: NocodbConfig = {
    baseUrl: 'https://kovalski.novahagencia.com.br',
    apiToken: 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ'
  };

  private tableManager: NocodbTableManager;
  private dataOperations: NocodbDataOperations;

  constructor() {
    this.tableManager = new NocodbTableManager(this.config);
    this.dataOperations = new NocodbDataOperations(this.config);
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
      console.log('Salvando notificação Hotmart no NocoDB...');
      console.log('Dados originais:', notificationData);
      
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('NotificacoesHotmart');
      
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
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (!targetBaseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada');
        this.dataOperations.saveLocalFallback('hotmart_notifications', notificationData);
        return true;
      }
      
      // Tentar salvar na tabela de notificações
      const success = await this.dataOperations.saveToSpecificTable(targetBaseId, 'NotificacoesHotmart', data);
      if (success) {
        console.log('✅ Dados salvos com sucesso na tabela NotificacoesHotmart');
        return true;
      }
      
      // Se falhou, salvar como fallback
      console.log('❌ Falha ao salvar, usando fallback local');
      this.dataOperations.saveLocalFallback('hotmart_notifications', data);
      return true;
      
    } catch (error) {
      console.error('Erro geral ao salvar notificação Hotmart:', error);
      this.dataOperations.saveLocalFallback('hotmart_notifications', notificationData);
      return true;
    }
  }

  async saveMassMessagingLog(campaignData: any) {
    try {
      console.log('Salvando log de disparo em massa no NocoDB...');
      
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('MassMessagingLogs');
      
      const data = {
        campaign_id: `campanha_${Date.now()}`,
        instance_id: campaignData.instance,
        message_type: campaignData.messages[0]?.type || 'text',
        recipient_count: campaignData.recipients.length,
        delay: campaignData.delay,
        status: 'iniciado',
        created_at: new Date().toISOString(),
        data_json: JSON.stringify(campaignData)
      };
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (targetBaseId) {
        const success = await this.dataOperations.saveToSpecificTable(targetBaseId, 'MassMessagingLogs', data);
        if (success) {
          console.log('✅ Log de disparo em massa salvo com sucesso');
          return true;
        }
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
      console.log('Salvando contatos no NocoDB...');
      
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('WhatsAppContacts');
      
      const contactRecords = contacts.map(contact => ({
        contact_id: contact.id,
        name: contact.name,
        phone_number: contact.phoneNumber,
        group_name: contact.groupName || null,
        instance_id: instanceId,
        created_at: new Date().toISOString(),
        data_json: JSON.stringify(contact)
      }));

      // Salvar em lotes para melhor performance
      const batchSize = 50;
      let savedCount = 0;
      const targetBaseId = this.tableManager.getTargetBaseId();
      
      for (let i = 0; i < contactRecords.length; i += batchSize) {
        const batch = contactRecords.slice(i, i + batchSize);
        
        for (const contact of batch) {
          try {
            if (targetBaseId) {
              const success = await this.dataOperations.saveToSpecificTable(targetBaseId, 'WhatsAppContacts', contact);
              if (success) savedCount++;
            }
          } catch (error) {
            console.log('Erro ao salvar contato individual:', error);
          }
        }
      }
      
      console.log(`Processo concluído: ${savedCount} de ${contactRecords.length} contatos salvos`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      return true;
    }
  }

  async saveInstance(instanceData: any) {
    try {
      console.log('Salvando instância no NocoDB...');
      
      // Garantir que a tabela existe
      await this.tableManager.ensureTableExists('WhatsAppInstances');
      
      const data = {
        instance_id: instanceData.id,
        name: instanceData.name,
        status: instanceData.status,
        created_at: instanceData.creationDate,
        last_updated: new Date().toISOString(),
        data_json: JSON.stringify(instanceData)
      };
      
      const targetBaseId = this.tableManager.getTargetBaseId();
      if (targetBaseId) {
        const success = await this.dataOperations.saveToSpecificTable(targetBaseId, 'WhatsAppInstances', data);
        if (success) {
          console.log('✅ Instância salva com sucesso');
          return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      return true;
    }
  }

  async syncLocalData() {
    const targetBaseId = this.tableManager.getTargetBaseId();
    return await this.dataOperations.syncLocalData(targetBaseId, this.saveHotmartNotification.bind(this));
  }
}

export const nocodbService = new NocodbService();
