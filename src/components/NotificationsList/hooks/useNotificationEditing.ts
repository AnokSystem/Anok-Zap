
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
      console.log('💾 Salvando notificação editada no NocoDB...');
      console.log('📋 Dados originais da notificação:', editingNotification);
      console.log('📋 Dados atualizados recebidos:', updatedNotificationData);
      
      // Usar o serviço de salvamento com o ID da notificação para edição
      const editingRule = {
        ID: editingNotification.ID,
        id: editingNotification.ID
      };

      // Chamar o serviço de salvamento que já trata edições
      const result = await notificationSaveService.saveNotification(
        updatedNotificationData, 
        editingRule
      );

      if (result.success) {
        console.log('✅ Notificação atualizada com sucesso no NocoDB');
        
        // Atualizar a notificação na lista local
        setNotifications(prev => 
          prev.map(n => 
            n.ID === editingNotification.ID 
              ? {
                  ...n,
                  'Tipo de Evento': updatedNotificationData.eventType,
                  'Plataforma': updatedNotificationData.platform,
                  'Perfil Hotmart': updatedNotificationData.profileName,
                  'ID da Instância': updatedNotificationData.instanceId,
                  'Papel do Usuário': updatedNotificationData.userRole,
                  'Contagem de Mensagens': updatedNotificationData.messages?.length || 0,
                  'Dados Completos (JSON)': JSON.stringify({
                    ...updatedNotificationData,
                    timestamp: new Date().toISOString(),
                    saved_timestamp: new Date().toISOString(),
                    ruleId: editingNotification.ID
                  }, null, 2)
                }
              : n
          )
        );
        
        // Fechar o modo de edição
        setEditingNotification(null);
        
        toast({
          title: "✅ Sucesso",
          description: "Notificação atualizada com sucesso no banco de dados!",
        });
        
        // Recarregar as notificações para garantir que temos os dados mais recentes
        await loadNotifications();
        
        return true;
      } else {
        throw new Error('Falha no serviço de salvamento');
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar notificação editada:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao salvar as alterações no banco de dados",
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
