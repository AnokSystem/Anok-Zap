
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
        console.log('📈 Buscando dados reais do gráfico de disparos...');
        
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
        console.log('📊 Buscando dados reais do gráfico de notificações...');
        
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

    fetchData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [days]);

  return { data, isLoading, error };
};
