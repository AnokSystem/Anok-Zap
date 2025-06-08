
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { Group, ContactType } from '../types';

interface UseGroupsProps {
  selectedInstance: string;
  contactType: ContactType;
}

export const useGroups = ({ selectedInstance, contactType }: UseGroupsProps) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    if (selectedInstance && contactType === 'groups') {
      loadGroups();
    }
  }, [selectedInstance, contactType]);

  const loadGroups = async () => {
    if (!selectedInstance) return;
    
    try {
      console.log('Carregando grupos para instância:', selectedInstance);
      const groupsData = await evolutionApiService.getGroups(selectedInstance);
      console.log('Grupos carregados:', groupsData);
      setGroups(groupsData);
      
      toast({
        title: "Sucesso",
        description: `${groupsData.length} grupos encontrados`,
      });
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar grupos",
        variant: "destructive",
      });
    }
  };

  const getSelectedGroupName = () => {
    const group = groups.find(grp => grp.id === selectedGroup);
    return group ? group.name : '';
  };

  return {
    groups,
    selectedGroup,
    setSelectedGroup,
    getSelectedGroupName,
  };
};
