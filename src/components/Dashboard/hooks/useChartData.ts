
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

export const useDisparosChartData = (days: number = 7) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📈 Iniciando busca de dados REAIS de disparos dos últimos', days, 'dias...');
      
      const chartData = await nocodbService.getDisparosChartData(days);
      
      if (chartData && chartData.length > 0) {
        console.log('✅ Dados do gráfico de disparos recebidos:', chartData);
        
        // Verificar se há dados reais (não apenas zeros)
        const hasRealData = chartData.some(item => item.disparos > 0 || item.sucesso > 0);
        
        if (hasRealData) {
          setData(chartData);
          console.log('✅ Dados reais encontrados e definidos no gráfico!');
        } else {
          console.log('⚠️ Apenas dados zerados encontrados, mas exibindo mesmo assim');
          setData(chartData);
        }
      } else {
        console.log('⚠️ Nenhum dado encontrado, criando estrutura vazia');
        // Criar estrutura de dados vazia para os últimos dias
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
    } catch (err) {
      console.error('❌ Erro ao buscar dados do gráfico de disparos:', err);
      setError('Erro ao carregar dados do gráfico');
      
      // Criar dados vazios em caso de erro
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar dados a cada 10 segundos para ver mudanças mais rapidamente
    const interval = setInterval(fetchData, 10 * 1000);
    
    // Escutar evento de refresh do dashboard
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
