
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

  return {
    notifications,
    setNotifications,
    isLoading,
    lastSync,
    syncStatus,
    loadNotifications,
  };
};
