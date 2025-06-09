
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';
import { ErrorHandler } from './errorHandler';

export class ApiOperations extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async fetchNotifications(baseId: string, tableId: string): Promise<any[]> {
    const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=100&sort=-CreatedAt`;
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
      
      if (notifications.length > 0) {
        console.log('📄 Primeira notificação:', notifications[0]);
      }
      
      return notifications;
    } else {
      const errorText = await response.text();
      throw ErrorHandler.createHttpError(response.status, errorText);
    }
  }

  async createRecord(baseId: string, tableId: string, data: any): Promise<any> {
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
      return result;
    } else {
      const errorText = await response.text();
      console.error(`❌ Erro ao criar ${response.status}:`, errorText);
      console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
      throw ErrorHandler.createHttpError(response.status, errorText);
    }
  }

  async updateRecord(baseId: string, tableId: string, recordId: string, data: any): Promise<any> {
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
      return result;
    } else {
      const errorText = await response.text();
      console.error(`❌ Erro ao atualizar ${response.status}:`, errorText);
      console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
      throw ErrorHandler.createHttpError(response.status, errorText);
    }
  }
}
