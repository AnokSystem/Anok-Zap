
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

  async getHotmartNotifications(baseId: string): Promise<any[]> {
    try {
      console.log('🔍 Buscando notificações Hotmart do NocoDB...');
      console.log('Base ID:', baseId);
      
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
      return await this.apiOperations.fetchNotifications(baseId, finalTableId!);
      
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      return [];
    }
  }

  async saveHotmartNotification(baseId: string, notificationData: any): Promise<boolean> {
    try {
      ErrorHandler.logOperationStart('Salvando/Atualizando notificação Hotmart no NocoDB', notificationData);
      
      const data = DataFormatter.formatNotificationForNocoDB(notificationData);
      
      const tableId = await this.findTableId(baseId);
      if (!tableId) {
        ErrorHandler.logOperationFailure('encontrar tabela de notificações');
        return false;
      }

      console.log('✅ Tabela encontrada para operação:', tableId);

      if (notificationData.ruleId) {
        return await this.updateNotification(baseId, tableId, notificationData.ruleId, data);
      } else {
        return await this.createNotification(baseId, tableId, data);
      }
      
    } catch (error) {
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

  private async updateNotification(baseId: string, tableId: string, recordId: string, data: any): Promise<boolean> {
    try {
      console.log('📝 Atualizando notificação existente com ID:', recordId);
      const result = await this.apiOperations.updateRecord(baseId, tableId, recordId, data);
      
      DataFormatter.logUpdatedFields(data);
      ErrorHandler.logOperationSuccess('Notificação atualizada');
      return true;
    } catch (error) {
      ErrorHandler.logOperationFailure('atualizar notificação');
      return false;
    }
  }

  private async createNotification(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      console.log('➕ Criando nova notificação com todos os dados');
      const result = await this.apiOperations.createRecord(baseId, tableId, data);
      
      DataFormatter.logSavedFields(result, data);
      ErrorHandler.logOperationSuccess('Nova notificação criada');
      return true;
    } catch (error) {
      ErrorHandler.logOperationFailure('criar nova notificação');
      return false;
    }
  }
}
