
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';

export class DataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // Obter client_id do usuário logado (pode ser do localStorage ou contexto)
  private getClientId(): string {
    // Por enquanto retorna um ID padrão, mas pode ser implementado baseado no usuário logado
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async saveMassMessagingLog(baseId: string, campaignData: any): Promise<boolean> {
    try {
      console.log('💾 Salvando log de disparo em massa no NocoDB...');
      console.log('📋 Dados recebidos:', campaignData);
      
      const clientId = this.getClientId();
      console.log('🏢 Client ID identificado:', clientId);
      
      const data = {
        client_id: clientId,
        campaign_id: campaignData.campaign_id || `campanha_${Date.now()}`,
        campaign_name: campaignData.campaign_name || `Campanha ${new Date().toLocaleString('pt-BR')}`,
        instance_id: campaignData.instance_id || campaignData.instance,
        instance_name: campaignData.instance_name || campaignData.instance,
        message_type: campaignData.message_type || campaignData.messages?.[0]?.type || 'text',
        recipient_count: campaignData.recipient_count || campaignData.recipients?.length || 0,
        sent_count: campaignData.sent_count || 0,
        error_count: campaignData.error_count || 0,
        delay: campaignData.delay || 5000,
        status: campaignData.status || 'iniciado',
        start_time: campaignData.start_time || new Date().toISOString(),
        notification_phone: campaignData.notificationPhone,
        data_json: JSON.stringify(campaignData),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Dados formatados para salvar:', data);
      
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (!tableId) {
        console.log('❌ Tabela MassMessagingLogs não encontrada na base');
        
        // Tentar encontrar pelo título alternativo
        const alternativeTableId = await this.getTableId(baseId, 'Logs de Disparo em Massa');
        if (!alternativeTableId) {
          console.log('❌ Tabela com título alternativo também não encontrada');
          return false;
        }
        
        console.log('🎯 Usando tabela com título alternativo:', alternativeTableId);
        const success = await this.saveToTable(baseId, alternativeTableId, data);
        return success;
      }
      
      console.log('🎯 ID da tabela encontrado:', tableId);
      
      const success = await this.saveToTable(baseId, tableId, data);
      if (success) {
        console.log('✅ Log de disparo em massa salvo com sucesso');
        return true;
      } else {
        console.log('❌ Falha ao salvar no NocoDB');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro geral ao salvar log:', error);
      return false;
    }
  }

  async saveContacts(baseId: string, contacts: any[], instanceId: string): Promise<boolean> {
    try {
      console.log('💾 Salvando contatos no NocoDB...');
      
      const clientId = this.getClientId();
      console.log('🏢 Client ID identificado:', clientId);
      
      const contactRecords = contacts.map(contact => ({
        client_id: clientId,
        contact_id: contact.id,
        name: contact.name,
        phone_number: contact.phoneNumber,
        group_name: contact.groupName || null,
        instance_id: instanceId,
        is_business: contact.isBusiness || false,
        profile_picture_url: contact.profilePictureUrl || null,
        last_seen: contact.lastSeen || null,
        data_json: JSON.stringify(contact),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const batchSize = 50;
      let savedCount = 0;
      const tableId = await this.getTableId(baseId, 'WhatsAppContacts');
      
      if (!tableId) {
        console.log('❌ Tabela WhatsAppContacts não encontrada');
        return false;
      }
      
      for (let i = 0; i < contactRecords.length; i += batchSize) {
        const batch = contactRecords.slice(i, i + batchSize);
        
        for (const contact of batch) {
          try {
            const success = await this.saveToTable(baseId, tableId, contact);
            if (success) savedCount++;
          } catch (error) {
            console.log('❌ Erro ao salvar contato individual:', error);
          }
        }
      }
      
      console.log(`✅ Processo concluído: ${savedCount} de ${contactRecords.length} contatos salvos para cliente ${clientId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar contatos:', error);
      return false;
    }
  }

  async saveInstance(baseId: string, instanceData: any): Promise<boolean> {
    try {
      console.log('💾 Salvando instância no NocoDB...');
      
      const clientId = this.getClientId();
      console.log('🏢 Client ID identificado:', clientId);
      
      const data = {
        client_id: clientId,
        instance_id: instanceData.id,
        name: instanceData.name,
        status: instanceData.status,
        phone_number: instanceData.phoneNumber || null,
        profile_name: instanceData.profileName || null,
        profile_picture_url: instanceData.profilePictureUrl || null,
        webhook_url: instanceData.webhookUrl || null,
        api_key: instanceData.apiKey || null,
        data_json: JSON.stringify(instanceData),
        created_at: instanceData.creationDate || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const tableId = await this.getTableId(baseId, 'WhatsAppInstances');
      if (tableId) {
        const success = await this.saveToTable(baseId, tableId, data);
        if (success) {
          console.log(`✅ Instância salva com sucesso para cliente ${clientId}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao salvar instância:', error);
      return false;
    }
  }

  // Método para buscar dados filtrados por cliente
  async getClientData(baseId: string, tableName: string, limit: number = 100): Promise<any[]> {
    try {
      const clientId = this.getClientId();
      const tableId = await this.getTableId(baseId, tableName);
      
      if (!tableId) {
        console.log(`❌ Tabela ${tableName} não encontrada`);
        return [];
      }

      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(client_id,eq,${clientId})&limit=${limit}&sort=-created_at`;
      console.log('📡 Buscando dados do cliente:', url);
      
      const response = await fetch(url, {
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.list?.length || 0} registros encontrados para cliente ${clientId}`);
        return data.list || [];
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao buscar dados (${response.status}):`, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do cliente:', error);
      return [];
    }
  }

  private async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      
      console.log('📡 Fazendo POST para:', url);
      console.log('📋 Dados a enviar:', JSON.stringify(data, null, 2));
      
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
        console.log(`❌ Erro ao salvar (${response.status}):`, errorText);
        
        // Log mais detalhado do erro
        console.log('❌ Headers enviados:', this.headers);
        console.log('❌ URL tentativa:', url);
        console.log('❌ Dados enviados:', data);
        
        return false;
      }
    } catch (error) {
      console.log('❌ Erro interno ao salvar:', error);
      return false;
    }
  }
}
