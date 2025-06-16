
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

interface DashboardStats {
  totalDisparos: number;
  totalNotifications: number;
  successRate: number;
  uniqueContacts: number;
  disparosToday: number;
  notificationsToday: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Buscando estatísticas reais do dashboard...');
      
      const data = await nocodbService.getDashboardStats();
      
      if (data) {
        const transformedStats: DashboardStats = {
          totalDisparos: data.total_disparos || 0,
          totalNotifications: data.total_notifications || 0,
          successRate: data.success_rate || 0,
          uniqueContacts: data.unique_contacts || 0,
          disparosToday: data.disparos_today || 0,
          notificationsToday: data.notifications_today || 0
        };
        
        setStats(transformedStats);
        setError(null);
        console.log('✅ Estatísticas reais carregadas:', transformedStats);
      } else {
        console.log('⚠️ Nenhuma estatística encontrada no NocoDB');
        setStats({
          totalDisparos: 0,
          totalNotifications: 0,
          successRate: 0,
          uniqueContacts: 0,
          disparosToday: 0,
          notificationsToday: 0
        });
        setError(null);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
      setStats({
        totalDisparos: 0,
        totalNotifications: 0,
        successRate: 0,
        uniqueContacts: 0,
        disparosToday: 0,
        notificationsToday: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};
