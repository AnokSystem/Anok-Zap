
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
      
      // Validar dados essenciais
      if (!updatedNotificationData.eventType || !updatedNotificationData.instanceId || 
          !updatedNotificationData.userRole || !updatedNotificationData.platform || 
          !updatedNotificationData.profileName) {
        console.error('❌ Dados obrigatórios faltando para salvamento');
        console.error('❌ Dados faltando:', {
          eventType: !updatedNotificationData.eventType,
          instanceId: !updatedNotificationData.instanceId,
          userRole: !updatedNotificationData.userRole,
          platform: !updatedNotificationData.platform,
          profileName: !updatedNotificationData.profileName
        });
        return false;
      }

      // Verificar se há pelo menos uma mensagem válida
      const validMessages = updatedNotificationData.messages?.filter(msg => 
        (msg.content && msg.content.trim() !== '') || msg.fileUrl
      ) || [];

      if (validMessages.length === 0) {
        console.error('❌ Nenhuma mensagem válida encontrada');
        return false;
      }

      // Preparar dados no formato correto para o serviço - CRUCIAL: usar 'instance' para o banco
      const ruleData = {
        eventType: updatedNotificationData.eventType,
        instance: updatedNotificationData.instanceId, // O banco espera 'instance', não 'instanceId'
        userRole: updatedNotificationData.userRole,
        platform: updatedNotificationData.platform,
        profileName: updatedNotificationData.profileName,
        messages: validMessages,
      };

      console.log('📤 Dados formatados para o serviço (com instance):', ruleData);
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
        
        return true;
      } else {
        console.error('❌ Falha no serviço de salvamento');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar notificação editada:', error);
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
