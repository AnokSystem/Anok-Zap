
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { notificationSaveService } from '@/components/IntelligentNotifications/services/notificationSaveService';
import { Notification, SyncStatus } from './types';

export const useNotifications = (autoOpenNotification?: any) => {
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

  // Efeito para abrir automaticamente uma notificação se especificada
  useEffect(() => {
    if (autoOpenNotification && notifications.length > 0) {
      console.log('🔍 Procurando notificação para abrir automaticamente:', autoOpenNotification);
      
      // Tentar encontrar a notificação correspondente pelo ID
      const matchingNotification = notifications.find(n => 
        n.ID === autoOpenNotification.ID || 
        n.ID === autoOpenNotification.id
      );
      
      if (matchingNotification) {
        console.log('✅ Notificação encontrada, abrindo automaticamente:', matchingNotification);
        setSelectedNotification(matchingNotification);
      } else {
        console.log('⚠️ Notificação não encontrada na lista atual');
      }
    }
  }, [autoOpenNotification, notifications]);

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
