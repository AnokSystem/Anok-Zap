
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { notificationSaveService } from '@/components/IntelligentNotifications/services/notificationSaveService';
import { Notification } from '../types';

export const useNotificationEditing = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
  loadNotifications: () => Promise<void>
) => {
  const { toast } = useToast();
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const editNotification = (notification: Notification) => {
    console.log('📝 Iniciando edição da notificação:', notification);
    setEditingNotification(notification);
    
    toast({
      title: "Modo de Edição Ativado",
      description: "Agora você pode editar os dados da notificação abaixo.",
    });
  };

  const cancelEdit = () => {
    console.log('❌ Cancelando edição');
    setEditingNotification(null);
    
    toast({
      title: "Edição Cancelada",
      description: "Modo de edição desativado",
    });
  };

  const saveEditedNotification = async (updatedNotificationData: any): Promise<boolean> => {
    if (!editingNotification) {
      console.error('❌ Nenhuma notificação sendo editada');
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log('💾 SALVAMENTO - Dados recebidos para edição:', updatedNotificationData);
      console.log('💾 SALVAMENTO - Notificação original:', editingNotification);
      console.log('💾 SALVAMENTO - ID da notificação:', editingNotification.ID);
      
      // CORREÇÃO: Validar dados essenciais de forma mais robusta
      if (!updatedNotificationData.eventType || !updatedNotificationData.instanceId || 
          !updatedNotificationData.userRole || !updatedNotificationData.platform || 
          !updatedNotificationData.profileName) {
        console.error('❌ SALVAMENTO - Dados obrigatórios faltando');
        console.error('❌ SALVAMENTO - Dados recebidos:', {
          eventType: updatedNotificationData.eventType,
          instanceId: updatedNotificationData.instanceId,
          userRole: updatedNotificationData.userRole,
          platform: updatedNotificationData.platform,
          profileName: updatedNotificationData.profileName
        });
        
        toast({
          title: "❌ Erro de Validação",
          description: "Dados obrigatórios estão faltando",
          variant: "destructive",
        });
        return false;
      }

      // Verificar mensagens válidas
      const validMessages = updatedNotificationData.messages?.filter(msg => 
        (msg.content && msg.content.trim() !== '') || msg.fileUrl
      ) || [];

      if (validMessages.length === 0) {
        console.error('❌ SALVAMENTO - Nenhuma mensagem válida');
        toast({
          title: "❌ Erro de Validação",
          description: "Pelo menos uma mensagem é obrigatória",
          variant: "destructive",
        });
        return false;
      }

      // CORREÇÃO: Garantir que instanceId seja mapeado corretamente para instance
      const ruleData = {
        eventType: updatedNotificationData.eventType,
        instanceId: updatedNotificationData.instanceId, // Será convertido no serviço
        userRole: updatedNotificationData.userRole,
        platform: updatedNotificationData.platform,
        profileName: updatedNotificationData.profileName,
        messages: validMessages,
      };

      console.log('💾 SALVAMENTO - Dados formatados para serviço:', ruleData);
      console.log('💾 SALVAMENTO - Mensagens válidas:', validMessages.length);

      // CORREÇÃO: Usar ID correto da notificação
      const editingRule = {
        ID: editingNotification.ID,
        id: editingNotification.ID // Garantir ambos os formatos
      };

      console.log('💾 SALVAMENTO - Enviando para notificationSaveService...');
      console.log('💾 SALVAMENTO - editingRule ID:', editingRule.ID);

      // Chamar o serviço de salvamento
      const result = await notificationSaveService.saveNotification(
        ruleData,
        editingRule
      );

      console.log('💾 SALVAMENTO - Resultado do serviço:', result);

      if (result.success) {
        console.log('✅ SALVAMENTO - Sucesso! Notificação atualizada no NocoDB');
        
        toast({
          title: "✅ Sucesso",
          description: "Notificação atualizada com sucesso no banco de dados!",
        });
        
        // Recarregar notificações para mostrar as mudanças
        console.log('🔄 SALVAMENTO - Recarregando notificações...');
        await loadNotifications();
        
        // Sair do modo de edição
        setEditingNotification(null);
        
        return true;
      } else {
        console.error('❌ SALVAMENTO - Falha no serviço');
        toast({
          title: "❌ Erro",
          description: "Falha ao salvar no banco de dados",
          variant: "destructive",
        });
        return false;
      }
      
    } catch (error) {
      console.error('❌ SALVAMENTO - Erro crítico:', error);
      console.error('❌ SALVAMENTO - Stack trace:', error.stack);
      toast({
        title: "❌ Erro",
        description: "Erro inesperado ao salvar alterações",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editingNotification,
    isLoading,
    editNotification,
    cancelEdit,
    saveEditedNotification,
  };
};
