
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';

export const useInstances = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      console.log('Carregando instâncias...');
      const instancesData = await evolutionApiService.getInstances();
      console.log('Instâncias carregadas:', instancesData);
      setInstances(instancesData);
      
      // Notificação de instâncias carregadas removida
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias da Evolution API",
        variant: "destructive",
      });
    }
  };

  const getSelectedInstanceName = () => {
    const instance = instances.find(inst => inst.id === selectedInstance);
    return instance ? instance.name : '';
  };

  return {
    instances,
    selectedInstance,
    setSelectedInstance,
    getSelectedInstanceName,
  };
};
