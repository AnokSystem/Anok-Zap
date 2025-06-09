
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
      console.log('💾 Salvando notificação editada...');
      console.log('📋 Dados originais da notificação:', editingNotification);
      console.log('📋 Dados atualizados recebidos:', updatedNotificationData);
      
      // Validar dados antes de enviar
      if (!updatedNotificationData.eventType || !updatedNotificationData.instanceId || 
          !updatedNotificationData.userRole || !updatedNotificationData.platform || 
          !updatedNotificationData.profileName) {
        console.error('❌ Dados obrigatórios faltando para salvamento');
        toast({
          title: "❌ Erro",
          description: "Preencha todos os campos obrigatórios antes de salvar.",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se há pelo menos uma mensagem válida
      const validMessages = updatedNotificationData.messages?.filter(msg => 
        msg.content.trim() !== '' || msg.fileUrl
      ) || [];

      if (validMessages.length === 0) {
        console.error('❌ Nenhuma mensagem válida encontrada');
        toast({
          title: "❌ Erro",
          description: "Adicione pelo menos uma mensagem com conteúdo válido.",
          variant: "destructive",
        });
        return false;
      }

      // Preparar dados no formato correto para o serviço
      const ruleData = {
        eventType: updatedNotificationData.eventType,
        instanceId: updatedNotificationData.instanceId,
        userRole: updatedNotificationData.userRole,
        platform: updatedNotificationData.platform,
        profileName: updatedNotificationData.profileName,
        messages: validMessages,
      };

      console.log('📤 Dados formatados para o serviço:', ruleData);
      console.log('🔑 ID da notificação para edição:', editingNotification.ID);

      // Usar o serviço de salvamento com o editingRule contendo o ID
      const result = await notificationSaveService.saveNotification(
        ruleData,
        { ID: editingNotification.ID, id: editingNotification.ID }
      );

      if (result.success) {
        console.log('✅ Notificação atualizada com sucesso no banco');
        
        // Recarregar as notificações do banco para garantir sincronização
        await loadNotifications();
        
        // Fechar o modo de edição
        setEditingNotification(null);
        
        toast({
          title: "✅ Sucesso",
          description: "Notificação atualizada com sucesso!",
        });
        
        return true;
      } else {
        throw new Error('Falha no serviço de salvamento');
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar notificação editada:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao salvar as alterações. Verifique os dados e tente novamente.",
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
