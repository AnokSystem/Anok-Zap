
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class ContactsService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  private getClientId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
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

  private async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao salvar (${response.status}):`, errorText);
        return false;
      }
    } catch (error) {
      console.log('❌ Erro interno ao salvar:', error);
      return false;
    }
  }
}
