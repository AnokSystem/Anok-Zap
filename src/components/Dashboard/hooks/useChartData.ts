
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

export const useDisparosChartData = (days: number = 7) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('📈 Buscando dados do gráfico de disparos...');
        
        // Usar o método correto do dashboardService
        const chartData = await nocodbService.dashboardService.getDisparosChartData(nocodbService.getDefaultBaseId(), days);
        
        if (chartData && chartData.length > 0) {
          setData(chartData);
          console.log('✅ Dados do gráfico de disparos carregados:', chartData);
        } else {
          // Fallback para dados mock
          console.log('⚠️ Usando dados mock para gráfico de disparos');
          const mockData = [
            { date: '01/01', disparos: 120, sucesso: 115 },
            { date: '02/01', disparos: 150, sucesso: 145 },
            { date: '03/01', disparos: 180, sucesso: 175 },
            { date: '04/01', disparos: 220, sucesso: 210 },
            { date: '05/01', disparos: 160, sucesso: 155 },
            { date: '06/01', disparos: 190, sucesso: 185 },
            { date: '07/01', disparos: 240, sucesso: 235 }
          ];
          setData(mockData);
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

    fetchData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [days]);

  return { data, isLoading, error };
};

export const useNotificationsChartData = (days: number = 7) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('📊 Buscando dados do gráfico de notificações...');
        
        // Usar o método correto do dashboardService
        const chartData = await nocodbService.dashboardService.getNotificationsChartData(nocodbService.getDefaultBaseId(), days);
        
        if (chartData && chartData.length > 0) {
          setData(chartData);
          console.log('✅ Dados do gráfico de notificações carregados:', chartData);
        } else {
          // Fallback para dados mock
          console.log('⚠️ Usando dados mock para gráfico de notificações');
          const mockData = [
            { date: '01/01', hotmart: 15, eduzz: 8, monetizze: 3 },
            { date: '02/01', hotmart: 22, eduzz: 12, monetizze: 5 },
            { date: '03/01', hotmart: 18, eduzz: 15, monetizze: 7 },
            { date: '04/01', hotmart: 28, eduzz: 10, monetizze: 4 },
            { date: '05/01', hotmart: 20, eduzz: 18, monetizze: 6 },
            { date: '06/01', hotmart: 25, eduzz: 14, monetizze: 8 },
            { date: '07/01', hotmart: 30, eduzz: 16, monetizze: 5 }
          ];
          setData(mockData);
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

    fetchData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [days]);

  return { data, isLoading, error };
};
