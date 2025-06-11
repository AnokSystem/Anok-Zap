
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { groupsApiService } from '@/services/groupsApi';
import { nocodbService } from '@/services/nocodb';
import { Contact, ContactType, MemberType } from '../types';

interface UseContactFetchProps {
  selectedInstance: string;
  contactType: ContactType;
  selectedGroup: string;
  memberType: MemberType;
}

export const useContactFetch = ({ selectedInstance, contactType, selectedGroup, memberType }: UseContactFetchProps) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

    console.log('🔄 INICIANDO BUSCA - isLoading atual:', isLoading);
    console.log('🔄 Setando isLoading para TRUE');
    setIsLoading(true);
    console.log('🔄 isLoading setado para TRUE');
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
      console.log('📊 Setando contatos no estado...');
      setContacts(contactsData);
      console.log('📊 Contatos setados no estado');
      
      if (contactsData.length > 0) {
        console.log('💾 Iniciando salvamento no NocoDB...');
        
        // Salvar no NocoDB de forma assíncrona sem bloquear a UI
        nocodbService.saveContacts(contactsData, selectedInstance)
          .then(() => {
            console.log('✅ Contatos salvos no NocoDB com sucesso');
          })
          .catch((saveError) => {
            console.error('❌ Erro ao salvar no NocoDB:', saveError);
          });
        
        console.log('💾 Processo de salvamento iniciado (assíncrono)');
        
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
      console.log('🏁 FINALLY EXECUTADO - Setando isLoading para FALSE');
      setIsLoading(false);
      console.log('🏁 isLoading setado para FALSE');
      
      // Forçar re-render para garantir que o estado seja atualizado
      setTimeout(() => {
        console.log('🏁 TIMEOUT - Verificando isLoading:', isLoading);
        console.log('🏁 TIMEOUT - Forçando setIsLoading(false) novamente');
        setIsLoading(false);
      }, 100);
    }
  };

  return {
    contacts,
    isLoading,
    fetchContacts,
  };
};
