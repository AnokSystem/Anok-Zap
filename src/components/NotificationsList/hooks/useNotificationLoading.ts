
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';
import { Notification, SyncStatus } from '../types';

export const useNotificationLoading = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(null);

  // CORREÇÃO: Função para extrair userId do JSON de forma mais robusta
  const extractUserIdFromRecord = (item: any): string | null => {
    console.log('🔍 NOTIF-EXTRAÇÃO - Analisando item:', item);
    
    // Primeiro tentar campos diretos comuns
    const directFields = [
      item['ID do Usuário'],
      item['ID_do_Usuario'],
      item['IDdoUsuario'],
      item['UserId'],
      item['user_id'],
      item['UserID'],
      item['userId']
    ];

    for (const field of directFields) {
      if (field && field !== 'undefined' && field !== null) {
        console.log('✅ NOTIF-EXTRAÇÃO - UserId encontrado em campo direto:', field);
        return String(field);
      }
    }

    // Se não encontrou nos campos diretos, tentar extrair do JSON
    const jsonField = item['Dados Completos (JSON)'];
    if (jsonField) {
      try {
        console.log('🔍 NOTIF-EXTRAÇÃO - Tentando extrair do JSON:', jsonField);
        const jsonData = JSON.parse(jsonField);
        console.log('📋 NOTIF-EXTRAÇÃO - Dados do JSON parseados:', jsonData);
        
        if (jsonData.userId) {
          console.log('✅ NOTIF-EXTRAÇÃO - UserId encontrado no JSON:', jsonData.userId);
          return String(jsonData.userId);
        }
        
        if (jsonData.user_id) {
          console.log('✅ NOTIF-EXTRAÇÃO - user_id encontrado no JSON:', jsonData.user_id);
          return String(jsonData.user_id);
        }
        
      } catch (e) {
        console.error('❌ NOTIF-EXTRAÇÃO - Erro ao fazer parse do JSON:', e);
      }
    }

    console.log('❌ NOTIF-EXTRAÇÃO - UserId não encontrado');
    return null;
  };

  const loadNotifications = async () => {
    setIsLoading(true);
    setSyncStatus('loading');
    
    try {
      console.log('📡 Carregando notificações do NocoDB...');
      
      // Verificar se o usuário está autenticado
      if (!userContextService.isAuthenticated()) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }
      
      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      console.log('👤 Usuário autenticado:', { userId, clientId });
      
      // Primeiro testar a conexão
      const connectionTest = await nocodbService.testConnection();
      console.log('🔌 Teste de conexão:', connectionTest);
      
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Falha na conexão');
      }
      
      const data = await nocodbService.getHotmartNotifications();
      
      console.log('📋 Dados recebidos do NocoDB:', data);
      console.log(`📊 Total de notificações encontradas: ${data.length}`);
      
      // CORREÇÃO: Aplicar filtragem usando a função de extração melhorada
      const userFilteredData = data.filter(notification => {
        const recordUserId = extractUserIdFromRecord(notification);
        
        // Só mostrar registros que pertencem ao usuário atual
        const belongsToUser = recordUserId === userId || recordUserId === clientId;
        
        if (!belongsToUser && recordUserId) {
          console.log('🚫 Notificação filtrada - não pertence ao usuário:', {
            recordUserId,
            currentUserId: userId,
            currentClientId: clientId
          });
        }
        
        return belongsToUser;
      });
      
      console.log(`✅ ${userFilteredData.length} notificações filtradas para usuário ${userId}/${clientId}`);
      
      // Log das notificações filtradas para debug
      userFilteredData.forEach((notification, index) => {
        const recordUserId = extractUserIdFromRecord(notification);
        console.log(`📌 Notificação ${index + 1}:`, {
          ID: notification.ID,
          'Tipo de Evento': notification['Tipo de Evento'],
          'ID do Usuário': recordUserId,
          'Perfil Hotmart': notification['Perfil Hotmart']
        });
      });
      
      // Ordenar notificações por data de criação (mais recentes primeiro)
      const sortedData = userFilteredData.sort((a, b) => {
        const dateA = new Date(a.CreatedAt || a.created_at || 0);
        const dateB = new Date(b.CreatedAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime(); // Ordem decrescente (mais recente primeiro)
      });
      
      console.log('📅 Notificações ordenadas por data (mais recentes primeiro)');
      
      setNotifications(sortedData);
      setLastSync(new Date());
      setSyncStatus('success');
      
      toast({
        title: "Sucesso",
        description: `${sortedData.length} notificações carregadas do NocoDB`,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      setSyncStatus('error');
      toast({
        title: "Erro",
        description: `Falha ao carregar notificações: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    setNotifications,
    isLoading,
    lastSync,
    syncStatus,
    loadNotifications,
  };
};
