
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { groupsApiService } from '@/services/groupsApi';
import { Group, Participant } from '../types';

export const useGroupData = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      loadGroups();
    }
  }, [selectedInstance]);

  const loadInstances = async () => {
    try {
      const instanceList = await evolutionApiService.getInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const loadGroups = async () => {
    if (!selectedInstance) return;
    
    setIsLoadingGroups(true);
    try {
      console.log('🔍 Buscando grupos...');
      const groupList = await groupsApiService.getGroups(selectedInstance);
      setGroups(groupList);
      toast({
        title: "Grupos Carregados",
        description: `${groupList.length} grupos encontrados`,
      });
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const loadParticipants = async (groupId: string) => {
    setIsLoadingParticipants(true);
    try {
      console.log('👥 Carregando participantes do grupo:', groupId);
      const participantsList = await groupsApiService.getGroupParticipants(selectedInstance, groupId);
      console.log('✅ Participantes carregados:', participantsList.length);
      setParticipants(participantsList);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar participantes",
        variant: "destructive"
      });
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  return {
    instances,
    selectedInstance,
    setSelectedInstance,
    groups,
    participants,
    isLoadingGroups,
    isLoadingParticipants,
    loadGroups,
    loadParticipants,
  };
};
