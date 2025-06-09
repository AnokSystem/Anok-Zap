
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { Notification } from '../types';

interface DeleteConfirmation {
  isOpen: boolean;
  notificationId: string | null;
}

export const useNotificationDeletion = (
  setNotifications: (updater: (prev: Notification[]) => Notification[]) => void
) => {
  const { toast } = useToast();
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    notificationId: null,
  });

  const showDeleteConfirmation = (notificationId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      notificationId,
    });
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      notificationId: null,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.notificationId) return;

    try {
      console.log('🗑️ Deletando notificação:', deleteConfirmation.notificationId);
      
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) {
        throw new Error('Base do NocoDB não encontrada');
      }

      // Usar o novo método de exclusão que verifica o usuário
      const success = await nocodbService.notificationService.deleteNotification(
        targetBaseId, 
        deleteConfirmation.notificationId
      );

      if (success) {
        // Remover da lista local
        setNotifications(prev => 
          prev.filter(notification => 
            (notification.ID || notification.id) !== deleteConfirmation.notificationId
          )
        );

        toast({
          title: "Sucesso",
          description: "Notificação excluída com sucesso",
        });
      } else {
        throw new Error('Falha na exclusão ou acesso negado');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir notificação",
        variant: "destructive",
      });
    } finally {
      hideDeleteConfirmation();
    }
  };

  return {
    deleteConfirmation,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDelete,
  };
};
