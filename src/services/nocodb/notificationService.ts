import { BaseNocodbService } from './baseService';
import { NocodbConfig } from './types';
import { DataFormatter } from './dataFormatter';
import { ApiOperations } from './apiOperations';
import { ErrorHandler } from './errorHandler';

export class NotificationService extends BaseNocodbService {
  private apiOperations: ApiOperations;

  constructor(config: NocodbConfig) {
    super(config);
    this.apiOperations = new ApiOperations(config);
  }

  private getCurrentUserId(): string | null {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.ID;
      }
    } catch (error) {
      console.error('Erro ao obter ID do usuário:', error);
    }
    return null;
  }

  async getHotmartNotifications(baseId: string): Promise<any[]> {
    try {
      console.log('🔍 Buscando notificações Hotmart do NocoDB...');
      console.log('Base ID:', baseId);
      
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.log('❌ Usuário não autenticado');
        return [];
      }
      
      console.log('👤 Filtrando notificações para usuário ID:', userId);
      
      const tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
      if (!tableId) {
        console.log('❌ ID da tabela NotificacoesHotmart não encontrado');
        console.log('Tentando buscar com nome alternativo...');
        
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
      return await this.apiOperations.fetchNotificationsByUser(baseId, finalTableId!, userId);
      
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      return [];
    }
  }

  async saveHotmartNotification(baseId: string, notificationData: any): Promise<boolean> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.error('❌ NOCODB - Usuário não autenticado');
        return false;
      }

      console.log('🚀 NOCODB - INÍCIO do salvamento');
      console.log('📋 NOCODB - Dados recebidos:', notificationData);
      console.log('👤 NOCODB - ID do usuário:', userId);
      
      const data = DataFormatter.formatNotificationForNocoDB({
        ...notificationData,
        userId
      });
      
      console.log('📦 NOCODB - Dados formatados:', data);
      
      const tableId = await this.findTableId(baseId);
      if (!tableId) {
        console.error('❌ NOCODB - Tabela não encontrada');
        return false;
      }

      console.log('✅ NOCODB - Tabela encontrada:', tableId);

      if (notificationData.ruleId) {
        console.log('📝 NOCODB - Modo ATUALIZAÇÃO - ID:', notificationData.ruleId);
        const updateResult = await this.updateNotification(baseId, tableId, notificationData.ruleId, data, userId);
        console.log('📊 NOCODB - Resultado da atualização:', updateResult);
        return updateResult;
      } else {
        console.log('➕ NOCODB - Modo CRIAÇÃO');
        const createResult = await this.createNotification(baseId, tableId, data);
        console.log('📊 NOCODB - Resultado da criação:', createResult);
        return createResult;
      }
      
    } catch (error) {
      console.error('❌ NOCODB - ERRO CRÍTICO:', error);
      return false;
    }
  }

  private async findTableId(baseId: string): Promise<string | null> {
    let tableId = await this.getTableId(baseId, 'NotificacoesHotmart');
    
    if (!tableId) {
      console.log('⚠️ Tabela NotificacoesHotmart não encontrada, tentando nome alternativo...');
      tableId = await this.getTableId(baseId, 'Notificações Hotmart');
    }
    
    if (!tableId) {
      console.error('❌ Nenhuma tabela de notificações encontrada');
      return null;
    }

    return tableId;
  }

  private async updateNotification(baseId: string, tableId: string, recordId: string, data: any, userId: string): Promise<boolean> {
    try {
      console.log('📝 NOCODB - ATUALIZAÇÃO - Iniciando');
      console.log('🔑 NOCODB - ATUALIZAÇÃO - ID do registro:', recordId);
      console.log('👤 NOCODB - ATUALIZAÇÃO - Verificando usuário:', userId);
      console.log('📦 NOCODB - ATUALIZAÇÃO - Dados:', data);
      
      // Verificar se o registro existe e pertence ao usuário
      const existingRecord = await this.apiOperations.getRecordById(baseId, tableId, recordId);
      console.log('📄 NOCODB - ATUALIZAÇÃO - Registro existente:', existingRecord);
      
      if (!existingRecord) {
        console.error('❌ NOCODB - ATUALIZAÇÃO - Registro não encontrado:', recordId);
        return false;
      }
      
      if (existingRecord['ID do Usuário'] !== userId) {
        console.error('❌ NOCODB - ATUALIZAÇÃO - Acesso negado');
        console.error('❌ NOCODB - ATUALIZAÇÃO - Usuário do registro:', existingRecord['ID do Usuário']);
        console.error('❌ NOCODB - ATUALIZAÇÃO - Usuário atual:', userId);
        return false;
      }
      
      console.log('✅ NOCODB - ATUALIZAÇÃO - Verificação passou');
      
      const result = await this.apiOperations.updateRecord(baseId, tableId, recordId, data);
      console.log('📊 NOCODB - ATUALIZAÇÃO - Resultado da API:', result);
      
      if (result) {
        console.log('✅ NOCODB - ATUALIZAÇÃO - SUCESSO');
        return true;
      } else {
        console.error('❌ NOCODB - ATUALIZAÇÃO - FALHA na API');
        return false;
      }
    } catch (error) {
      console.error('❌ NOCODB - ATUALIZAÇÃO - ERRO:', error);
      return false;
    }
  }

  private async createNotification(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      console.log('➕ NOCODB - CRIAÇÃO - Iniciando');
      console.log('📦 NOCODB - CRIAÇÃO - Dados:', data);
      
      const result = await this.apiOperations.createRecord(baseId, tableId, data);
      console.log('📊 NOCODB - CRIAÇÃO - Resultado:', result);
      
      if (result) {
        console.log('✅ NOCODB - CRIAÇÃO - SUCESSO');
        return true;
      } else {
        console.error('❌ NOCODB - CRIAÇÃO - FALHA');
        return false;
      }
    } catch (error) {
      console.error('❌ NOCODB - CRIAÇÃO - ERRO:', error);
      return false;
    }
  }

  async deleteNotification(baseId: string, recordId: string): Promise<boolean> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.error('❌ Usuário não autenticado');
        return false;
      }

      const tableId = await this.findTableId(baseId);
      if (!tableId) {
        console.error('❌ Tabela não encontrada');
        return false;
      }

      console.log('🗑️ Excluindo notificação:', recordId);
      console.log('👤 Verificando propriedade para usuário:', userId);

      // Verificar se a notificação pertence ao usuário antes de excluir
      const existingRecord = await this.apiOperations.getRecordById(baseId, tableId, recordId);
      if (!existingRecord || existingRecord['ID do Usuário'] !== userId) {
        console.error('❌ Acesso negado: notificação não pertence ao usuário');
        return false;
      }

      const success = await this.apiOperations.deleteRecord(baseId, tableId, recordId);
      
      if (success) {
        console.log('✅ Notificação excluída com sucesso');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error);
      return false;
    }
  }
}
