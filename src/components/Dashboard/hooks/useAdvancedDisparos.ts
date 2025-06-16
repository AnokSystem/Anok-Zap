
import { useState, useEffect } from 'react';
import { Disparo, DisparoFilters } from './useAdvancedDisparos/types';
import { applyDisparoFilters } from './useAdvancedDisparos/filterService';
import { fetchAllDisparos } from './useAdvancedDisparos/dataFetcher';

export const useAdvancedDisparos = () => {
  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [filteredDisparos, setFilteredDisparos] = useState<Disparo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DisparoFilters>({});

  const loadDisparos = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllDisparos();
      setDisparos(data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar disparos:', err);
      setError('Erro ao carregar disparos');
      setDisparos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: DisparoFilters) => {
    setFilters(newFilters);
    const filtered = applyDisparoFilters(disparos, newFilters);
    setFilteredDisparos(filtered);
    console.log(`🔍 ${filtered.length} disparos após aplicar filtros`);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredDisparos(disparos);
  };

  useEffect(() => {
    loadDisparos();
    
    // Atualizar dados a cada 10 segundos
    const interval = setInterval(loadDisparos, 10000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando disparos...');
      loadDisparos();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, []);

  useEffect(() => {
    const filtered = applyDisparoFilters(disparos, filters);
    setFilteredDisparos(filtered);
  }, [disparos, filters]);

  return {
    disparos: filteredDisparos.length > 0 ? filteredDisparos : disparos,
    allDisparos: disparos,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: loadDisparos,
    hasFilters: Object.keys(filters).some(key => filters[key as keyof DisparoFilters])
  };
};

// Re-export types for backward compatibility
export type { Disparo, DisparoFilters } from './useAdvancedDisparos/types';
