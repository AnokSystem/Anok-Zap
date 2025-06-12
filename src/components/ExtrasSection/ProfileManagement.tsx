import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Camera, Edit, Save, Trash2, Shield, Eye, EyeOff, Smartphone, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';

interface Instance {
  id: string;
  name: string;
  status: string;
  creationDate: string;
  connectionStatus?: string;
  profileName?: string;
  profilePicUrl?: string;
}

interface PrivacySettings {
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
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
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
      console.log('🔒 Carregando configurações de privacidade para:', selectedInstance);
      
      const response = await fetch(`https://api.novahagencia.com.br/chat/fetchPrivacySettings/${selectedInstance}`, {
        headers: {
          'apikey': '26bda82495a95caeae71f96534841285',
        },
      });

      if (response.ok) {
        const settings = await response.json();
        console.log('✅ Configurações de privacidade carregadas:', settings);
        
        setPrivacySettings({
          readreceipts: settings.readreceipts || 'all',
          profile: settings.profile || 'all',
          status: settings.status || 'all',
          online: settings.online || 'all',
          last: settings.last || 'all',
          groupadd: settings.groupadd || 'all'
        });

        toast({
          title: "Configurações Carregadas",
          description: "Configurações de privacidade carregadas com sucesso",
        });
      } else {
        console.error('❌ Erro ao carregar configurações de privacidade');
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações de privacidade",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações de privacidade:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar configurações de privacidade",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPrivacy(false);
    }
  };

  const sendWebhook = async (action: string, data: any) => {
    try {
      console.log('📡 Enviando webhook:', { action, data, instance: selectedInstance });
      
      const webhookData = {
        action,
        instance: selectedInstance,
        data,
        timestamp: new Date().toISOString()
      };

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      console.log('✅ Webhook enviado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar webhook:', error);
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
      console.log('📝 Atualizando nome do perfil:', profileData.name);
      
      const response = await fetch(`https://api.novahagencia.com.br/chat/updateProfileName/${selectedInstance}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '26bda82495a95caeae71f96534841285',
        },
        body: JSON.stringify({
          name: profileData.name
        }),
      });

      if (response.ok) {
        await sendWebhook('update_profile_name', { name: profileData.name });
        
        toast({
          title: "Nome Atualizado",
          description: `Nome alterado para "${profileData.name}"`,
        });
        
        await loadInstances();
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na atualização do nome:', errorText);
        toast({
          title: "Erro",
          description: "Falha ao atualizar nome do perfil",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar nome:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao atualizar nome",
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
      console.log('📝 Atualizando status do perfil:', profileData.status);
      
      const response = await fetch(`https://api.novahagencia.com.br/chat/updateProfileStatus/${selectedInstance}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '26bda82495a95caeae71f96534841285',
        },
        body: JSON.stringify({
          status: profileData.status
        }),
      });

      if (response.ok) {
        await sendWebhook('update_profile_status', { status: profileData.status });
        
        toast({
          title: "Status Atualizado",
          description: "Status do perfil atualizado com sucesso",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na atualização do status:', errorText);
        toast({
          title: "Erro",
          description: "Falha ao atualizar status do perfil",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao atualizar status",
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
      console.log('📷 Atualizando foto do perfil');
      
      const formData = new FormData();
      formData.append('picture', profileData.profilePhoto);

      const response = await fetch(`https://api.novahagencia.com.br/chat/updateProfilePicture/${selectedInstance}`, {
        method: 'PUT',
        headers: {
          'apikey': '26bda82495a95caeae71f96534841285',
        },
        body: formData,
      });

      if (response.ok) {
        await sendWebhook('update_profile_photo', { updated: true });
        
        toast({
          title: "Foto Atualizada",
          description: "Foto do perfil atualizada com sucesso",
        });
        
        await loadProfileData();
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na atualização da foto:', errorText);
        
        const alternativeResponse = await fetch(`https://api.novahagencia.com.br/chat/updateProfilePhoto/${selectedInstance}`, {
          method: 'PUT',
          headers: {
            'apikey': '26bda82495a95caeae71f96534841285',
          },
          body: formData,
        });

        if (alternativeResponse.ok) {
          await sendWebhook('update_profile_photo', { updated: true });
          
          toast({
            title: "Foto Atualizada",
            description: "Foto do perfil atualizada com sucesso",
          });
          await loadProfileData();
        } else {
          toast({
            title: "Erro",
            description: "Falha ao atualizar foto do perfil",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar foto:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao atualizar foto",
        variant: "destructive"
      });
    } finally {
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
      console.log('🗑️ Removendo foto do perfil');
      
      const response = await fetch(`https://api.novahagencia.com.br/chat/removeProfilePicture/${selectedInstance}`, {
        method: 'DELETE',
        headers: {
          'apikey': '26bda82495a95caeae71f96534841285',
        },
      });

      if (response.ok) {
        await sendWebhook('remove_profile_photo', { removed: true });
        
        setProfileData({ ...profileData, profilePhoto: null, profilePhotoUrl: '' });
        toast({
          title: "Foto Removida",
          description: "Foto do perfil removida com sucesso",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na remoção da foto:', errorText);
        toast({
          title: "Erro",
          description: "Falha ao remover foto do perfil",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao remover foto:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao remover foto",
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
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      console.log('🔒 Atualizando configurações de privacidade:', privacySettings);
      
      const response = await fetch(`https://api.novahagencia.com.br/chat/updatePrivacySettings/${selectedInstance}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '26bda82495a95caeae71f96534841285',
        },
        body: JSON.stringify(privacySettings),
      });

      if (response.ok) {
        await sendWebhook('update_privacy_settings', privacySettings);
        
        toast({
          title: "Configurações Atualizadas",
          description: "Configurações de privacidade atualizadas com sucesso",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na atualização das configurações:', errorText);
        toast({
          title: "Erro",
          description: "Falha ao atualizar configurações de privacidade",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao atualizar configurações",
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
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(instance.status)}`}>
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
              onClick={loadProfileData}
              className="bg-gray-800 border-gray-600 mt-6"
              disabled={!selectedInstance}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status da Conexão */}
      {selectedInstance && (
        <Card className="border-gray-600/50 bg-gray-800/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-primary-contrast font-medium">Status da Instância</h4>
                <p className="text-gray-400 text-sm">
                  Instância: {instances.find(i => i.id === selectedInstance)?.name}
                </p>
                {isInstanceDisconnected() && (
                  <p className="text-yellow-400 text-sm mt-1">
                    ⚠️ Para editar o perfil, a instância precisa estar conectada
                  </p>
                )}
              </div>
              <div className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(instances.find(i => i.id === selectedInstance)?.status)}`}>
                {instances.find(i => i.id === selectedInstance)?.status}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Foto do Perfil */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Foto do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {profileData.profilePhotoUrl ? (
                <img src={profileData.profilePhotoUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <Label className="text-gray-300">Nova Foto</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="bg-gray-800 border-gray-600"
              />
              <p className="text-xs text-gray-400 mt-1">
                Máximo 5MB - JPG, PNG, WEBP
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleUpdatePhoto} 
              className="btn-primary flex-1"
              disabled={isUpdating || !selectedInstance || !profileData.profilePhoto || isInstanceDisconnected()}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isUpdating ? 'Atualizando...' : 'Atualizar Foto'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemovePhoto}
              className="flex-1"
              disabled={isUpdating || !selectedInstance || isInstanceDisconnected()}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover Foto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Perfil */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Informações do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Nome</Label>
            <div className="flex gap-3">
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Digite seu nome"
                className="bg-gray-800 border-gray-600 flex-1"
              />
              <Button 
                onClick={handleUpdateName} 
                className="btn-primary"
                disabled={isUpdating || !selectedInstance || !profileData.name.trim() || isInstanceDisconnected()}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Salvando...' : 'Salvar Nome'}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Status</Label>
            <div className="flex gap-3">
              <Input
                value={profileData.status}
                onChange={(e) => setProfileData({ ...profileData, status: e.target.value })}
                placeholder="Digite seu status"
                className="bg-gray-800 border-gray-600 flex-1"
              />
              <Button 
                onClick={handleUpdateStatus} 
                className="btn-primary"
                disabled={isUpdating || !selectedInstance || !profileData.status.trim() || isInstanceDisconnected()}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Salvando...' : 'Salvar Status'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Privacidade */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configurações de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-primary-contrast font-medium">Configurações Atuais</h4>
            <Button 
              variant="outline" 
              onClick={loadPrivacySettings}
              className="bg-gray-800 border-gray-600"
              disabled={!selectedInstance || isLoadingPrivacy}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingPrivacy ? 'animate-spin' : ''}`} />
              {isLoadingPrivacy ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-gray-300">Confirmação de Leitura</Label>
              <Select 
                value={privacySettings.readreceipts} 
                onValueChange={(value: 'all' | 'none') => 
                  setPrivacySettings({ ...privacySettings, readreceipts: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="none">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Foto do Perfil</Label>
              <Select 
                value={privacySettings.profile} 
                onValueChange={(value: 'all' | 'contacts' | 'contact_blacklist' | 'none') => 
                  setPrivacySettings({ ...privacySettings, profile: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="contact_blacklist">Contatos Exceto</SelectItem>
                  <SelectItem value="none">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Status</Label>
              <Select 
                value={privacySettings.status} 
                onValueChange={(value: 'all' | 'contacts' | 'contact_blacklist' | 'none') => 
                  setPrivacySettings({ ...privacySettings, status: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="contact_blacklist">Contatos Exceto</SelectItem>
                  <SelectItem value="none">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Online</Label>
              <Select 
                value={privacySettings.online} 
                onValueChange={(value: 'all' | 'match_last_seen') => 
                  setPrivacySettings({ ...privacySettings, online: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="match_last_seen">Igual ao Visto por Último</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Visto por Último</Label>
              <Select 
                value={privacySettings.last} 
                onValueChange={(value: 'all' | 'contacts' | 'contact_blacklist' | 'none') => 
                  setPrivacySettings({ ...privacySettings, last: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="contact_blacklist">Contatos Exceto</SelectItem>
                  <SelectItem value="none">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Grupos</Label>
              <Select 
                value={privacySettings.groupadd} 
                onValueChange={(value: 'all' | 'contacts' | 'contact_blacklist') => 
                  setPrivacySettings({ ...privacySettings, groupadd: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="contact_blacklist">Contatos Exceto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleUpdatePrivacySettings} 
            className="btn-primary w-full"
            disabled={isUpdating || !selectedInstance || isInstanceDisconnected()}
          >
            <Shield className="w-4 h-4 mr-2" />
            {isUpdating ? 'Salvando...' : 'Salvar Configurações de Privacidade'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
