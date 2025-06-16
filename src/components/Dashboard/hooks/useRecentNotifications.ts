
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

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
      console.log('🔔 Buscando TODAS as notificações recentes...');
      
      // Usar o método público correto
      const data = await nocodbService.getRecentNotifications(limit);
      
      if (data && data.length > 0) {
        const transformedNotifications: Notification[] = data.map((item: any) => ({
          id: item.Id || item.id || String(Math.random()),
          eventType: item.event_type || 'unknown',
          platform: item.platform || 'hotmart',
          clientName: item.customer_name || 'Cliente não identificado',
          clientEmail: item.customer_email || 'email@naoidentificado.com',
          value: item.value || 0,
          createdAt: item.event_date || item.CreatedAt || item.created_at || new Date().toISOString(),
          productName: item.product_name || 'Produto não identificado'
        }));
        
        setNotifications(transformedNotifications);
        setError(null);
        console.log(`✅ ${transformedNotifications.length} notificações carregadas`);
      } else {
        console.log('⚠️ Nenhuma notificação encontrada');
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
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    
    // Escutar evento customizado de atualização do dashboard
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
