
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Download, MessageSquare } from 'lucide-react';
import { ContactType } from './types';

interface ContactActionsProps {
  isLoading: boolean;
  selectedInstance: string;
  contactType: ContactType;
  selectedGroup: string;
  contactsCount: number;
  onFetchContacts: () => void;
  onExportContacts: () => void;
  onStartMassMessaging: () => void;
}

const ContactActions: React.FC<ContactActionsProps> = ({
  isLoading,
  selectedInstance,
  contactType,
  selectedGroup,
  contactsCount,
  onFetchContacts,
  onExportContacts,
  onStartMassMessaging,
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      <Button
        onClick={onFetchContacts}
        disabled={isLoading || !selectedInstance || (contactType === 'groups' && !selectedGroup)}
        variant="default"
        size="default"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isLoading ? 'Buscando...' : 'Buscar Contatos'}
      </Button>

      <Button
        onClick={onExportContacts}
        disabled={contactsCount === 0}
        variant="secondary"
        size="default"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar CSV
      </Button>

      <Button
        onClick={onStartMassMessaging}
        disabled={contactsCount === 0}
        variant="info"
        size="default"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Usar para Disparo
      </Button>
    </div>
  );
};

export default ContactActions;
