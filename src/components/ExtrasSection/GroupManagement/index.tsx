
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstanceSelector } from './components/InstanceSelector';
import { CreateGroupModal } from './components/CreateGroupModal';
import { GroupsList } from './components/GroupsList';
import { ParticipantsModal } from './components/ParticipantsModal';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { useGroupData } from './hooks/useGroupData';
import { useGroupActions } from './hooks/useGroupActions';
import { Group, EditGroupData } from './types';

export const GroupManagement = () => {
  const [selectedInstance, setSelectedInstance] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const {
    instances,
    groups,
    participants,
    isLoadingInstances,
    isLoadingGroups,
    isLoadingParticipants,
    loadGroups,
    loadParticipants,
    refreshParticipants
  } = useGroupData(selectedInstance);

  const {
    isLoading,
    createGroup,
    updateGroupInfo,
    manageParticipant,
    deleteGroup,
    removeAllParticipants,
    getGroupInviteLink,
    sendMessageToGroup,
    addParticipants,
  } = useGroupActions(selectedInstance, loadGroups, loadParticipants);

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sair do Grupo',
      description: `Tem certeza que deseja sair do grupo "${groupName}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => deleteGroup(groupId, groupName)
    });
  };

  const handleRemoveAllParticipants = (groupId: string, participants: any[], groupName: string) => {
    const regularParticipants = participants.filter(p => !p.isAdmin && !p.isSuperAdmin);
    
    setConfirmDialog({
      isOpen: true,
      title: 'Remover Todos os Participantes',
      description: `Tem certeza que deseja remover todos os ${regularParticipants.length} participantes do grupo "${groupName}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => removeAllParticipants(groupId, participants, groupName)
    });
  };

  const handleOpenParticipants = (group: Group) => {
    setSelectedGroup(group);
    setIsParticipantsModalOpen(true);
    loadParticipants(group.id);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast">Gerenciamento de Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          <InstanceSelector
            instances={instances}
            selectedInstance={selectedInstance}
            isLoadingInstances={isLoadingInstances}
            onInstanceChange={setSelectedInstance}
            onCreateGroup={() => setIsCreateModalOpen(true)}
          />
        </CardContent>
      </Card>

      <GroupsList
        selectedInstance={selectedInstance}
        groups={groups}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoadingGroups={isLoadingGroups}
        onEditGroup={(group) => console.log('Edit group:', group)}
        onOpenParticipants={handleOpenParticipants}
        onCopyGroupLink={getGroupInviteLink}
        onDeleteGroup={handleDeleteGroup}
      />

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateGroup={createGroup}
        isLoading={isLoading}
      />

      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onOpenChange={setIsParticipantsModalOpen}
        selectedGroup={selectedGroup}
        participants={participants}
        isLoadingParticipants={isLoadingParticipants}
        isLoading={isLoading}
        onRefreshParticipants={refreshParticipants}
        onManageParticipant={manageParticipant}
        onRemoveAllParticipants={handleRemoveAllParticipants}
        onAddParticipants={addParticipants}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};
