
import { nocodbService } from '@/services/nocodb';
import { NotificationRule } from '../types';
import { webhookService } from './webhookService';

export const notificationSaveService = {
  saveNotification: async (
    rule: Partial<NotificationRule>,
    editingRule?: any
  ): Promise<{ success: boolean; webhookUrl: string }> => {
    console.log('🔄 Serviço de salvamento iniciado');
    console.log('📋 Dados da regra:', rule);
    console.log('📋 Regra sendo editada:', editingRule);
    
    const webhookUrl = webhookService.getWebhookUrl(rule.eventType!);
    
    // Base notification data - corrigir mapeamento instanceId/instance
    const notificationData: any = {
      eventType: rule.eventType!,
      instance: rule.instanceId!, // O banco espera 'instance'
      userRole: rule.userRole!,
      platform: rule.platform!,
      profileName: rule.profileName!,
      messages: rule.messages,
      webhookUrl,
      timestamp: new Date().toISOString(),
    };

    // Se estamos editando, incluir o ID da notificação
    if (editingRule && (editingRule.ID || editingRule.id)) {
      const recordId = editingRule.ID || editingRule.id;
      notificationData.ruleId = recordId;
      console.log('📝 Atualizando notificação existente com ID:', recordId);
    } else {
      console.log('➕ Criando nova notificação');
    }

    console.log('📤 Dados preparados para salvamento:', notificationData);

    try {
      // Salvar no NocoDB - o serviço já trata criação/atualização
      const success = await nocodbService.saveHotmartNotification(notificationData);
      
      if (!success) {
        throw new Error('Falha ao salvar no banco de dados');
      }

      const isEditing = editingRule && (editingRule.ID || editingRule.id);
      console.log(isEditing ? '✅ Notificação atualizada com sucesso' : '✅ Notificação criada com sucesso');
      
      return { success: true, webhookUrl };
    } catch (error) {
      console.error('❌ Erro no serviço de salvamento:', error);
      throw error;
    }
  }
};
