
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import { useGroupData } from './hooks/useGroupData';
import { useGroupActions } from './hooks/useGroupActions';
import { InstanceSelector } from './components/InstanceSelector';
import { CreateGroupModal } from './components/CreateGroupModal';
import { GroupsList } from './components/GroupsList';
import { ParticipantsModal } from './components/ParticipantsModal';
import { GroupData, EditGroupData } from './types';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, RefreshCw } from 'lucide-react';

const GroupManagement = () => {
  const { toast } = useToast();
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
    sendMessageToGroup,
  } = useGroupActions(selectedInstance, loadGroups, loadParticipants);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupMessage, setGroupMessage] = useState('');
  
  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<any>(null);
  
  // Dados para criação de grupo
  const [newGroupData, setNewGroupData] = useState<GroupData>({
    name: '',
    description: '',
    isPrivate: false,
    participants: '',
    profileImage: null
  });

  // Dados para edição de grupo
  const [editGroupData, setEditGroupData] = useState<EditGroupData>({
    name: '',
    description: '',
    pictureFile: null,
    isAnnounce: false,
    isRestricted: false
  });

  const handleCreateGroup = async () => {
    const success = await createGroup(newGroupData);
    if (success) {
      setNewGroupData({
        name: '',
        description: '',
        isPrivate: false,
        participants: '',
        profileImage: null
      });
      setShowCreateModal(false);
    }
  };

  const handleUpdateGroupInfo = async () => {
    if (!selectedGroupForEdit) return;
    await updateGroupInfo(selectedGroupForEdit.id, editGroupData, selectedGroupForEdit);
  };

  const handleParticipantAction = async (participantId: string, action: 'add' | 'remove' | 'promote' | 'demote') => {
    if (!selectedGroupForEdit) return;
    await manageParticipant(selectedGroupForEdit.id, participantId, action);
  };

  const handleSendMessage = async () => {
    await sendMessageToGroup(selectedGroup, groupMessage, groups);
    setGroupMessage('');
  };

  const openEditModal = (group: any) => {
    setSelectedGroupForEdit(group);
    setEditGroupData({
      name: group.name,
      description: group.description || '',
      pictureFile: null,
      isAnnounce: group.isAnnounce || false,
      isRestricted: group.isRestricted || false
    });
    setShowEditModal(true);
  };

  const openParticipantsModal = (group: any) => {
    setSelectedGroupForEdit(group);
    loadParticipants(group.id);
    setShowParticipantsModal(true);
  };

  const copyGroupLink = (link: string, groupName: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copiado",
      description: `Link do grupo "${groupName}" copiado!`,
    });
  };

  return (
    <div className="space-y-6">
      <InstanceSelector
        instances={instances}
        selectedInstance={selectedInstance}
        onInstanceChange={setSelectedInstance}
        onRefresh={loadGroups}
        isLoadingGroups={isLoadingGroups}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreateGroupModal
          isOpen={showCreateModal}
          onOpenChange={setShowCreateModal}
          groupData={newGroupData}
          onGroupDataChange={setNewGroupData}
          onCreateGroup={handleCreateGroup}
          isLoading={isLoading}
          disabled={!selectedInstance}
        />

        <Button 
          variant="outline" 
          className="h-16 bg-gray-800 border-gray-600"
          disabled={!selectedInstance || groups.length === 0}
          onClick={() => {
            if (groups.length > 0) {
              openEditModal(groups[0]);
            }
          }}
        >
          <Settings className="w-5 h-5 mr-2" />
          Gerenciar Grupos
        </Button>

        <Button 
          variant="outline" 
          className="h-16 bg-gray-800 border-gray-600"
          disabled={!selectedInstance || groups.length === 0}
        >
          <Send className="w-5 h-5 mr-2" />
          Enviar Mensagens
        </Button>
      </div>

      <GroupsList
        selectedInstance={selectedInstance}
        groups={groups}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoadingGroups={isLoadingGroups}
        onEditGroup={openEditModal}
        onOpenParticipants={openParticipantsModal}
        onCopyGroupLink={copyGroupLink}
      />

      {/* Modal de Edição de Grupo */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-contrast">
              Editar Grupo: {selectedGroupForEdit?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome do Grupo</Label>
              <Input
                value={editGroupData.name}
                onChange={(e) => setEditGroupData({ ...editGroupData, name: e.target.value })}
                className="bg-gray-700 border-gray-600"
                placeholder="Nome do grupo"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Descrição</Label>
              <Textarea
                value={editGroupData.description}
                onChange={(e) => setEditGroupData({ ...editGroupData, description: e.target.value })}
                className="bg-gray-700 border-gray-600"
                placeholder="Descrição do grupo"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Nova Imagem do Grupo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setEditGroupData({ ...editGroupData, pictureFile: e.target.files?.[0] || null })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-gray-300">Configurações do Grupo</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="announce"
                    checked={editGroupData.isAnnounce}
                    onCheckedChange={(checked) => setEditGroupData({ ...editGroupData, isAnnounce: !!checked })}
                  />
                  <Label htmlFor="announce" className="text-gray-300">Apenas admins podem enviar mensagens</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restricted"
                    checked={editGroupData.isRestricted}
                    onCheckedChange={(checked) => setEditGroupData({ ...editGroupData, isRestricted: !!checked })}
                  />
                  <Label htmlFor="restricted" className="text-gray-300">Apenas admins podem editar info do grupo</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-600">
              <Button 
                onClick={handleUpdateGroupInfo} 
                disabled={isLoading} 
                className="btn-primary px-8"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Todas as Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ParticipantsModal
        isOpen={showParticipantsModal}
        onOpenChange={setShowParticipantsModal}
        selectedGroup={selectedGroupForEdit}
        participants={participants}
        isLoadingParticipants={isLoadingParticipants}
        isLoading={isLoading}
        onRefreshParticipants={() => selectedGroupForEdit && loadParticipants(selectedGroupForEdit.id)}
        onManageParticipant={handleParticipantAction}
      />

      {/* Disparar Mensagem para Grupo */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Send className="w-5 h-5" />
            Disparar Mensagem para Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Selecionar Grupo</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Escolha um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Mensagem</Label>
            <Textarea
              value={groupMessage}
              onChange={(e) => setGroupMessage(e.target.value)}
              placeholder="Digite a mensagem para o grupo..."
              className="bg-gray-800 border-gray-600 text-gray-200"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSendMessage} 
              className="btn-primary flex-1"
              disabled={isLoading || !selectedGroup || !groupMessage}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
            <Button variant="outline" className="flex-1 bg-gray-800 border-gray-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupManagement;
