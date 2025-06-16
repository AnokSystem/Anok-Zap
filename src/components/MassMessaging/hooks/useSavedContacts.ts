
import { useToast } from "@/hooks/use-toast";

export const useSavedContacts = () => {
  const { toast } = useToast();

  const checkForSavedContacts = (
    setRecipients: (recipients: string) => void,
    setSelectedInstance: (instance: string) => void
  ) => {
    console.log('Verificando contatos salvos no localStorage...');
    
    const savedContacts = localStorage.getItem('massMessagingContacts');
    const savedInstance = localStorage.getItem('massMessagingInstance');
    
    console.log('Contatos salvos encontrados:', !!savedContacts);
    console.log('Instância salva encontrada:', !!savedInstance);
    
    if (savedContacts) {
      console.log('Importando contatos:', savedContacts);
      setRecipients(savedContacts);
      
      localStorage.removeItem('massMessagingContacts');
      
      if (savedInstance) {
        console.log('Definindo instância:', savedInstance);
        setSelectedInstance(savedInstance);
        localStorage.removeItem('massMessagingInstance');
      }
      
      toast({
        title: "Contatos Importados",
        description: "Contatos foram importados da página de gerenciamento de contatos",
      });
    } else {
      console.log('Nenhum contato salvo encontrado');
    }
  };

  return { checkForSavedContacts };
};
