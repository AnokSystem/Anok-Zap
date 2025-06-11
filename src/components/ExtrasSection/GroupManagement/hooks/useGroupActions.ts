
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { groupsApiService } from '@/services/groupsApi';
import { minioService } from '@/services/minio';
import { GroupData, EditGroupData } from '../types';

export const useGroupActions = (
  selectedInstance: string,
  loadGroups: () => void,
  loadParticipants: (groupId: string) => void
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Falha ao converter arquivo para base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const createGroup = async (groupData: GroupData) => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    if (!groupData.name) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let participantsList: string[] = [];
      if (groupData.participants.trim()) {
        const lines = groupData.participants.split('\n');
        participantsList = lines
          .map(line => line.trim())
          .filter(line => line)
          .map(line => {
            if (line.includes(' - ')) {
              return line.split(' - ')[0].trim();
            }
            return line;
          })
          .map(phone => {
            if (phone.match(/^\+?\d+$/)) {
              return phone.replace(/^\+/, '') + '@s.whatsapp.net';
            }
            return phone;
          });
      }

      const data: any = {
        name: groupData.name,
        description: groupData.description,
        isPrivate: groupData.isPrivate,
        participants: participantsList
      };

      if (groupData.profileImage) {
        console.log('🖼️ Fazendo upload da imagem de perfil para MinIO...');
        
        try {
          const imageUrl = await minioService.uploadFile(groupData.profileImage);
          console.log('✅ Imagem enviada para MinIO com sucesso:', imageUrl);
          
          const base64Data = await fileToBase64(groupData.profileImage);
          
          data.profileImage = base64Data;
          data.fileName = groupData.profileImage.name;
          data.fileType = groupData.profileImage.type;
          data.imageUrl = imageUrl;
        } catch (uploadError) {
          console.error('❌ Erro no upload da imagem para MinIO:', uploadError);
          toast({
            title: "Aviso",
            description: "Erro no upload da imagem, mas o grupo será criado sem foto de perfil",
            variant: "destructive"
          });
        }
      }

      const creationActions = [{
        action: 'create_group',
        data
      }];

      await groupsApiService.createGroupBatch(selectedInstance, creationActions);
      
      toast({
        title: "Grupo Criado",
        description: `Grupo "${groupData.name}" criado com sucesso!`,
      });
      
      loadGroups();
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar grupo",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroupInfo = async (groupId: string, editData: EditGroupData, originalGroup: any) => {
    setIsLoading(true);
    try {
      const updateActions = [];

      if (editData.name && editData.name !== originalGroup.name) {
        updateActions.push({
          action: 'update_group_name',
          data: { name: editData.name }
        });
      }

      if (editData.description !== (originalGroup.description || '')) {
        updateActions.push({
          action: 'update_group_description',
          data: { description: editData.description }
        });
      }

      if (editData.isAnnounce !== originalGroup.isAnnounce || 
          editData.isRestricted !== originalGroup.isRestricted) {
        updateActions.push({
          action: 'update_group_settings',
          data: {
            isAnnounce: editData.isAnnounce,
            isRestricted: editData.isRestricted
          }
        });
      }

      if (editData.pictureFile) {
        updateActions.push({
          action: 'update_group_picture',
          data: { pictureFile: editData.pictureFile }
        });
      }

      if (updateActions.length > 0) {
        await groupsApiService.updateGroupBatch(selectedInstance, groupId, updateActions);
        
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

  const manageParticipant = async (groupId: string, participantId: string, action: 'add' | 'remove' | 'promote' | 'demote') => {
    setIsLoading(true);
    try {
      console.log(`🔄 Executando ação "${action}" para participante:`, participantId);
      
      await groupsApiService.manageParticipant(selectedInstance, groupId, participantId, action);
      
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
      
      console.log('✅ Ação executada com sucesso, atualizando listas...');
      
      await loadParticipants(groupId);
      await loadGroups();
      
    } catch (error) {
      console.error(`❌ Erro ao ${action} participante:`, error);
      toast({
        title: "Erro",
        description: `Falha ao ${action} participante`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToGroup = async (groupId: string, message: string, groups: any[]) => {
    if (!selectedInstance || !groupId || !message) {
      toast({
        title: "Erro",
        description: "Selecione uma instância, grupo e digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await groupsApiService.sendMessageToGroup(selectedInstance, groupId, message);
      const group = groups.find(g => g.id === groupId);
      toast({
        title: "Mensagem Enviada",
        description: `Mensagem enviada para o grupo "${group?.name}"`,
      });
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

  return {
    isLoading,
    createGroup,
    updateGroupInfo,
    manageParticipant,
    sendMessageToGroup,
  };
};
