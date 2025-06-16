
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
        console.log('📋 Dados brutos recebidos do NocoDB (todos):', data);
        
        const transformedDisparos: Disparo[] = data.map((item: any) => {
          console.log('🔍 Processando item completo:', item);
          
          // Mapear todos os possíveis campos para campanha
          const campaignName = item.campaign_name || 
                             item.Campaign_name || 
                             item.CampaignName || 
                             item.nome_campanha ||
                             item.campanha ||
                             `Campanha ${item.Id || item.id || 'N/A'}`;
          
          // Mapear todos os possíveis campos para instância
          const instanceName = item.instance_name || 
                              item.Instance_name || 
                              item.InstanceName ||
                              item.instance_id || 
                              item.Instance_id ||
                              item.instanceId ||
                              item.instancia ||
                              'Instância não identificada';
          
          // Mapear todos os possíveis campos para contagem de destinatários
          const recipientCount = Number(item.recipient_count || 
                                       item.Recipient_count ||
                                       item.RecipientCount ||
                                       item.total_recipients ||
                                       item.destinatarios ||
                                       item.sent_count ||
                                       item.Sent_count ||
                                       0);
          
          // Mapear todos os possíveis campos para contagem enviados
          const sentCount = Number(item.sent_count || 
                                  item.Sent_count ||
                                  item.SentCount ||
                                  item.enviados ||
                                  item.recipient_count ||
                                  0);
          
          // Mapear todos os possíveis campos para contagem de erros
          const errorCount = Number(item.error_count || 
                                   item.Error_count ||
                                   item.ErrorCount ||
                                   item.erros ||
                                   0);
          
          return {
            id: String(item.Id || item.id || Math.random()),
            campaignName,
            instanceName,
            recipientCount,
            sentCount,
            errorCount,
            status: mapStatus(item.status || item.Status || 'pendente'),
            createdAt: item.start_time || 
                      item.Start_time ||
                      item.CreatedAt || 
                      item.created_at || 
                      item.Created_at ||
                      item.data_criacao ||
                      new Date().toISOString(),
            messageType: item.message_type || item.Message_type || item.tipo_mensagem || 'text'
          };
        });
        
        console.log('✅ Todos os disparos transformados:', transformedDisparos);
        setDisparos(transformedDisparos);
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
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'concluido':
      case 'finalizado':
      case 'completed':
      case 'complete':
        return 'concluido';
      case 'iniciado':
      case 'enviando':
      case 'sending':
      case 'em_andamento':
        return 'enviando';
      case 'erro':
      case 'falha':
      case 'error':
      case 'failed':
        return 'erro';
      case 'cancelado':
      case 'cancelled':
      case 'canceled':
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
    
    // Atualizar dados a cada 15 segundos
    const interval = setInterval(fetchAllDisparos, 15000);
    
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
