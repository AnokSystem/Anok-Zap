
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useContactManagement } from './ContactManagement/useContactManagement';
import ContactSelection from './ContactManagement/ContactSelection';
import ContactActions from './ContactManagement/ContactActions';
import ContactTable from './ContactManagement/ContactTable';

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
    getSelectedInstanceName,
    getSelectedGroupName,
  } = useContactManagement();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Gerenciamento de Contatos</span>
          </CardTitle>
          <CardDescription>
            Recupere e gerencie contatos do WhatsApp das suas instâncias Evolution API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          />

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

          {/* Informações da Seleção */}
          {selectedInstance && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="text-sm space-y-1">
                  <p><strong>Instância:</strong> {getSelectedInstanceName()}</p>
                  <p><strong>Tipo:</strong> {contactType === 'personal' ? 'Contatos Pessoais' : 'Contatos de Grupos'}</p>
                  {contactType === 'groups' && selectedGroup && (
                    <>
                      <p><strong>Grupo:</strong> {getSelectedGroupName()}</p>
                      <p><strong>Membros:</strong> {
                        memberType === 'all' ? 'Todos' :
                        memberType === 'admin' ? 'Apenas Administradores' :
                        'Apenas Membros'
                      }</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <ContactTable contacts={contacts} contactType={contactType} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactManagement;
