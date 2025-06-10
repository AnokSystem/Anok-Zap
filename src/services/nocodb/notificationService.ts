
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
      console.log('🔍 Buscando TODAS as notificações Hotmart do NocoDB...');
      console.log('Base ID:', baseId);
      
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.log('❌ Usuário não autenticado');
        return [];
      }
      
      console.log('👤 Usuário autenticado ID:', userId);
      
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
      
      // CORREÇÃO: Buscar TODAS as notificações, não filtrar por usuário na visualização
      console.log('📋 Buscando todas as notificações sem filtro de usuário...');
      return await this.apiOperations.fetchAllNotifications(baseId, finalTableId!);
      
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
      console.log('📦 NOCODB - ATUALIZAÇÃO - Dados para envio:', data);
      
      // CORREÇÃO: Verificar se o registro existe primeiro
      const existingRecord = await this.apiOperations.getRecordById(baseId, tableId, recordId);
      console.log('📄 NOCODB - ATUALIZAÇÃO - Registro existente:', existingRecord);
      
      if (!existingRecord) {
        console.error('❌ NOCODB - ATUALIZAÇÃO - Registro não encontrado:', recordId);
        return false;
      }
      
      // CORREÇÃO: Verificar propriedade do usuário de forma mais robusta
      const recordUserId = this.extractUserIdFromRecord(existingRecord);
      console.log('🔍 NOCODB - ATUALIZAÇÃO - UserId do registro:', recordUserId);
      console.log('🔍 NOCODB - ATUALIZAÇÃO - UserId atual:', userId);
      
      if (recordUserId !== userId) {
        console.error('❌ NOCODB - ATUALIZAÇÃO - Acesso negado');
        console.error('❌ NOCODB - ATUALIZAÇÃO - Usuário do registro:', recordUserId);
        console.error('❌ NOCODB - ATUALIZAÇÃO - Usuário atual:', userId);
        return false;
      }
      
      console.log('✅ NOCODB - ATUALIZAÇÃO - Verificação de propriedade passou');
      
      // CORREÇÃO: Fazer a atualização com dados corretos
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

  // CORREÇÃO: Melhorar a extração do userId do registro
  private extractUserIdFromRecord(record: any): string | null {
    console.log('🔍 EXTRACTUSER - Tentando extrair userId do registro:', record);
    
    // Tentar diferentes campos possíveis
    const possibleFields = [
      record['ID do Usuário'],
      record['ID_do_Usuario'],
      record['IDdoUsuario'],
      record['UserId'],
      record['user_id'],
      record['UserID']
    ];

    for (const field of possibleFields) {
      if (field !== undefined && field !== null) {
        console.log('✅ EXTRACTUSER - UserId encontrado em campo direto:', field);
        // Se for um objeto com _type e value (como nos logs), extrair o value
        if (typeof field === 'object' && field.value !== undefined) {
          return String(field.value);
        }
        // Se for string ou número diretamente
        if (typeof field === 'string' || typeof field === 'number') {
          return String(field);
        }
      }
    }

    // CORREÇÃO: Se não encontrou nos campos diretos, buscar no JSON de forma mais robusta
    const jsonField = record['Dados Completos (JSON)'];
    if (jsonField) {
      try {
        console.log('🔍 EXTRACTUSER - Tentando extrair do JSON:', jsonField);
        const jsonData = JSON.parse(jsonField);
        console.log('📋 EXTRACTUSER - Dados do JSON:', jsonData);
        
        if (jsonData.userId) {
          console.log('✅ EXTRACTUSER - UserId encontrado no JSON:', jsonData.userId);
          return String(jsonData.userId);
        }
        
        // Também tentar outras variações no JSON
        if (jsonData.user_id) {
          console.log('✅ EXTRACTUSER - user_id encontrado no JSON:', jsonData.user_id);
          return String(jsonData.user_id);
        }
        
      } catch (e) {
        console.error('❌ EXTRACTUSER - Erro ao fazer parse do JSON:', e);
      }
    }

    console.log('❌ EXTRACTUSER - UserId não encontrado');
    return null;
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
        console.error('❌ DELETE - Usuário não autenticado');
        return false;
      }

      const tableId = await this.findTableId(baseId);
      if (!tableId) {
        console.error('❌ DELETE - Tabela não encontrada');
        return false;
      }

      console.log('🗑️ DELETE - Excluindo notificação:', recordId);
      console.log('👤 DELETE - Verificando propriedade para usuário:', userId);

      // CORREÇÃO: Verificar se a notificação pertence ao usuário antes de excluir
      const existingRecord = await this.apiOperations.getRecordById(baseId, tableId, recordId);
      console.log('📄 DELETE - Registro encontrado:', existingRecord);
      
      if (!existingRecord) {
        console.error('❌ DELETE - Registro não encontrado:', recordId);
        return false;
      }
      
      const recordUserId = this.extractUserIdFromRecord(existingRecord);
      console.log('🔍 DELETE - UserId do registro:', recordUserId);
      console.log('🔍 DELETE - UserId atual:', userId);
      
      if (!recordUserId) {
        console.error('❌ DELETE - Não foi possível extrair o userId do registro');
        return false;
      }
      
      if (recordUserId !== userId) {
        console.error('❌ DELETE - Acesso negado: notificação não pertence ao usuário');
        console.error('❌ DELETE - UserId do registro:', recordUserId);
        console.error('❌ DELETE - UserId atual:', userId);
        return false;
      }

      console.log('✅ DELETE - Verificação de propriedade passou, prosseguindo com exclusão');
      
      const success = await this.apiOperations.deleteRecord(baseId, tableId, recordId);
      
      if (success) {
        console.log('✅ DELETE - Notificação excluída com sucesso');
      } else {
        console.error('❌ DELETE - Falha na exclusão');
      }
      
      return success;
    } catch (error) {
      console.error('❌ DELETE - Erro ao excluir notificação:', error);
      return false;
    }
  }
}
