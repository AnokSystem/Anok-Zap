
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import InstanceSelector from './ProfileManagement/InstanceSelector';
import ConnectionStatus from './ProfileManagement/ConnectionStatus';
import PhotoManager from './ProfileManagement/PhotoManager';
import ProfileInfoEditor from './ProfileManagement/ProfileInfoEditor';
import PrivacySettings from './ProfileManagement/PrivacySettings';
import { useProfileData } from './ProfileManagement/hooks/useProfileData';
import { usePrivacySettings } from './ProfileManagement/hooks/usePrivacySettings';
import { useWebhookActions } from './ProfileManagement/hooks/useWebhookActions';
import type { Instance, PrivacySettingsType } from './ProfileManagement/types';

const ProfileManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Move loadInstances function declaration before its usage
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

  const {
    profileData,
    setProfileData,
    loadProfileData
  } = useProfileData(selectedInstance, toast);

  const {
    privacySettings,
    setPrivacySettings,
    isLoadingPrivacy,
    loadPrivacySettings
  } = usePrivacySettings(selectedInstance, toast);

  const {
    handleUpdateName,
    handleUpdateStatus,
    handleUpdatePhoto,
    handleRemovePhoto,
    handleUpdatePrivacySettings
  } = useWebhookActions(
    selectedInstance,
    instances,
    profileData,
    setProfileData,
    privacySettings,
    toast,
    isUpdating,
    setIsUpdating,
    loadInstances,
    loadProfileData
  );

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      loadProfileData();
      loadPrivacySettings();
    }
  }, [selectedInstance, loadProfileData, loadPrivacySettings]);

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
