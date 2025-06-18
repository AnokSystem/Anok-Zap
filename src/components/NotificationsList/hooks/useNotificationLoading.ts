
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { Notification, SyncStatus } from '../types';

export const useNotificationLoading = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setSyncStatus('loading');
    
    try {
      console.log('📡 Carregando notificações do NocoDB...');
      
      // Verificar se o usuário está autenticado
      const savedUser = localStorage.getItem('currentUser');
      if (!savedUser) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }
      
      const user = JSON.parse(savedUser);
      console.log('👤 Usuário autenticado:', user.ID);
      
      // Primeiro testar a conexão
      const connectionTest = await nocodbService.testConnection();
      console.log('🔌 Teste de conexão:', connectionTest);
      
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Falha na conexão');
      }
      
      const data = await nocodbService.getHotmartNotifications();
      
      console.log('📋 Dados recebidos do NocoDB:', data);
      console.log(`📊 Total de notificações encontradas: ${data.length}`);
      
      // Log das notificações encontradas para debug
      data.forEach((notification, index) => {
        console.log(`📌 Notificação ${index + 1}:`, {
          ID: notification.ID,
          'Tipo de Evento': notification['Tipo de Evento'],
          'ID do Usuário': notification['ID do Usuário'],
          'Perfil Hotmart': notification['Perfil Hotmart']
        });
      });
      
      // Ordenar notificações por data de criação (mais recentes primeiro)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.CreatedAt || a.created_at || 0);
        const dateB = new Date(b.CreatedAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime(); // Ordem decrescente (mais recente primeiro)
      });
      
      console.log('📅 Notificações ordenadas por data (mais recentes primeiro)');
      
      setNotifications(sortedData);
      setLastSync(new Date());
      setSyncStatus('success');
      
      toast({
        title: "Sucesso",
        description: `${sortedData.length} notificações carregadas do NocoDB`,
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

  return {
    notifications,
    setNotifications,
    isLoading,
    lastSync,
    syncStatus,
    loadNotifications,
  };
};
