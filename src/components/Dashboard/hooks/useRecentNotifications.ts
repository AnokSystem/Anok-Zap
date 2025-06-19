
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';

interface Notification {
  id: string;
  eventType: string;
  platform: string;
  clientName: string;
  clientEmail: string;
  value?: number;
  createdAt: string;
  productName?: string;
}

export const useRecentNotifications = (limit: number = 10) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Ensure user is authenticated before fetching data
      if (!userContextService.isAuthenticated()) {
        console.log('❌ Usuário não autenticado - negando acesso às notificações');
        setNotifications([]);
        setError('Usuário não autenticado');
        return;
      }

      const userId = userContextService.getUserId();
      console.log('🔔 Buscando notificações para usuário autenticado:', userId);
      
      const data = await nocodbService.getRecentNotifications(limit);
      
      if (data && data.length > 0) {
        // Apply additional client-side filtering for security
        const userFilteredData = data.filter(item => {
          const recordUserId = item.user_id || item.User_id || item.userId;
          const recordClientId = item.client_id || item.Client_id || item.clientId;
          
          // Only show records that belong to the current user
          const belongsToUser = recordUserId === userId || recordClientId === userId;
          
          if (!belongsToUser && (recordUserId || recordClientId)) {
            console.log('🚫 Notificação filtrada - não pertence ao usuário:', {
              recordUserId,
              recordClientId,
              currentUserId: userId
            });
          }
          
          return belongsToUser;
        });

        const transformedNotifications: Notification[] = userFilteredData.map((item: any) => ({
          id: item.Id || item.id || String(Math.random()),
          eventType: item.event_type || 'unknown',
          platform: item.platform || 'hotmart',
          clientName: item.customer_name || 'Cliente não identificado',
          clientEmail: item.customer_email || 'email@naoidentificado.com',
          value: item.value || 0,
          createdAt: item.event_date || item.CreatedAt || item.created_at || new Date().toISOString(),
          productName: item.product_name || 'Produto não identificado'
        }));
        
        console.log(`✅ ${transformedNotifications.length} notificações filtradas para usuário ${userId}`);
        setNotifications(transformedNotifications);
        setError(null);
      } else {
        console.log('⚠️ Nenhuma notificação encontrada para o usuário');
        setNotifications([]);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar notificações:', err);
      setError('Erro ao carregar notificações');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando notificações...');
      fetchNotifications();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [limit]);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications
  };
};
