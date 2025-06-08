
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Download } from 'lucide-react';
import { useContactManagement } from './ContactManagement/useContactManagement';
import ContactSelection from './ContactManagement/ContactSelection';
import ContactTable from './ContactManagement/ContactTable';
import ContactActions from './ContactManagement/ContactActions';

const ContactManagement = () => {
  const {
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
    isLoadingGroups,
  } = useContactManagement();

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Gerenciamento de Contatos</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Organize e gerencie seus contatos do WhatsApp
        </p>
      </div>

      {/* Seleção de Instância e Grupo */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Filtros de Contato</h4>
            <p className="text-sm text-gray-400 mt-1">
              Selecione a instância e grupo para visualizar contatos
            </p>
          </div>
        </div>
        
        <ContactSelection
          instances={instances}
          groups={groups}
          selectedInstance={selectedInstance}
          setSelectedInstance={setSelectedInstance}
          contactType={contactType}
          setContactType={setContactType}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          memberType={memberType}
          setMemberType={setMemberType}
          isLoadingGroups={isLoadingGroups}
        />
      </div>

      {/* Ações de Contato */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Ações de Contato</h4>
            <p className="text-sm text-gray-400 mt-1">
              Busque, exporte ou use contatos para disparos
            </p>
          </div>
        </div>
        
        <ContactActions
          isLoading={isLoading}
          selectedInstance={selectedInstance}
          contactType={contactType}
          selectedGroup={selectedGroup}
          contactsCount={contacts.length}
          onFetchContacts={fetchContacts}
          onExportContacts={exportContacts}
          onStartMassMessaging={startMassMessaging}
        />
      </div>

      {/* Tabela de Contatos */}
      <div className="card-glass overflow-hidden">
        <ContactTable
          contacts={contacts}
          contactType={contactType}
        />
      </div>
    </div>
  );
};

export default ContactManagement;
