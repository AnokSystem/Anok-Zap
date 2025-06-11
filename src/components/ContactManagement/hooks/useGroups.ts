
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { groupsApiService } from '@/services/groupsApi';
import { Group, ContactType } from '../types';

interface UseGroupsProps {
  selectedInstance: string;
  contactType: ContactType;
}

export const useGroups = ({ selectedInstance, contactType }: UseGroupsProps) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (selectedInstance && contactType === 'groups') {
      loadGroups();
    } else {
      setGroups([]);
      setSelectedGroup('');
    }
  }, [selectedInstance, contactType]);

  const loadGroups = async () => {
    if (!selectedInstance) return;
    
    setIsLoadingGroups(true);
    try {
      console.log('Carregando grupos para instância:', selectedInstance);
      const groupsData = await groupsApiService.getGroups(selectedInstance);
      console.log('Grupos carregados:', groupsData);
      
      // Converter para o formato esperado pelo ContactManagement
      const formattedGroups = groupsData.map((group: any) => ({
        id: group.id,
        name: group.name,
        subject: group.name,
        description: group.description || '',
        pictureUrl: group.pictureUrl || '',
        size: group.size || 0,
        participants: group.participants || []
      }));
      
      setGroups(formattedGroups);
      
      toast({
        title: "Sucesso",
        description: `${formattedGroups.length} grupos encontrados onde você é admin`,
      });
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar grupos",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGroups(false);
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
    isLoadingGroups,
  };
};
