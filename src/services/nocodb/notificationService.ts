
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
        ErrorHandler.logOperationFailure('obter ID do usuário autenticado');
        return false;
      }

      console.log('🚀 INÍCIO - Salvando/Atualizando notificação Hotmart no NocoDB');
      console.log('📋 Dados recebidos pelo notificationService:', notificationData);
      console.log('👤 ID do usuário atual:', userId);
      
      const data = DataFormatter.formatNotificationForNocoDB({
        ...notificationData,
        userId // Adicionar ID do usuário aos dados
      });
      
      console.log('📦 Dados formatados pelo DataFormatter:', data);
      
      const tableId = await this.findTableId(baseId);
      if (!tableId) {
        ErrorHandler.logOperationFailure('encontrar tabela de notificações');
        return false;
      }

      console.log('✅ Tabela encontrada para operação:', tableId);

      if (notificationData.ruleId) {
        console.log('📝 Modo ATUALIZAÇÃO - ID da regra:', notificationData.ruleId);
        return await this.updateNotification(baseId, tableId, notificationData.ruleId, data, userId);
      } else {
        console.log('➕ Modo CRIAÇÃO - Nova notificação');
        return await this.createNotification(baseId, tableId, data);
      }
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO no notificationService:', error);
      return ErrorHandler.handleApiError(error, 'ao salvar/atualizar notificação Hotmart', notificationData);
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
      console.log('📝 INÍCIO - Atualizando notificação existente');
      console.log('🔑 ID do registro:', recordId);
      console.log('👤 Verificando propriedade para usuário:', userId);
      console.log('📦 Dados para atualização:', data);
      
      // Verificar se a notificação pertence ao usuário antes de atualizar
      const existingRecord = await this.apiOperations.getRecordById(baseId, tableId, recordId);
      console.log('📄 Registro existente encontrado:', existingRecord);
      
      if (!existingRecord) {
        console.error('❌ Registro não encontrado com ID:', recordId);
        return false;
      }
      
      if (existingRecord['ID do Usuário'] !== userId) {
        console.error('❌ Acesso negado: notificação não pertence ao usuário');
        console.error('❌ Usuário do registro:', existingRecord['ID do Usuário']);
        console.error('❌ Usuário atual:', userId);
        return false;
      }
      
      console.log('✅ Verificação de propriedade passou - prosseguindo com atualização');
      
      const result = await this.apiOperations.updateRecord(baseId, tableId, recordId, data);
      console.log('📊 Resultado da atualização:', result);
      
      DataFormatter.logUpdatedFields(data);
      ErrorHandler.logOperationSuccess('Notificação atualizada');
      console.log('✅ FIM - Notificação atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ ERRO na atualização:', error);
      ErrorHandler.logOperationFailure('atualizar notificação');
      return false;
    }
  }

  private async createNotification(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      console.log('➕ INÍCIO - Criando nova notificação');
      console.log('📦 Dados para criação:', data);
      
      const result = await this.apiOperations.createRecord(baseId, tableId, data);
      console.log('📊 Resultado da criação:', result);
      
      DataFormatter.logSavedFields(result, data);
      ErrorHandler.logOperationSuccess('Nova notificação criada');
      console.log('✅ FIM - Nova notificação criada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ ERRO na criação:', error);
      ErrorHandler.logOperationFailure('criar nova notificação');
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
