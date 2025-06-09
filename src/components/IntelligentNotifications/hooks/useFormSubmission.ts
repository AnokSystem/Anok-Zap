
import { useToast } from "@/hooks/use-toast";
import { NotificationRule } from '../types';
import { notificationSaveService } from '../services/notificationSaveService';
import { webhookService } from '../services/webhookService';

export const useFormSubmission = () => {
  const { toast } = useToast();

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
      const { webhookUrl } = await notificationSaveService.saveNotification(rule, editingRule);
      
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
    getWebhookUrl: webhookService.getWebhookUrl,
  };
};
