import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';
import { Contact, Group, ContactType, MemberType } from './types';

export const useContactManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [contactType, setContactType] = useState<ContactType>('personal');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [memberType, setMemberType] = useState<MemberType>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance && contactType === 'groups') {
      loadGroups();
    }
  }, [selectedInstance, contactType]);

  const loadInstances = async () => {
    try {
      console.log('Carregando instâncias...');
      const instancesData = await evolutionApiService.getInstances();
      console.log('Instâncias carregadas:', instancesData);
      setInstances(instancesData);
      
      if (instancesData.length > 0) {
        toast({
          title: "Sucesso",
          description: `${instancesData.length} instâncias encontradas`,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias da Evolution API",
        variant: "destructive",
      });
    }
  };

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

  const fetchContacts = async () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma instância primeiro",
        variant: "destructive",
      });
      return;
    }

    if (contactType === 'groups' && !selectedGroup) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um grupo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setContacts([]);
    
    try {
      console.log('🔍 Iniciando busca de contatos...');
      console.log('Tipo:', contactType, 'Instância:', selectedInstance, 'Grupo:', selectedGroup);
      
      let contactsData: Contact[] = [];

      if (contactType === 'personal') {
        console.log('📞 Buscando contatos pessoais...');
        
        toast({
          title: "Buscando contatos",
          description: "Aguarde, isso pode levar alguns segundos...",
        });
        
        contactsData = await evolutionApiService.getAllContacts(selectedInstance);
        console.log('✅ Contatos pessoais encontrados:', contactsData.length);
        
      } else if (contactType === 'groups' && selectedGroup) {
        console.log('👥 Buscando contatos do grupo:', selectedGroup);
        const groupContacts = await evolutionApiService.getGroupContacts(selectedInstance, selectedGroup);
        console.log('📋 Total de participantes do grupo:', groupContacts.length);
        
        if (memberType === 'admin') {
          contactsData = groupContacts.filter(contact => contact.isAdmin);
          console.log('👑 Apenas administradores:', contactsData.length);
        } else if (memberType === 'members') {
          contactsData = groupContacts.filter(contact => !contact.isAdmin);
          console.log('👤 Apenas membros:', contactsData.length);
        } else {
          contactsData = groupContacts;
          console.log('👥 Todos os participantes:', contactsData.length);
        }
      }

      console.log('📊 Total de contatos filtrados:', contactsData.length);
      setContacts(contactsData);
      
      if (contactsData.length > 0) {
        console.log('💾 Salvando contatos no NocoDB...');
        try {
          await nocodbService.saveContacts(contactsData, selectedInstance);
          console.log('✅ Contatos salvos no NocoDB com sucesso');
        } catch (saveError) {
          console.error('❌ Erro ao salvar no NocoDB:', saveError);
        }
        
        toast({
          title: "Sucesso",
          description: `${contactsData.length} contatos carregados com sucesso`,
        });
      } else {
        toast({
          title: "Atenção",
          description: "Nenhum contato encontrado com os filtros selecionados",
        });
      }
      
    } catch (error) {
      console.error('💥 Erro ao buscar contatos:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro na busca",
        description: `${errorMessage}. Verifique se a instância está conectada.`,
        variant: "destructive",
      });
      
      setContacts([]);
    } finally {
      console.log('🏁 Finalizando busca de contatos');
      setIsLoading(false);
    }
  };

  const exportContacts = () => {
    if (contacts.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum contato para exportar",
        variant: "destructive",
      });
      return;
    }

    const csvHeaders = contactType === 'groups' 
      ? "Nome,Telefone,Grupo,Tipo"
      : "Nome,Telefone";

    const csvContent = [
      csvHeaders,
      ...contacts.map(contact => {
        if (contactType === 'groups') {
          const memberTypeText = contact.isAdmin ? 'Admin' : 'Membro';
          return `"${contact.name}","${contact.phoneNumber}","${contact.groupName || ''}","${memberTypeText}"`;
        }
        return `"${contact.name}","${contact.phoneNumber}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos_${contactType}_${selectedInstance}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Contatos exportados com sucesso",
    });
  };

  const startMassMessaging = () => {
    if (contacts.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum contato selecionado",
        variant: "destructive",
      });
      return;
    }

    const formattedContacts = contacts.map(contact => {
      const cleanPhone = contact.phoneNumber.replace(/[^\d]/g, '');
      
      if (contact.name && contact.name !== contact.phoneNumber && contact.name !== cleanPhone) {
        return `${cleanPhone} - ${contact.name}`;
      }
      return cleanPhone;
    });

    localStorage.setItem('massMessagingContacts', formattedContacts.join('\n'));
    localStorage.setItem('massMessagingInstance', selectedInstance);
    
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'mass-messaging');
    window.location.replace(url.toString());
  };

  const getSelectedInstanceName = () => {
    const instance = instances.find(inst => inst.id === selectedInstance);
    return instance ? instance.name : '';
  };

  const getSelectedGroupName = () => {
    const group = groups.find(grp => grp.id === selectedGroup);
    return group ? group.name : '';
  };

  return {
    instances,
    groups,
    selectedInstance,
    setSelectedInstance,
    contactType,
    setContactType,
    selectedGroup,
    setSelectedGroup,
    memberType,
    setMemberType,
    contacts,
    isLoading,
    fetchContacts,
    exportContacts,
    startMassMessaging,
    getSelectedInstanceName,
    getSelectedGroupName,
  };
};
