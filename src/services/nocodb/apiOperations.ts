
import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';
import { ErrorHandler } from './errorHandler';

export class ApiOperations extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async fetchNotificationsByUser(baseId: string, tableId: string, userId: string): Promise<any[]> {
    try {
      console.log('🔍 API - Buscando notificações para usuário:', userId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?where=(ID%20do%20Usuário,eq,${userId})`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API - Notificações encontradas:', data.list?.length || 0);
        return data.list || [];
      } else {
        const errorText = await response.text();
        console.error('❌ API - Erro na busca:', response.status, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ API - Erro ao buscar notificações por usuário:', error);
      return [];
    }
  }

  async fetchAllNotifications(baseId: string, tableId: string): Promise<any[]> {
    try {
      console.log('🔍 API - Buscando TODAS as notificações...');
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API - Total de notificações encontradas:', data.list?.length || 0);
        return data.list || [];
      } else {
        const errorText = await response.text();
        console.error('❌ API - Erro na busca:', response.status, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ API - Erro ao buscar todas as notificações:', error);
      return [];
    }
  }

  async getRecordById(baseId: string, tableId: string, recordId: string): Promise<any | null> {
    try {
      console.log('🔍 API - Buscando registro por ID:', recordId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API - Registro encontrado:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ API - Erro ao buscar registro:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('❌ API - Erro ao buscar registro por ID:', error);
      return null;
    }
  }

  async createRecord(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      console.log('➕ API - Criando novo registro...');
      console.log('📦 API - Dados para criação:', data);
      
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
        console.log('✅ API - Registro criado com sucesso:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ API - Erro na criação:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ API - Erro ao criar registro:', error);
      return false;
    }
  }

  async updateRecord(baseId: string, tableId: string, recordId: string, data: any): Promise<boolean> {
    try {
      console.log('📝 API - Atualizando registro:', recordId);
      console.log('📦 API - Dados para atualização:', data);
      
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
        console.log('✅ API - Registro atualizado com sucesso:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ API - Erro na atualização:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ API - Erro ao atualizar registro:', error);
      return false;
    }
  }

  async deleteRecord(baseId: string, tableId: string, recordId: string): Promise<boolean> {
    try {
      console.log('🗑️ API - Excluindo registro:', recordId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'DELETE',
          headers: this.headers,
        }
      );

      if (response.ok) {
        console.log('✅ API - Registro excluído com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ API - Erro na exclusão:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ API - Erro ao excluir registro:', error);
      return false;
    }
  }
}
