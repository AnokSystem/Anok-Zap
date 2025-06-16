
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class InstancesService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  private getClientId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
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
