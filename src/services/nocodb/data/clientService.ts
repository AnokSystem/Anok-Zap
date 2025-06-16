
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class ClientService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  getClientId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  protected async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
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
