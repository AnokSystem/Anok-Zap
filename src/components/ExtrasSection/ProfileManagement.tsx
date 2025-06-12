
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import InstanceSelector from './ProfileManagement/InstanceSelector';
import ConnectionStatus from './ProfileManagement/ConnectionStatus';
import PhotoManager from './ProfileManagement/PhotoManager';
import ProfileInfoEditor from './ProfileManagement/ProfileInfoEditor';
import PrivacySettings from './ProfileManagement/PrivacySettings';

interface Instance {
  id: string;
  name: string;
  status: string;
  creationDate: string;
  connectionStatus?: string;
  profileName?: string;
  profilePicUrl?: string;
}

interface PrivacySettingsType {
  readreceipts: 'all' | 'none';
  profile: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  status: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  online: 'all' | 'match_last_seen';
  last: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  groupadd: 'all' | 'contacts' | 'contact_blacklist';
}

const WEBHOOK_URL = 'https://webhook.novahagencia.com.br/webhook/307e0a28-8c14-4fdd-8d64-45c54ac6a247';

const ProfileManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    status: '',
    description: '',
    profilePhoto: null as File | null,
    profilePhotoUrl: ''
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>({
    readreceipts: 'all',
    profile: 'all',
    status: 'all',
    online: 'all',
    last: 'all',
    groupadd: 'all'
  });
  const [isLoadingPrivacy, setIsLoadingPrivacy] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      loadProfileData();
      loadPrivacySettings();
    }
  }, [selectedInstance]);

  const loadInstances = async () => {
    try {
      console.log('🔄 Carregando instâncias...');
      const instanceList = await evolutionApiService.getInstances();
      console.log('✅ Instâncias carregadas:', instanceList);
      
      setInstances(instanceList);
      
      toast({
        title: "Instâncias Carregadas",
        description: `${instanceList.length} instâncias encontradas`,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar instâncias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar instâncias",
        variant: "destructive"
      });
    }
  };

  const loadProfileData = async () => {
    if (!selectedInstance) return;
    
    try {
      console.log('🔍 Carregando dados do perfil para instância:', selectedInstance);
      
      const response = await fetch(`https://api.novahagencia.com.br/instance/fetchInstances`, {
        headers: {
          'apikey': '26bda82495a95caeae71f96534841285',
        },
      });

      if (response.ok) {
        const allInstances = await response.json();
        console.log('📡 Instâncias da API:', allInstances);
        
        const currentInstance = allInstances.find((inst: any) => 
          inst.name === selectedInstance || inst.id === selectedInstance
        );
        
        if (currentInstance) {
          console.log('✅ Instância encontrada via API:', currentInstance);
          setProfileData({
            name: currentInstance.profileName || '',
            status: '',
            description: '',
            profilePhoto: null,
            profilePhotoUrl: currentInstance.profilePicUrl || ''
          });

          toast({
            title: "Dados Carregados",
            description: "Dados do perfil carregados com sucesso",
          });
        } else {
          console.log('⚠️ Instância não encontrada');
          toast({
            title: "Aviso",
            description: "Instância não encontrada ou desconectada",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do perfil",
        variant: "destructive"
      });
    }
  };

  const loadPrivacySettings = async () => {
    if (!selectedInstance) return;
    
    setIsLoadingPrivacy(true);
    try {
      console.log('🔒 Carregando configurações de privacidade via webhook para:', selectedInstance);
      
      const webhookData = {
        action: 'fetch_privacy_settings',
        instance: selectedInstance,
        timestamp: new Date().toISOString()
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
        console.log('✅ Configurações de privacidade carregadas via webhook:', result);
        
        if (result.privacySettings) {
          setPrivacySettings({
            readreceipts: result.privacySettings.readreceipts || 'all',
            profile: result.privacySettings.profile || 'all',
            status: result.privacySettings.status || 'all',
            online: result.privacySettings.online || 'all',
            last: result.privacySettings.last || 'all',
            groupadd: result.privacySettings.groupadd || 'all'
          });

          toast({
            title: "Configurações Carregadas",
            description: "Configurações de privacidade carregadas com sucesso",
          });
        }
      } else {
        console.error('❌ Erro ao carregar configurações de privacidade via webhook');
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações de privacidade",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações de privacidade via webhook:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar configurações de privacidade",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPrivacy(false);
    }
  };

  const sendWebhookAction = async (action: string, data: any) => {
    try {
      console.log('📡 Enviando ação via webhook:', { action, data, instance: selectedInstance });
      
      const webhookData = {
        action,
        instance: selectedInstance,
        data,
        timestamp: new Date().toISOString()
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
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }

      setProfileData({ ...profileData, profilePhoto: file });
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData(prev => ({ ...prev, profilePhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateName = async () => {
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
  };

  const handleUpdateStatus = async () => {
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
  };

  const handleUpdatePhoto = async () => {
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
      console.log('📷 Atualizando foto do perfil via webhook');
      
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          
          await sendWebhookAction('update_profile_photo', { 
            photo: base64Data,
            filename: profileData.profilePhoto!.name 
          });
          
          toast({
            title: "Foto Atualizada",
            description: "Foto do perfil atualizada com sucesso via webhook",
          });
          
          await loadProfileData();
        } catch (error) {
          console.error('❌ Erro ao atualizar foto via webhook:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar foto do perfil",
            variant: "destructive"
          });
        } finally {
          setIsUpdating(false);
        }
      };
      reader.readAsDataURL(profileData.profilePhoto);
    } catch (error) {
      console.error('❌ Erro ao processar foto:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar foto",
        variant: "destructive"
      });
      setIsUpdating(false);
    }
  };

  const handleRemovePhoto = async () => {
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
      
      await sendWebhookAction('remove_profile_photo', {});
      
      setProfileData({ ...profileData, profilePhoto: null, profilePhotoUrl: '' });
      toast({
        title: "Foto Removida",
        description: "Foto do perfil removida com sucesso via webhook",
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
  };

  const handleUpdatePrivacySettings = async () => {
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
        variant: "destructiva"
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
  };

  const getStatusColor = (status?: string) => {
    return status === 'conectado' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  };

  const isInstanceDisconnected = () => {
    const currentInstance = instances.find(i => i.id === selectedInstance);
    return currentInstance?.status === 'desconectado';
  };

  return (
    <div className="space-y-6">
      <InstanceSelector
        instances={instances}
        selectedInstance={selectedInstance}
        onInstanceChange={setSelectedInstance}
        onRefresh={loadProfileData}
        getStatusColor={getStatusColor}
      />

      <ConnectionStatus
        selectedInstance={selectedInstance}
        instances={instances}
        getStatusColor={getStatusColor}
        isInstanceDisconnected={isInstanceDisconnected}
      />

      <PhotoManager
        selectedInstance={selectedInstance}
        profilePhotoUrl={profileData.profilePhotoUrl}
        onPhotoChange={handlePhotoChange}
        onUpdatePhoto={handleUpdatePhoto}
        onRemovePhoto={handleRemovePhoto}
        isUpdating={isUpdating}
        isInstanceDisconnected={isInstanceDisconnected}
        hasPhotoToUpdate={!!profileData.profilePhoto}
      />

      <ProfileInfoEditor
        selectedInstance={selectedInstance}
        profileName={profileData.name}
        profileStatus={profileData.status}
        onNameChange={(name) => setProfileData({ ...profileData, name })}
        onStatusChange={(status) => setProfileData({ ...profileData, status })}
        onUpdateName={handleUpdateName}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
        isInstanceDisconnected={isInstanceDisconnected}
      />

      <PrivacySettings
        selectedInstance={selectedInstance}
        privacySettings={privacySettings}
        onPrivacySettingsChange={setPrivacySettings}
        onLoadPrivacySettings={loadPrivacySettings}
        onUpdatePrivacySettings={handleUpdatePrivacySettings}
        isUpdating={isUpdating}
        isLoadingPrivacy={isLoadingPrivacy}
        isInstanceDisconnected={isInstanceDisconnected}
      />
    </div>
  );
};

export default ProfileManagement;
