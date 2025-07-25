import { useCallback } from 'react';
import { fileUploadService } from '@/services/fileUpload';
import type { Instance, PrivacySettingsType, ProfileData } from '../types';

const WEBHOOK_URL = 'https://webhook.novahagencia.com.br/webhook/307e0a28-8c14-4fdd-8d64-45c54ac6a247';

export const useWebhookActions = (
  selectedInstance: string,
  instances: Instance[],
  profileData: ProfileData,
  setProfileData: (data: ProfileData) => void,
  privacySettings: PrivacySettingsType,
  toast: any,
  isUpdating: boolean,
  setIsUpdating: (updating: boolean) => void,
  loadInstances: () => Promise<void>,
  loadProfileData: () => Promise<void>
) => {
  const sendWebhookAction = useCallback(async (action: string, data: any) => {
    try {
      console.log('📡 Enviando ação via webhook:', { action, data, instance: selectedInstance });
      
      const webhookData = {
        action,
        instance: selectedInstance,
        data,
        timestamp: new Date().toISOString(),
        queue: true // Adicionar flag para processamento em fila
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Ação executada com sucesso via webhook:', result);
        return result;
      } else {
        throw new Error(`Webhook retornou erro: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao executar ação via webhook:', error);
      throw error;
    }
  }, [selectedInstance]);

  const handleUpdateName = useCallback(async () => {
    if (!selectedInstance || !profileData.name.trim()) {
      toast({
        title: "Erro",
        description: "Selecione uma instância e digite um nome",
        variant: "destructive"
      });
      return;
    }

    const currentInstance = instances.find(i => i.id === selectedInstance);
    if (currentInstance?.status === 'desconectado') {
      toast({
        title: "Erro",
        description: "A instância precisa estar conectada",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      console.log('📝 Atualizando nome do perfil via webhook:', profileData.name);
      
      await sendWebhookAction('update_profile_name', { name: profileData.name });
      
      toast({
        title: "Nome Atualizado",
        description: `Nome alterado para "${profileData.name}" via webhook`,
      });
      
      await loadInstances();
    } catch (error) {
      console.error('❌ Erro ao atualizar nome via webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar nome do perfil",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedInstance, profileData.name, instances, toast, setIsUpdating, sendWebhookAction, loadInstances]);

  const handleUpdateStatus = useCallback(async () => {
    if (!selectedInstance || !profileData.status.trim()) {
      toast({
        title: "Erro",
        description: "Selecione uma instância e digite um status",
        variant: "destructive"
      });
      return;
    }

    const currentInstance = instances.find(i => i.id === selectedInstance);
    if (currentInstance?.status === 'desconectado') {
      toast({
        title: "Erro",
        description: "A instância precisa estar conectada",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      console.log('📝 Atualizando status do perfil via webhook:', profileData.status);
      
      await sendWebhookAction('update_profile_status', { status: profileData.status });
      
      toast({
        title: "Status Atualizado",
        description: "Status do perfil atualizado com sucesso via webhook",
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar status via webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do perfil",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedInstance, profileData.status, instances, toast, setIsUpdating, sendWebhookAction]);

  const handleUpdatePhoto = useCallback(async () => {
    if (!selectedInstance || !profileData.profilePhoto) {
      toast({
        title: "Erro",
        description: "Selecione uma instância e uma foto",
        variant: "destructive"
      });
      return;
    }

    const currentInstance = instances.find(i => i.id === selectedInstance);
    if (currentInstance?.status === 'desconectado') {
      toast({
        title: "Erro",
        description: "A instância precisa estar conectada",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      console.log('📷 Iniciando upload da foto para NocoDB...');
      
      // 1. Upload da imagem para NocoDB
      const timestamp = Date.now();
      const fileExtension = profileData.profilePhoto.name.split('.').pop() || 'jpg';
      const fileName = `profile_photos/${selectedInstance}/profile_${timestamp}.${fileExtension}`;
      
      const renamedFile = new File([profileData.profilePhoto], fileName, { 
        type: profileData.profilePhoto.type 
      });
      
      const imageUrl = await fileUploadService.uploadFile(renamedFile);
      console.log('✅ Imagem enviada para NocoDB:', imageUrl);
      
      // 2. Enviar URL via webhook em formato de fila
      await sendWebhookAction('update_profile_photo', { 
        imageUrl: imageUrl,
        fileName: fileName,
        fileType: profileData.profilePhoto.type,
        instance: selectedInstance,
        queueProcessing: true
      });
      
      toast({
        title: "Foto Enviada para Processamento",
        description: "Foto enviada para NocoDB e adicionada à fila de processamento",
      });
      
      // Limpar foto local após envio
      setProfileData({ ...profileData, profilePhoto: null });
      
      // Aguardar um pouco antes de recarregar
      setTimeout(async () => {
        await loadProfileData();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao processar foto:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto para NocoDB",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedInstance, profileData.profilePhoto, instances, toast, setIsUpdating, sendWebhookAction, loadProfileData, setProfileData, profileData]);

  const handleRemovePhoto = useCallback(async () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    const currentInstance = instances.find(i => i.id === selectedInstance);
    if (currentInstance?.status === 'desconectado') {
      toast({
        title: "Erro",
        description: "A instância precisa estar conectada",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      console.log('🗑️ Removendo foto do perfil via webhook');
      
      await sendWebhookAction('remove_profile_photo', { queueProcessing: true });
      
      setProfileData({ ...profileData, profilePhoto: null, profilePhotoUrl: '' });
      toast({
        title: "Remoção Enviada para Processamento",
        description: "Solicitação de remoção adicionada à fila de processamento",
      });
    } catch (error) {
      console.error('❌ Erro ao remover foto via webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover foto do perfil",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedInstance, instances, profileData, setProfileData, toast, setIsUpdating, sendWebhookAction]);

  const handleUpdatePrivacySettings = useCallback(async () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    const currentInstance = instances.find(i => i.id === selectedInstance);
    if (currentInstance?.status === 'desconectado') {
      toast({
        title: "Erro",
        description: "A instância precisa estar conectada",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      console.log('🔒 Atualizando configurações de privacidade via webhook:', privacySettings);
      
      await sendWebhookAction('update_privacy_settings', privacySettings);
      
      toast({
        title: "Configurações Atualizadas",
        description: "Configurações de privacidade atualizadas com sucesso via webhook",
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações via webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações de privacidade",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedInstance, instances, privacySettings, toast, setIsUpdating, sendWebhookAction]);

  return {
    handleUpdateName,
    handleUpdateStatus,
    handleUpdatePhoto,
    handleRemovePhoto,
    handleUpdatePrivacySettings
  };
};
