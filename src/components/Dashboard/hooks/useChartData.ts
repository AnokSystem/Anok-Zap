
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

export const useDisparosChartData = (days: number = 7) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('📈 Buscando TODOS os dados reais do gráfico de disparos...');
      
      const chartData = await nocodbService.getDisparosChartData(days);
      
      if (chartData && chartData.length > 0) {
        setData(chartData);
        console.log('✅ Dados reais do gráfico de disparos carregados:', chartData);
      } else {
        console.log('⚠️ Nenhum dado de disparo encontrado no NocoDB');
        setData([]);
      }
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados do gráfico:', err);
      setError('Erro ao carregar dados do gráfico');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar dados a cada 2 minutos
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando gráfico de disparos...');
      fetchData();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [days]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useNotificationsChartData = (days: number = 7) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Buscando TODOS os dados reais do gráfico de notificações...');
      
      const chartData = await nocodbService.getNotificationsChartData(days);
      
      if (chartData && chartData.length > 0) {
        setData(chartData);
        console.log('✅ Dados reais do gráfico de notificações carregados:', chartData);
      } else {
        console.log('⚠️ Nenhum dado de notificação encontrado no NocoDB');
        setData([]);
      }
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados do gráfico:', err);
      setError('Erro ao carregar dados do gráfico');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar dados a cada 2 minutos
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando gráfico de notificações...');
      fetchData();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [days]);

  return { data, isLoading, error, refetch: fetchData };
};
