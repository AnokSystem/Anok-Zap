
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';

interface Instance {
  id: string;
  name: string;
  status: string;
  qrCode?: string;
  phoneNumber?: string;
}

export const useInstanceOperations = (userId: string | null) => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectingInstance, setConnectingInstance] = useState<string | null>(null);
  const [monitoringInstanceId, setMonitoringInstanceId] = useState<string | null>(null);

  const loadInstances = async () => {
    if (!userId) {
      setInstances([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Carregando instâncias do usuário:', userId);
      const data = await evolutionApiService.getInstances();
      console.log('✅ Instâncias carregadas:', data);
      setInstances(data);
      // Removido o toast de sucesso para carregamento de instâncias
    } catch (error) {
      console.error('❌ Erro ao carregar instâncias:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInstance = async (name: string) => {
    if (!name.trim() || !userId) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Criando instância para usuário:', userId, 'Nome:', name);
      await evolutionApiService.createInstance(name);
      
      await loadInstances();
      
      toast({
        title: "Sucesso",
        description: `Instância "${name}" criada com sucesso`,
      });
    } catch (error) {
      console.error('❌ Erro ao criar instância:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInstance = async (instanceId: string, instanceName: string) => {
    setIsLoading(true);
    try {
      console.log('🔄 Deletando instância:', instanceId);
      await evolutionApiService.deleteInstance(instanceId);
      
      await loadInstances();
      
      toast({
        title: "Sucesso",
        description: `Instância "${instanceName}" removida com sucesso`,
      });
    } catch (error) {
      console.error('❌ Erro ao deletar instância:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInstanceConnection = async (instanceId: string, currentStatus: string) => {
    setIsLoading(true);
    try {
      const isConnected = currentStatus === 'open' || currentStatus === 'conectado';
      
      if (isConnected) {
        console.log('🔄 Desconectando instância:', instanceId);
        await evolutionApiService.disconnectInstance(instanceId);
        toast({
          title: "Sucesso",
          description: "Instância desconectada",
        });
      } else {
        console.log('🔄 Conectando instância:', instanceId);
        setConnectingInstance(instanceId);
        
        await evolutionApiService.connectInstance(instanceId);
        
        const qrCode = await evolutionApiService.generateQrCode(instanceId);
        setMonitoringInstanceId(instanceId);
        
        toast({
          title: "QR Code Gerado",
          description: "Escaneie o QR code para conectar a instância",
        });
        
        return qrCode;
      }
      
      await loadInstances();
    } catch (error) {
      console.error('❌ Erro ao alterar conexão da instância:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar conexão da instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConnectingInstance(null);
    }
  };

  const stopMonitoring = () => {
    setMonitoringInstanceId(null);
    setConnectingInstance(null);
  };

  // Monitor status da instância quando QR code está sendo exibido
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (monitoringInstanceId) {
      console.log('🔄 Iniciando monitoramento da instância:', monitoringInstanceId);
      
      interval = setInterval(async () => {
        try {
          const instances = await evolutionApiService.getInstances();
          const instance = instances.find(inst => inst.id === monitoringInstanceId);
          
          if (instance && (instance.status === 'conectado' || instance.status === 'open')) {
            console.log('✅ Instância conectada! Parando monitoramento...');
            
            setMonitoringInstanceId(null);
            setConnectingInstance(null);
            
            await loadInstances();
            
            toast({
              title: "Sucesso",
              description: "Instância conectada com sucesso!",
            });
          }
        } catch (error) {
          console.error('❌ Erro ao monitorar instância:', error);
        }
      }, 3000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [monitoringInstanceId, toast]);

  useEffect(() => {
    if (userId) {
      loadInstances();
    }
  }, [userId]);

  return {
    instances,
    isLoading,
    connectingInstance,
    monitoringInstanceId,
    loadInstances,
    createInstance,
    deleteInstance,
    toggleInstanceConnection,
    stopMonitoring,
  };
};
