
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useNotificationDeletion = (setNotifications: React.Dispatch<React.SetStateAction<any[]>>) => {
  const { toast } = useToast();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    notificationId: string | null;
  }>({ isOpen: false, notificationId: null });

  const showDeleteConfirmation = (notificationId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      notificationId
    });
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      notificationId: null
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.notificationId) return;

    try {
      console.log('🗑️ Excluindo notificação:', deleteConfirmation.notificationId);
      
      // Aqui você implementaria a chamada para deletar no NocoDB
      // Por enquanto, vamos apenas remover da lista local
      setNotifications(prev => prev.filter(n => n.ID !== deleteConfirmation.notificationId));
      
      toast({
        title: "Sucesso",
        description: "Notificação excluída com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir notificação",
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
