
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
      console.log('📊 Buscando estatísticas do dashboard...');
      
      // Simular dados por enquanto até que as tabelas sejam criadas no NocoDB
      const mockStats: DashboardStats = {
        totalDisparos: 1247,
        totalNotifications: 89,
        successRate: 97.5,
        uniqueContacts: 456,
        disparosToday: 23,
        notificationsToday: 8
      };

      // TODO: Implementar busca real dos dados do NocoDB
      // const baseId = nocodbService.getTargetBaseId();
      // if (baseId) {
      //   const [disparosData, notificationsData] = await Promise.all([
      //     fetchDisparosStats(baseId),
      //     fetchNotificationsStats(baseId)
      //   ]);
      //   
      //   setStats(calculateStats(disparosData, notificationsData));
      // } else {
      //   setStats(mockStats);
      // }

      setStats(mockStats);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
      
      // Fallback para dados mock em caso de erro
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
