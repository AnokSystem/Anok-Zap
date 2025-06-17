
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

interface DashboardStats {
  total_disparos: number;
  total_notifications: number;
  success_rate: number;
  unique_contacts: number;
  disparos_today: number;
  notifications_today: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_disparos: 0,
    total_notifications: 0,
    success_rate: 0,
    unique_contacts: 0,
    disparos_today: 0,
    notifications_today: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📊 Buscando estatísticas do dashboard usando dados reais...');
      
      const data = await nocodbService.getDashboardStats();
      
      if (data) {
        setStats({
          total_disparos: data.total_disparos || 0,
          total_notifications: data.total_notifications || 0,
          success_rate: data.success_rate || 0,
          unique_contacts: data.unique_contacts || 0,
          disparos_today: data.disparos_today || 0,
          notifications_today: data.notifications_today || 0
        });
        console.log('✅ Estatísticas carregadas com sucesso:', data);
      } else {
        console.log('⚠️ Nenhuma estatística retornada do serviço');
        setError('Nenhum dado disponível');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Atualizar automaticamente a cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando estatísticas...');
      fetchStats();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};
