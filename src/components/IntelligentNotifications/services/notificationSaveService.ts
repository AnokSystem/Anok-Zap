
import { nocodbService } from '@/services/nocodb';
import { NotificationRule } from '../types';
import { webhookService } from './webhookService';

export const notificationSaveService = {
  saveNotification: async (
    rule: Partial<NotificationRule>,
    editingRule: any
  ): Promise<{ success: boolean; webhookUrl: string }> => {
    const webhookUrl = webhookService.getWebhookUrl(rule.eventType!);
    
    const notificationData = {
      eventType: rule.eventType!,
      instance: rule.instanceId!,
      userRole: rule.userRole!,
      platform: rule.platform!,
      profileName: rule.profileName!,
      messages: rule.messages,
      webhookUrl,
      timestamp: new Date().toISOString(),
      // Se estamos editando, incluir o ID da notificação
      ...(editingRule && { ruleId: editingRule.ID || editingRule.id })
    };

    console.log(editingRule ? '📝 Atualizando notificação:' : '➕ Criando notificação:', notificationData);

    // Salvar no NocoDB - o serviço já trata criação/atualização
    const success = await nocodbService.saveHotmartNotification(notificationData);
    
    if (!success) {
      throw new Error('Falha ao salvar no banco de dados');
    }

    console.log(editingRule ? '✅ Notificação atualizada com sucesso' : '✅ Notificação criada com sucesso');
    
    return { success: true, webhookUrl };
  }
};
