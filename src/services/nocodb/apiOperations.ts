
import { NocodbConfig } from './types';

export class ApiOperations {
  private config: NocodbConfig;
  private headers: Record<string, string>;

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  async fetchNotifications(baseId: string, tableId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1000&sort=-CreatedAt`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Dados recebidos:', data);
        console.log(`📊 Total de notificações: ${data.list?.length || 0}`);
        return data.list || [];
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta da API:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      throw error;
    }
  }

  async fetchNotificationsByUser(baseId: string, tableId: string, userId: string): Promise<any[]> {
    try {
      console.log('🔍 Buscando notificações para usuário:', userId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1000&sort=-CreatedAt&where=(ID do Usuário,eq,${userId})`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Dados recebidos para usuário:', data);
        console.log(`📊 Total de notificações do usuário: ${data.list?.length || 0}`);
        return data.list || [];
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta da API:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar notificações do usuário:', error);
      throw error;
    }
  }

  async createRecord(baseId: string, tableId: string, data: any): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Registro criado:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao criar registro:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar registro:', error);
      throw error;
    }
  }

  async updateRecord(baseId: string, tableId: string, recordId: string, data: any): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Registro atualizado:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao atualizar registro:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar registro:', error);
      throw error;
    }
  }

  async deleteRecord(baseId: string, tableId: string, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'DELETE',
          headers: this.headers,
        }
      );

      if (response.ok) {
        console.log('✅ Registro excluído com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao excluir registro:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao excluir registro:', error);
      return false;
    }
  }

  async getRecordById(baseId: string, tableId: string, recordId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar registro:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar registro por ID:', error);
      return null;
    }
  }
}
