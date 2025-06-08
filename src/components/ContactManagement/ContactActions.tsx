
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
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onFetchContacts}
        disabled={isLoading || !selectedInstance || (contactType === 'groups' && !selectedGroup)}
        className="btn-futuristic text-white font-medium"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isLoading ? 'Buscando...' : 'Buscar Contatos'}
      </Button>

      <Button
        onClick={onExportContacts}
        disabled={contactsCount === 0}
        variant="outline"
        className="glass-morphism border-emerald-500/30 text-highlight-emerald hover:bg-emerald-500/10"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar CSV
      </Button>

      <Button
        onClick={onStartMassMessaging}
        disabled={contactsCount === 0}
        variant="outline"
        className="glass-morphism border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Usar para Disparo
      </Button>
    </div>
  );
};

export default ContactActions;
