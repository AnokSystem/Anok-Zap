import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';

interface Disparo {
  id: string;
  campaignName: string;
  instanceName: string;
  recipientCount: number;
  status: 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado';
  createdAt: string;
  messageType: string;
  sentCount?: number;
}

export const useRecentDisparos = (limit: number = 10) => {
  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisparos = async () => {
    try {
      setIsLoading(true);
      
      // Ensure user is authenticated before fetching data
      if (!userContextService.isAuthenticated()) {
        console.log('❌ Usuário não autenticado - negando acesso aos disparos');
        setDisparos([]);
        setError('Usuário não autenticado');
        return;
      }

      const userId = userContextService.getUserId();
      console.log('📨 Buscando disparos para usuário autenticado:', userId);
      
      const data = await nocodbService.getRecentDisparos(limit);
      
      if (data && data.length > 0) {
        console.log('📋 Dados brutos recebidos do NocoDB:', data);
        
        // Apply additional client-side filtering for security
        const userFilteredData = data.filter(item => {
          const recordUserId = item.user_id || item.User_id || item.userId;
          const recordClientId = item['Cliente ID'] || item.client_id || item.Client_id || item.clientId;
          
          // Only show records that belong to the current user
          const belongsToUser = recordUserId === userId || recordClientId === userId;
          
          if (!belongsToUser && (recordUserId || recordClientId)) {
            console.log('🚫 Registro filtrado - não pertence ao usuário:', {
              recordUserId,
              recordClientId,
              currentUserId: userId
            });
          }
          
          return belongsToUser;
        });
        
        const transformedDisparos: Disparo[] = userFilteredData.map((item: any) => {
          console.log('🔍 Processando item completo:', item);
          
          // Mapear usando os nomes exatos dos campos conforme console logs
          const campaignName = item['Nome da Campanha'] || 
                             item.campaign_name || 
                             item.Campaign_name || 
                             item.CampaignName || 
                             item.nome_campanha ||
                             item.campanha ||
                             `Campanha ${item.ID || item.Id || item.id || 'N/A'}`;
          
          const instanceName = item['Nome da Instância'] || 
                              item['ID da Instância'] ||
                              item.instance_name || 
                              item.Instance_name || 
                              item.InstanceName ||
                              item.instance_id || 
                              item.Instance_id ||
                              item.instanceId ||
                              item.instancia ||
                              'Instância não identificada';
          
          const recipientCount = Number(item['Total de Destinatários'] || 
                                       item.recipient_count || 
                                       item.Recipient_count ||
                                       item.RecipientCount ||
                                       item.total_recipients ||
                                       item.destinatarios ||
                                       0);
          
          const sentCount = Number(item['Mensagens Enviadas'] || 
                                  item.sent_count || 
                                  item.Sent_count ||
                                  item.SentCount ||
                                  item.enviados ||
                                  0);
          
          // Mapear status usando o campo correto
          const status = mapStatus(item.Status || item.status || 'pendente');
          
          // Mapear data de criação
          const createdAt = item['Hora de Início'] ||
                           item['Criado em'] ||
                           item.start_time || 
                           item.Start_time ||
                           item.CreatedAt || 
                           item.created_at || 
                           item.Created_at ||
                           item.data_criacao ||
                           new Date().toISOString();
          
          console.log('✅ Dados mapeados:', {
            campaignName,
            instanceName,
            recipientCount,
            sentCount,
            status,
            createdAt
          });
          
          return {
            id: String(item.ID || item.Id || item.id || Math.random()),
            campaignName,
            instanceName,
            recipientCount,
            sentCount,
            status,
            createdAt,
            messageType: item['Tipo de Mensagem'] || item.message_type || item.Message_type || item.tipo_mensagem || 'text'
          };
        });
        
        console.log(`✅ ${transformedDisparos.length} disparos filtrados para usuário ${userId}`);
        setDisparos(transformedDisparos);
        setError(null);
      } else {
        console.log('⚠️ Nenhum disparo encontrado para o usuário');
        setDisparos([]);
        setError(null);
      }
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

  useEffect(() => {
    fetchDisparos();
    
    // Atualizar dados a cada 10 segundos para sincronização mais rápida
    const interval = setInterval(fetchDisparos, 10000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando disparos...');
      fetchDisparos();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [limit]);

  return {
    disparos,
    isLoading,
    error,
    refetch: fetchDisparos
  };
};
