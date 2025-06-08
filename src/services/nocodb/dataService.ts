
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';

export class DataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async saveMassMessagingLog(baseId: string, campaignData: any): Promise<boolean> {
    try {
      console.log('Salvando log de disparo em massa no NocoDB...');
      
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
      
      const tableId = await this.getTableId(baseId, 'MassMessagingLogs');
      if (tableId) {
        const success = await this.saveToTable(baseId, tableId, data);
        if (success) {
          console.log('✅ Log de disparo em massa salvo com sucesso');
          return true;
        }
      }
      
      console.log('❌ Falha ao salvar no NocoDB');
      return false;
    } catch (error) {
      console.error('Erro geral ao salvar log:', error);
      return false;
    }
  }

  async saveContacts(baseId: string, contacts: any[], instanceId: string): Promise<boolean> {
    try {
      console.log('Salvando contatos no NocoDB...');
      
      const contactRecords = contacts.map(contact => ({
        contact_id: contact.id,
        name: contact.name,
        phone_number: contact.phoneNumber,
        group_name: contact.groupName || null,
        instance_id: instanceId,
        created_at: new Date().toISOString(),
        data_json: JSON.stringify(contact)
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
            console.log('Erro ao salvar contato individual:', error);
          }
        }
      }
      
      console.log(`Processo concluído: ${savedCount} de ${contactRecords.length} contatos salvos`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      return false;
    }
  }

  async saveInstance(baseId: string, instanceData: any): Promise<boolean> {
    try {
      console.log('Salvando instância no NocoDB...');
      
      const data = {
        instance_id: instanceData.id,
        name: instanceData.name,
        status: instanceData.status,
        created_at: instanceData.creationDate,
        last_updated: new Date().toISOString(),
        data_json: JSON.stringify(instanceData)
      };
      
      const tableId = await this.getTableId(baseId, 'WhatsAppInstances');
      if (tableId) {
        const success = await this.saveToTable(baseId, tableId, data);
        if (success) {
          console.log('✅ Instância salva com sucesso');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
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
