
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

export const useDisparosChartData = (days: number = 7) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('📈 Buscando dados reais do gráfico de disparos...');
      
      const baseId = nocodbService.getTargetBaseId();
      if (!baseId) {
        console.error('❌ Base ID não encontrado');
        setError('Base ID não configurado');
        return;
      }
      
      const chartData = await nocodbService.getDisparosChartData(days);
      
      if (chartData && chartData.length > 0) {
        console.log('✅ Dados do gráfico recebidos:', chartData);
        setData(chartData);
      } else {
        console.log('⚠️ Nenhum dado encontrado, criando dados vazios');
        // Criar estrutura de dados vazia para os últimos 7 dias
        const emptyData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          emptyData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            disparos: 0,
            sucesso: 0
          });
        }
        setData(emptyData);
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
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30 * 1000);
    
    // Escutar evento de refresh do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando gráfico...');
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
      console.log('📊 Buscando dados reais do gráfico de notificações...');
      
      const baseId = nocodbService.getTargetBaseId();
      if (!baseId) {
        console.error('❌ Base ID não encontrado');
        setError('Base ID não configurado');
        return;
      }
      
      const chartData = await nocodbService.getNotificationsChartData(days);
      
      if (chartData && chartData.length > 0) {
        setData(chartData);
        console.log('✅ Dados reais do gráfico de notificações carregados:', chartData);
      } else {
        console.log('⚠️ Nenhum dado de notificação encontrado');
        // Criar dados de exemplo para demonstração se não há dados reais
        const exampleData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          exampleData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            hotmart: 0,
            eduzz: 0,
            monetizze: 0
          });
        }
        setData(exampleData);
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
    
    // Atualizar dados a cada 30 segundos para sincronização em tempo real
    const interval = setInterval(fetchData, 30 * 1000);
    
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
