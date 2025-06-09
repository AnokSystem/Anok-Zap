
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
      
      // Preparar dados para salvamento garantindo que temos o ID correto
      const dataToSave = {
        eventType: updatedNotificationData.eventType,
        instanceId: updatedNotificationData.instanceId,
        userRole: updatedNotificationData.userRole,
        platform: updatedNotificationData.platform,
        profileName: updatedNotificationData.profileName,
        messages: updatedNotificationData.messages || [],
        ruleId: editingNotification.ID // ID da notificação para edição
      };

      console.log('📤 Dados formatados para salvamento:', dataToSave);

      // Usar o serviço de salvamento passando o editingRule corretamente
      const result = await notificationSaveService.saveNotification(
        dataToSave, 
        editingNotification // Passar a notificação completa como editingRule
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
        description: "Falha ao salvar as alterações. Tente novamente.",
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
