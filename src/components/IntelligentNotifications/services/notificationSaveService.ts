
import { nocodbService } from '@/services/nocodb';
import { NotificationRule } from '../types';
import { webhookService } from './webhookService';
import { userContextService } from '@/services/userContextService';

export const notificationSaveService = {
  saveNotification: async (
    rule: Partial<NotificationRule>,
    editingRule?: any
  ): Promise<{ success: boolean; webhookUrl: string }> => {
    console.log('🔄 SERVIÇO - Salvamento iniciado');
    console.log('📋 SERVIÇO - Dados da regra recebidos:', rule);
    console.log('📋 SERVIÇO - Regra sendo editada:', editingRule);
    
    // Validar dados obrigatórios antes de gerar webhook
    if (!rule.eventType || !rule.userRole) {
      console.error('❌ SERVIÇO - Dados obrigatórios faltando:', {
        eventType: rule.eventType,
        userRole: rule.userRole
      });
      throw new Error('Tipo de evento e função do usuário são obrigatórios');
    }
    
    // Obter informações do usuário atual
    const userId = userContextService.getUserId();
    const clientId = userContextService.getClientId();
    console.log('👤 SERVIÇO - Usuário atual:', { userId, clientId });
    
    // Obter webhook URL segmentado com valores validados
    const webhookUrl = webhookService.getWebhookUrl(
      rule.eventType,
      rule.userRole,
      rule.productScope || 'all'
    );
    
    console.log('🔗 SERVIÇO - Webhook URL gerado:', webhookUrl);
    
    if (!webhookUrl) {
      console.error('❌ SERVIÇO - Webhook URL não gerado');
      throw new Error('Não foi possível gerar a URL do webhook');
    }
    
    // CORREÇÃO: Preparar dados com campos consistentes e padronizados
    const notificationData: any = {
      eventType: rule.eventType,
      instance: rule.instanceId!,
      userRole: rule.userRole,
      platform: rule.platform!,
      profileName: rule.profileName!,
      productScope: rule.productScope || 'all',
      specificProductName: rule.specificProductName || '',
      messages: rule.messages,
      webhookUrl,
      // IMPORTANTE: Garantir que o userId seja salvo de forma consistente
      userId: userId,
      user_id: userId,
      client_id: clientId,
      ClientId: clientId,
      'ID do Usuário': userId,
      timestamp: new Date().toISOString(),
      // NOVO: Salvar dados completos no JSON para facilitar a extração posterior
      jsonData: JSON.stringify({
        eventType: rule.eventType,
        instance: rule.instanceId,
        userRole: rule.userRole,
        platform: rule.platform,
        profileName: rule.profileName,
        productScope: rule.productScope || 'all',
        specificProductName: rule.specificProductName || '',
        messages: rule.messages,
        webhookUrl,
        userId: userId,
        user_id: userId,
        timestamp: new Date().toISOString(),
        saved_timestamp: new Date().toISOString()
      })
    };

    // Se estamos editando, incluir o ID correto
    if (editingRule && (editingRule.ID || editingRule.id)) {
      const recordId = editingRule.ID || editingRule.id;
      notificationData.ruleId = recordId;
      console.log('📝 SERVIÇO - Modo ATUALIZAÇÃO com ID:', recordId);
      console.log('📤 SERVIÇO - Dados para atualização:', notificationData);
    } else {
      console.log('➕ SERVIÇO - Modo CRIAÇÃO');
      console.log('📤 SERVIÇO - Dados para criação:', notificationData);
    }

    try {
      console.log('🚀 SERVIÇO - Chamando nocodbService.saveHotmartNotification...');
      
      // Salvar no NocoDB
      const success = await nocodbService.saveHotmartNotification(notificationData);
      
      console.log('📊 SERVIÇO - Resultado do NocoDB:', success);
      
      if (!success) {
        console.error('❌ SERVIÇO - Falha retornada pelo nocodbService');
        throw new Error('Falha ao salvar no banco de dados');
      }

      const isEditing = editingRule && (editingRule.ID || editingRule.id);
      console.log(isEditing ? '✅ SERVIÇO - Notificação atualizada com sucesso' : '✅ SERVIÇO - Notificação criada com sucesso');
      
      return { success: true, webhookUrl };
    } catch (error) {
      console.error('❌ SERVIÇO - Erro crítico:', error);
      console.error('❌ SERVIÇO - Stack trace:', error.stack);
      throw error;
    }
  }
};
