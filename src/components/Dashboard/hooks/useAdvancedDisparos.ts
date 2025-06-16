
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

interface DisparoFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  instanceId?: string;
  campaignName?: string;
  searchTerm?: string;
}

interface Disparo {
  id: string;
  campaignName: string;
  instanceName: string;
  recipientCount: number;
  status: 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado';
  createdAt: string;
  messageType: string;
  sentCount?: number;
  errorCount?: number;
}

export const useAdvancedDisparos = () => {
  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [filteredDisparos, setFilteredDisparos] = useState<Disparo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DisparoFilters>({});

  const fetchAllDisparos = async () => {
    try {
      setIsLoading(true);
      console.log('📨 Buscando TODOS os disparos da tabela específica...');
      
      const data = await nocodbService.getAllDisparos();
      
      if (data && data.length > 0) {
        const transformedDisparos: Disparo[] = data.map((item: any) => ({
          id: item.Id || item.id || String(Math.random()),
          campaignName: item.campaign_name || 'Campanha sem nome',
          instanceName: item.instance_name || item.instance_id || 'Instância não identificada',
          recipientCount: item.recipient_count || item.sent_count || 0,
          status: mapStatus(item.status),
          createdAt: item.start_time || item.CreatedAt || item.created_at || new Date().toISOString(),
          messageType: item.message_type || 'text',
          sentCount: item.sent_count || 0,
          errorCount: item.error_count || 0
        }));
        
        setDisparos(transformedDisparos);
        console.log(`✅ ${transformedDisparos.length} disparos carregados da tabela específica`);
      } else {
        console.log('⚠️ Nenhum disparo encontrado na tabela específica');
        setDisparos([]);
      }
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar disparos:', err);
      setError('Erro ao carregar disparos');
      setDisparos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const mapStatus = (status: string): 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado' => {
    switch (status) {
      case 'concluido':
      case 'finalizado':
      case 'completed':
        return 'concluido';
      case 'iniciado':
      case 'enviando':
      case 'sending':
        return 'enviando';
      case 'erro':
      case 'falha':
      case 'error':
        return 'erro';
      case 'cancelado':
      case 'cancelled':
        return 'cancelado';
      case 'enviado':
      case 'sent':
        return 'enviado';
      default:
        return 'pendente';
    }
  };

  const applyFilters = (filtersToApply: DisparoFilters) => {
    let filtered = [...disparos];

    if (filtersToApply.dateFrom) {
      filtered = filtered.filter(d => 
        new Date(d.createdAt) >= new Date(filtersToApply.dateFrom!)
      );
    }

    if (filtersToApply.dateTo) {
      filtered = filtered.filter(d => 
        new Date(d.createdAt) <= new Date(filtersToApply.dateTo!)
      );
    }

    if (filtersToApply.status) {
      filtered = filtered.filter(d => 
        d.status.toLowerCase().includes(filtersToApply.status!.toLowerCase())
      );
    }

    if (filtersToApply.instanceId) {
      filtered = filtered.filter(d => 
        d.instanceName.toLowerCase().includes(filtersToApply.instanceId!.toLowerCase())
      );
    }

    if (filtersToApply.campaignName) {
      filtered = filtered.filter(d => 
        d.campaignName.toLowerCase().includes(filtersToApply.campaignName!.toLowerCase())
      );
    }

    if (filtersToApply.searchTerm) {
      const searchLower = filtersToApply.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.campaignName.toLowerCase().includes(searchLower) ||
        d.instanceName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDisparos(filtered);
    console.log(`🔍 ${filtered.length} disparos após aplicar filtros`);
  };

  const updateFilters = (newFilters: DisparoFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredDisparos(disparos);
  };

  useEffect(() => {
    fetchAllDisparos();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchAllDisparos, 30000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando disparos...');
      fetchAllDisparos();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, []);

  useEffect(() => {
    applyFilters(filters);
  }, [disparos]);

  return {
    disparos: filteredDisparos.length > 0 ? filteredDisparos : disparos,
    allDisparos: disparos,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchAllDisparos,
    hasFilters: Object.keys(filters).some(key => filters[key as keyof DisparoFilters])
  };
};
