import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Settings, Link, Search, Edit, Smartphone, Send, Save, RefreshCw, Upload, UserPlus, UserMinus, Crown, User, Download, FileSpreadsheet, X, Image } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { groupsApiService } from '@/services/groupsApi';
import { useSpreadsheetProcessor } from '@/components/MassMessaging/hooks/useSpreadsheetProcessor';
import { minioService } from '@/services/minio';

const GroupManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupMessage, setGroupMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para diferentes modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<any>(null);
  
  // Dados para criação de grupo
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    participants: '',
    profileImage: null as File | null
  });

  // Hook para processamento de planilhas
  const { uploadedFile, isLoading: isProcessingFile, handleSpreadsheetUpload, downloadTemplate } = useSpreadsheetProcessor();

  // Dados para edição de grupo
  const [editGroupData, setEditGroupData] = useState({
    name: '',
    description: '',
    pictureFile: null as File | null,
    isAnnounce: false,
    isRestricted: false
  });

  const [newParticipantNumber, setNewParticipantNumber] = useState('');

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      loadGroups();
    }
  }, [selectedInstance]);

  const loadInstances = async () => {
    try {
      const instanceList = await evolutionApiService.getInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const loadGroups = async () => {
    if (!selectedInstance) return;
    
    setIsLoading(true);
    try {
      const groupList = await groupsApiService.getGroups(selectedInstance);
      setGroups(groupList);
      toast({
        title: "Grupos Carregados",
        description: `${groupList.length} grupos encontrados`,
      });
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipants = async (groupId: string) => {
    try {
      const participantsList = await groupsApiService.getGroupParticipants(selectedInstance, groupId);
      setParticipants(participantsList);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar participantes",
        variant: "destructive"
      });
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = async () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    if (!newGroupData.name) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Processar lista de participantes se fornecida
      let participantsList: string[] = [];
      if (newGroupData.participants.trim()) {
        const lines = newGroupData.participants.split('\n');
        participantsList = lines
          .map(line => line.trim())
          .filter(line => line)
          .map(line => {
            // Se a linha tem formato "telefone - nome", extrair apenas o telefone
            if (line.includes(' - ')) {
              return line.split(' - ')[0].trim();
            }
            return line;
          })
          .map(phone => {
            // Garantir que termine com @s.whatsapp.net se for um número
            if (phone.match(/^\+?\d+$/)) {
              return phone.replace(/^\+/, '') + '@s.whatsapp.net';
            }
            return phone;
          });
      }

      // Preparar dados consolidados para uma única ação
      const groupData: any = {
        name: newGroupData.name,
        description: newGroupData.description,
        isPrivate: newGroupData.isPrivate,
        participants: participantsList
      };

      // Se há imagem, fazer upload para MinIO e incluir informações da imagem
      if (newGroupData.profileImage) {
        console.log('🖼️ Fazendo upload da imagem de perfil para MinIO...');
        
        try {
          // Fazer upload da imagem para MinIO
          const imageUrl = await minioService.uploadFile(newGroupData.profileImage);
          console.log('✅ Imagem enviada para MinIO com sucesso:', imageUrl);
          
          // Converter arquivo para base64 para o webhook
          const base64Data = await fileToBase64(newGroupData.profileImage);
          
          // Adicionar informações da imagem aos dados do grupo
          groupData.profileImage = base64Data;
          groupData.fileName = newGroupData.profileImage.name;
          groupData.fileType = newGroupData.profileImage.type;
          groupData.imageUrl = imageUrl; // URL do MinIO para referência
        } catch (uploadError) {
          console.error('❌ Erro no upload da imagem para MinIO:', uploadError);
          toast({
            title: "Aviso",
            description: "Erro no upload da imagem, mas o grupo será criado sem foto de perfil",
            variant: "destructive"
          });
        }
      }

      // Criar uma única ação com todas as informações
      const creationActions = [{
        action: 'create_group',
        data: groupData
      }];

      await groupsApiService.createGroupBatch(selectedInstance, creationActions);
      
      toast({
        title: "Grupo Criado",
        description: `Grupo "${newGroupData.name}" criado com sucesso!`,
      });
      
      setNewGroupData({ name: '', description: '', isPrivate: false, participants: '', profileImage: null });
      setShowCreateModal(false);
      loadGroups(); // Recarregar lista
    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar grupo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para converter File para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove o prefixo "data:image/...;base64,"
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Falha ao converter arquivo para base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUpdateGroupInfo = async () => {
    if (!selectedGroupForEdit) return;

    setIsLoading(true);
    try {
      // Preparar lista de ações para o webhook
      const updateActions = [];

      // Adicionar atualização de nome se mudou
      if (editGroupData.name && editGroupData.name !== selectedGroupForEdit.name) {
        updateActions.push({
          action: 'update_group_name',
          data: { name: editGroupData.name }
        });
      }

      // Adicionar atualização de descrição se mudou
      if (editGroupData.description !== (selectedGroupForEdit.description || '')) {
        updateActions.push({
          action: 'update_group_description',
          data: { description: editGroupData.description }
        });
      }

      // Adicionar atualização de configurações se mudaram
      if (editGroupData.isAnnounce !== selectedGroupForEdit.isAnnounce || 
          editGroupData.isRestricted !== selectedGroupForEdit.isRestricted) {
        updateActions.push({
          action: 'update_group_settings',
          data: {
            isAnnounce: editGroupData.isAnnounce,
            isRestricted: editGroupData.isRestricted
          }
        });
      }

      // Adicionar atualização de imagem se foi selecionada
      if (editGroupData.pictureFile) {
        updateActions.push({
          action: 'update_group_picture',
          data: { pictureFile: editGroupData.pictureFile }
        });
      }

      // Enviar todas as ações para o webhook se houver algo para atualizar
      if (updateActions.length > 0) {
        await groupsApiService.updateGroupBatch(selectedInstance, selectedGroupForEdit.id, updateActions);
        
        toast({
          title: "Grupo Atualizado",
          description: `${updateActions.length} atualizações enviadas com sucesso!`,
        });
        
        loadGroups();
      } else {
        toast({
          title: "Nenhuma Alteração",
          description: "Nenhuma informação foi modificada.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar informações do grupo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipantAction = async (participantId: string, action: 'add' | 'remove' | 'promote' | 'demote') => {
    if (!selectedGroupForEdit) return;

    setIsLoading(true);
    try {
      await groupsApiService.manageParticipant(selectedInstance, selectedGroupForEdit.id, participantId, action);
      const actionMessages = {
        add: 'Participante adicionado',
        remove: 'Participante removido',
        promote: 'Participante promovido a admin',
        demote: 'Admin rebaixado a membro'
      };
      
      toast({
        title: "Sucesso",
        description: actionMessages[action],
      });
      
      loadParticipants(selectedGroupForEdit.id);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao ${action} participante`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipantNumber || !selectedGroupForEdit) return;

    await handleParticipantAction(newParticipantNumber + '@s.whatsapp.net', 'add');
    setNewParticipantNumber('');
  };

  const handleSendMessage = async () => {
    if (!selectedInstance || !selectedGroup || !groupMessage) {
      toast({
        title: "Erro",
        description: "Selecione uma instância, grupo e digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await groupsApiService.sendMessageToGroup(selectedInstance, selectedGroup, groupMessage);
      const group = groups.find(g => g.id === selectedGroup);
      toast({
        title: "Mensagem Enviada",
        description: `Mensagem enviada para o grupo "${group?.name}"`,
      });
      setGroupMessage('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleParticipantsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSpreadsheetUpload(event, newGroupData.participants, (value) => 
      setNewGroupData({ ...newGroupData, participants: value })
    );
  };

  const clearParticipantsList = () => {
    setNewGroupData({ ...newGroupData, participants: '' });
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setNewGroupData({ ...newGroupData, profileImage: file });
    }
  };

  const removeProfileImage = () => {
    setNewGroupData({ ...newGroupData, profileImage: null });
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Instância */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Selecionar Instância
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-gray-300">Instância Ativa</Label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Escolha uma instância" />
                </SelectTrigger>
                <SelectContent>
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id}>
                      <div className="flex items-center gap-2">
                        {instance.name}
                        <span className={`text-xs px-2 py-1 rounded ${
                          instance.status === 'conectado' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {instance.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={loadGroups}
              disabled={!selectedInstance || isLoading}
              className="bg-gray-800 border-gray-600 mt-6"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="btn-primary h-16" disabled={!selectedInstance}>
              <Plus className="w-5 h-5 mr-2" />
              Criar Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary-contrast">Criar Novo Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Nome do Grupo</Label>
                <Input
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                  placeholder="Digite o nome do grupo"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label className="text-gray-300">Descrição</Label>
                <Textarea
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                  placeholder="Descrição do grupo (opcional)"
                  className="bg-gray-700 border-gray-600"
                />
              </div>

              {/* Seção de Imagem de Perfil */}
              <div className="space-y-3">
                <Label className="text-gray-300">Imagem de Perfil (opcional)</Label>
                {!newGroupData.profileImage ? (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                    <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm mb-3">
                      Selecione uma imagem para o perfil do grupo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                      className="bg-gray-700 border-gray-600"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Escolher Imagem
                    </Button>
                  </div>
                ) : (
                  <div className="border border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Image className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-gray-200 text-sm font-medium">{newGroupData.profileImage.name}</p>
                          <p className="text-gray-400 text-xs">
                            {(newGroupData.profileImage.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeProfileImage}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Seção de Participantes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Participantes (opcional)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="bg-gray-700 border-gray-600"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Modelo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('participants-file-upload')?.click()}
                      disabled={isProcessingFile}
                      className="bg-gray-700 border-gray-600"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      {isProcessingFile ? 'Processando...' : 'Importar'}
                    </Button>
                    {newGroupData.participants && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearParticipantsList}
                        className="bg-gray-700 border-gray-600 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <input
                  id="participants-file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleParticipantsFileUpload}
                  className="hidden"
                />
                
                <Textarea
                  value={newGroupData.participants}
                  onChange={(e) => setNewGroupData({ ...newGroupData, participants: e.target.value })}
                  placeholder="Digite os números dos participantes (um por linha)
Formato: +5511999999999 ou +5511999999999 - Nome

Ou importe de uma planilha CSV"
                  className="bg-gray-700 border-gray-600"
                  rows={6}
                />
                
                {uploadedFile && (
                  <div className="text-sm text-gray-400 bg-gray-700/30 p-2 rounded">
                    📎 Arquivo: {uploadedFile.name}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={newGroupData.isPrivate}
                  onCheckedChange={(checked) => setNewGroupData({ ...newGroupData, isPrivate: !!checked })}
                />
                <Label htmlFor="private" className="text-gray-300">Grupo Privado</Label>
              </div>
              <Button onClick={handleCreateGroup} disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Criando...' : 'Criar Grupo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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

      {/* Lista de Grupos */}
      {selectedInstance && (
        <Card className="border-gray-600/50 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-primary-contrast flex items-center gap-2">
              <Users className="w-5 h-5" />
              Grupos ({filteredGroups.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Buscar Grupos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar grupos..."
                  className="bg-gray-800 border-gray-600 pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <div key={group.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-200">{group.name}</h4>
                    <span className="text-sm text-gray-400">
                      {group.size} membros
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-gray-400 text-sm mb-3">{group.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-gray-800 border-gray-600"
                      onClick={() => openEditModal(group)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-gray-800 border-gray-600"
                      onClick={() => openParticipantsModal(group)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Participantes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-gray-800 border-gray-600"
                      onClick={() => copyGroupLink(`https://chat.whatsapp.com/${group.id}`, group.name)}
                    >
                      <Link className="w-4 h-4 mr-1" />
                      Copiar Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição de Grupo - ATUALIZADO */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-contrast">
              Editar Grupo: {selectedGroupForEdit?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Nome do Grupo */}
            <div className="space-y-2">
              <Label className="text-gray-300">Nome do Grupo</Label>
              <Input
                value={editGroupData.name}
                onChange={(e) => setEditGroupData({ ...editGroupData, name: e.target.value })}
                className="bg-gray-700 border-gray-600"
                placeholder="Nome do grupo"
              />
            </div>

            {/* Descrição */}
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

            {/* Imagem do Grupo */}
            <div className="space-y-2">
              <Label className="text-gray-300">Nova Imagem do Grupo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setEditGroupData({ ...editGroupData, pictureFile: e.target.files?.[0] || null })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* Configurações */}
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

            {/* Botão para Salvar Todas as Alterações */}
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

      {/* Modal de Participantes */}
      <Dialog open={showParticipantsModal} onOpenChange={setShowParticipantsModal}>
        <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-contrast">
              Participantes: {selectedGroupForEdit?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Adicionar Participante */}
            <div className="space-y-2">
              <Label className="text-gray-300">Adicionar Participante</Label>
              <div className="flex gap-2">
                <Input
                  value={newParticipantNumber}
                  onChange={(e) => setNewParticipantNumber(e.target.value)}
                  placeholder="Número do telefone (sem +55)"
                  className="bg-gray-700 border-gray-600"
                />
                <Button onClick={handleAddParticipant} disabled={isLoading || !newParticipantNumber}>
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Lista de Participantes */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded">
                  <div>
                    <p className="text-gray-200">{participant.name}</p>
                    <p className="text-gray-400 text-sm">{participant.phoneNumber}</p>
                    {participant.isAdmin && (
                      <span className="text-yellow-400 text-xs">Admin</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!participant.isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 border-gray-600"
                        onClick={() => handleParticipantAction(participant.id, 'promote')}
                        disabled={isLoading}
                      >
                        <Crown className="w-3 h-3" />
                      </Button>
                    )}
                    {participant.isAdmin && !participant.isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 border-gray-600"
                        onClick={() => handleParticipantAction(participant.id, 'demote')}
                        disabled={isLoading}
                      >
                        <User className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleParticipantAction(participant.id, 'remove')}
                      disabled={isLoading}
                    >
                      <UserMinus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
