
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
    isLoadingGroups,
  } = useContactManagement();

  return (
    <div className="space-y-6 p-6">
      <Card className="card-futuristic border-white/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-highlight-cyan">
            <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span>Gerenciamento de Contatos</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
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
            isLoadingGroups={isLoadingGroups}
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
            <Card className="glass-morphism border-cyan-500/20">
              <CardContent className="pt-4">
                <div className="text-sm space-y-1">
                  <p className="text-foreground"><strong>Instância:</strong> {getSelectedInstanceName()}</p>
                  <p className="text-foreground"><strong>Tipo:</strong> {contactType === 'personal' ? 'Contatos Pessoais' : 'Contatos de Grupos'}</p>
                  {contactType === 'groups' && selectedGroup && (
                    <>
                      <p className="text-foreground"><strong>Grupo:</strong> {getSelectedGroupName()}</p>
                      <p className="text-foreground"><strong>Membros:</strong> {
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
