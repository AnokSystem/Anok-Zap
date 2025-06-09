
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { Notification, SyncStatus } from './types';

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    notificationId: string | null;
  }>({ isOpen: false, notificationId: null });

  const loadNotifications = async () => {
    setIsLoading(true);
    setSyncStatus('loading');
    
    try {
      console.log('📡 Carregando notificações do NocoDB...');
      
      // Primeiro testar a conexão
      const connectionTest = await nocodbService.testConnection();
      console.log('🔌 Teste de conexão:', connectionTest);
      
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Falha na conexão');
      }
      
      const data = await nocodbService.getHotmartNotifications();
      
      console.log('📋 Dados recebidos:', data);
      console.log(`📊 Total de notificações: ${data.length}`);
      
      setNotifications(data);
      setLastSync(new Date());
      setSyncStatus('success');
      
      toast({
        title: "Sucesso",
        description: `${data.length} notificações carregadas do NocoDB`,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      setSyncStatus('error');
      toast({
        title: "Erro",
        description: `Falha ao carregar notificações: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const closeNotificationDetails = () => {
    setSelectedNotification(null);
  };

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

  const saveEditedNotification = async (updatedNotification: any) => {
    try {
      console.log('💾 Salvando notificação editada:', updatedNotification);
      
      // Aqui você implementaria a chamada para atualizar no NocoDB
      // Por enquanto, vamos apenas atualizar na lista local
      setNotifications(prev => 
        prev.map(n => 
          n.ID === editingNotification?.ID 
            ? { ...n, ...updatedNotification }
            : n
        )
      );
      
      setEditingNotification(null);
      
      toast({
        title: "Sucesso",
        description: "Notificação atualizada com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar notificação:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar as alterações",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    console.log('🚀 NotificationsList montado, carregando notificações...');
    loadNotifications();

    // Escutar evento de refresh
    const handleRefresh = () => {
      console.log('🔄 Evento de refresh recebido');
      loadNotifications();
    };

    window.addEventListener('refreshNotifications', handleRefresh);
    return () => window.removeEventListener('refreshNotifications', handleRefresh);
  }, []);

  return {
    notifications,
    isLoading,
    selectedNotification,
    editingNotification,
    lastSync,
    syncStatus,
    deleteConfirmation,
    loadNotifications,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDelete,
    viewNotificationDetails,
    closeNotificationDetails,
    editNotification,
    cancelEdit,
    saveEditedNotification,
  };
};
