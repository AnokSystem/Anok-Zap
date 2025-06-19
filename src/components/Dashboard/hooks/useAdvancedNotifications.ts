import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';

interface NotificationFilters {
  dateFrom?: string;
  dateTo?: string;
  eventType?: string;
  platform?: string;
  status?: string;
  searchTerm?: string;
}

interface Notification {
  id: string;
  eventType: string;
  platform: string;
  clientName: string;
  clientEmail: string;
  value?: number;
  createdAt: string;
  productName?: string;
  status?: string;
  transactionId?: string;
}

export const useAdvancedNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({});

  const fetchAllNotifications = async () => {
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
      console.log('🔔 Buscando TODAS as notificações para usuário autenticado:', userId);
      
      const data = await nocodbService.getAllNotifications();
      
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
          value: parseFloat(item.value) || 0,
          createdAt: item.event_date || item.CreatedAt || item.created_at || new Date().toISOString(),
          productName: item.product_name || 'Produto não identificado',
          status: item.status || 'approved',
          transactionId: item.transaction_id || ''
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

  const applyFilters = (filtersToApply: NotificationFilters) => {
    let filtered = [...notifications];

    if (filtersToApply.dateFrom) {
      filtered = filtered.filter(n => 
        new Date(n.createdAt) >= new Date(filtersToApply.dateFrom!)
      );
    }

    if (filtersToApply.dateTo) {
      filtered = filtered.filter(n => 
        new Date(n.createdAt) <= new Date(filtersToApply.dateTo!)
      );
    }

    if (filtersToApply.eventType) {
      filtered = filtered.filter(n => 
        n.eventType.toLowerCase().includes(filtersToApply.eventType!.toLowerCase())
      );
    }

    if (filtersToApply.platform) {
      filtered = filtered.filter(n => 
        n.platform.toLowerCase().includes(filtersToApply.platform!.toLowerCase())
      );
    }

    if (filtersToApply.status) {
      filtered = filtered.filter(n => 
        n.status?.toLowerCase().includes(filtersToApply.status!.toLowerCase())
      );
    }

    if (filtersToApply.searchTerm) {
      const searchLower = filtersToApply.searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.clientName.toLowerCase().includes(searchLower) ||
        n.clientEmail.toLowerCase().includes(searchLower) ||
        n.productName?.toLowerCase().includes(searchLower) ||
        n.transactionId?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredNotifications(filtered);
    console.log(`🔍 ${filtered.length} notificações após aplicar filtros`);
  };

  const updateFilters = (newFilters: NotificationFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredNotifications(notifications);
  };

  useEffect(() => {
    fetchAllNotifications();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchAllNotifications, 30000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando notificações...');
      fetchAllNotifications();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, []);

  useEffect(() => {
    applyFilters(filters);
  }, [notifications]);

  return {
    notifications: filteredNotifications.length > 0 ? filteredNotifications : notifications,
    allNotifications: notifications,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchAllNotifications,
    hasFilters: Object.keys(filters).some(key => filters[key as keyof NotificationFilters])
  };
};
