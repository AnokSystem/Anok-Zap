
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstanceSelector } from './components/InstanceSelector';
import { CreateGroupModal } from './components/CreateGroupModal';
import { EditGroupModal } from './components/EditGroupModal';
import { GroupsList } from './components/GroupsList';
import { ParticipantsModal } from './components/ParticipantsModal';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { useGroupData } from './hooks/useGroupData';
import { useGroupActions } from './hooks/useGroupActions';
import { Group, GroupData } from './types';

const GroupManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupData, setGroupData] = useState<GroupData>({
    name: '',
    description: '',
    isPrivate: false,
    participants: '',
    profileImage: null
  });
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
    selectedInstance,
    setSelectedInstance,
    groups,
    participants,
    isLoadingGroups,
    isLoadingParticipants,
    loadGroups,
    loadParticipants,
  } = useGroupData();

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
  } = useGroupActions(selectedInstance, loadGroups, () => selectedGroup && loadParticipants(selectedGroup.id));

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

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsEditModalOpen(true);
  };

  const handleCreateGroup = async () => {
    const success = await createGroup(groupData);
    if (success) {
      setIsCreateModalOpen(false);
      setGroupData({
        name: '',
        description: '',
        isPrivate: false,
        participants: '',
        profileImage: null
      });
    }
  };

  const handleManageParticipant = (participantId: string, action: "add" | "remove" | "promote" | "demote") => {
    if (selectedGroup) {
      return manageParticipant(selectedGroup.id, participantId, action);
    }
  };

  const refreshParticipants = () => {
    if (selectedGroup) {
      loadParticipants(selectedGroup.id);
    }
  };

  return (
    <div className="space-y-6 bg-gray-950 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-950">
      <Card className="bg-gray-900 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-900 border-gray-700 data-[theme=light]:border-gray-200 data-[theme=dark]:border-gray-700">
        <CardHeader>
          <CardTitle className="text-white data-[theme=light]:text-gray-900 data-[theme=dark]:text-white">Gerenciamento de Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          <InstanceSelector
            instances={instances}
            selectedInstance={selectedInstance}
            onInstanceChange={setSelectedInstance}
            onRefresh={loadGroups}
            isLoadingGroups={isLoadingGroups}
          />
        </CardContent>
      </Card>

      <GroupsList
        selectedInstance={selectedInstance}
        groups={groups}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoadingGroups={isLoadingGroups}
        onEditGroup={handleEditGroup}
        onOpenParticipants={handleOpenParticipants}
        onCopyGroupLink={getGroupInviteLink}
        onDeleteGroup={handleDeleteGroup}
      />

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        groupData={groupData}
        onGroupDataChange={setGroupData}
        onCreateGroup={handleCreateGroup}
        isLoading={isLoading}
        disabled={!selectedInstance}
      />

      <EditGroupModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        group={selectedGroup}
        onUpdateGroup={updateGroupInfo}
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
        onManageParticipant={handleManageParticipant}
        onRemoveAllParticipants={handleRemoveAllParticipants}
        onAddParticipants={(data) => selectedGroup && addParticipants(selectedGroup.id, { participants: data })}
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

export default GroupManagement;
