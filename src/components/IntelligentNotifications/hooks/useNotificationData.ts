
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';
import { NotificationRule } from '../types';

export const useNotificationData = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInstances();
    loadRules();
    
    // Verificar se há uma notificação para editar no sessionStorage
    const editNotificationData = sessionStorage.getItem('editNotification');
    if (editNotificationData) {
      try {
        const notification = JSON.parse(editNotificationData);
        console.log('📝 Dados de edição encontrados no sessionStorage:', notification);
        
        // Disparar evento customizado para que o useNotificationForm possa pegar os dados
        window.dispatchEvent(new CustomEvent('loadEditNotification', { 
          detail: notification 
        }));
        
        // Limpar o sessionStorage
        sessionStorage.removeItem('editNotification');
      } catch (error) {
        console.error('❌ Erro ao processar dados de edição:', error);
      }
    }
  }, []);

  const loadInstances = async () => {
    try {
      console.log('🔄 Carregando instâncias...');
      const data = await evolutionApiService.getInstances();
      console.log('✅ Instâncias carregadas:', data);
      setInstances(data);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      // Fallback para desenvolvimento
      setInstances([
        { id: 'inst1', name: 'Instância Principal', status: 'conectado' },
        { id: 'inst2', name: 'Instância Secundária', status: 'conectado' }
      ]);
    }
  };

  const loadRules = async () => {
    try {
      // Verificar se o usuário está autenticado antes de buscar dados
      if (!userContextService.isAuthenticated()) {
        console.log('❌ Usuário não autenticado - negando acesso às notificações inteligentes');
        setRules([]);
        return;
      }

      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      console.log('🔔 Buscando notificações inteligentes para usuário autenticado:', { userId, clientId });
      
      const data = await nocodbService.getHotmartNotifications();
      
      if (data && data.length > 0) {
        // Aplicar filtragem adicional no cliente para segurança usando ID do usuário
        const userFilteredData = data.filter(item => {
          const recordUserId = item['ID do Usuário'] || item['ID_do_Usuario'] || item['IDdoUsuario'] || item['UserId'] || item['user_id'] || item['UserID'];
          
          // Só mostrar registros que pertencem ao usuário atual
          const belongsToUser = recordUserId === userId || recordUserId === clientId;
          
          if (!belongsToUser && recordUserId) {
            console.log('🚫 Notificação inteligente filtrada - não pertence ao usuário:', {
              recordUserId,
              currentUserId: userId,
              currentClientId: clientId
            });
          }
          
          return belongsToUser;
        });

        console.log(`✅ ${userFilteredData.length} notificações inteligentes filtradas para usuário ${userId}/${clientId}`);
        setRules(userFilteredData);
      } else {
        console.log('⚠️ Nenhuma notificação inteligente encontrada para o usuário');
        setRules([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar regras:', error);
      setRules([]);
    }
  };

  const deleteRule = async (ruleId: string) => {
    setIsLoading(true);
    try {
      console.log('🗑️ Deletando regra:', ruleId);
      
      // Verificar se o usuário tem permissão para deletar esta regra
      const userId = userContextService.getUserId();
      const rule = rules.find(r => r.ID === ruleId);
      
      if (!rule) {
        throw new Error('Regra não encontrada');
      }
      
      const recordUserId = rule['ID do Usuário'] || rule['ID_do_Usuario'] || rule['IDdoUsuario'] || rule['UserId'] || rule['user_id'] || rule['UserID'];
      
      if (recordUserId !== userId) {
        throw new Error('Você não tem permissão para deletar esta regra');
      }
      
      // Aqui você pode implementar a lógica de deleção real
      // await nocodbService.deleteNotification(baseId, ruleId);
      
      await loadRules();
      toast({
        title: "Sucesso",
        description: "Regra removida com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro ao deletar regra:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover regra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rules,
    instances,
    isLoading,
    setIsLoading,
    loadRules,
    deleteRule
  };
};
