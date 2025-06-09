
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { NotificationRule } from '../types';

export const useFormSubmission = () => {
  const { toast } = useToast();

  const getWebhookUrl = (eventType: string): string => {
    const webhookUrls = {
      'purchase-approved': 'https://webhook.novahagencia.com.br/webhook/4759af4e-61f0-47b8-b2c0-d730000ca2b5',
      'awaiting-payment': 'https://webhook.novahagencia.com.br/webhook/5f5fd8b0-0733-4cfc-b5e7-319462991065',
      'cart-abandoned': 'https://webhook.novahagencia.com.br/webhook/6631e496-f119-48a4-b198-7d1d5010bbf7'
    };
    return webhookUrls[eventType] || '';
  };

  const saveRule = async (
    rule: Partial<NotificationRule>,
    editingRule: any,
    setCreatedWebhookUrl: (url: string) => void,
    setIsLoading: (loading: boolean) => void,
    resetForm: () => void,
    onRulesUpdate: () => void
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const webhookUrl = getWebhookUrl(rule.eventType!);
      
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

      // Mostrar URL do webhook criado apenas para novas notificações
      if (!editingRule) {
        setCreatedWebhookUrl(webhookUrl);
      }

      // Limpar formulário
      resetForm();
      
      // Recarregar as regras
      await onRulesUpdate();

      toast({
        title: "✅ Sucesso",
        description: editingRule ? 
          "Notificação atualizada com sucesso no banco de dados!" : 
          "Notificação criada com sucesso! Use a URL do webhook exibida acima.",
      });
      
      console.log(editingRule ? '✅ Notificação atualizada com sucesso' : '✅ Notificação criada com sucesso');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar notificação:', error);
      toast({
        title: "❌ Erro",
        description: editingRule ? 
          "Falha ao atualizar notificação no banco de dados" : 
          "Falha ao criar notificação no banco de dados",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveRule,
    getWebhookUrl,
  };
};
