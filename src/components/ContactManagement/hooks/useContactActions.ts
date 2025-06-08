
import { useToast } from "@/hooks/use-toast";
import { Contact, ContactType } from '../types';

interface UseContactActionsProps {
  contacts: Contact[];
  contactType: ContactType;
  selectedInstance: string;
}

export const useContactActions = ({ contacts, contactType, selectedInstance }: UseContactActionsProps) => {
  const { toast } = useToast();

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

  return {
    exportContacts,
    startMassMessaging,
  };
};
