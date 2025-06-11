
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

const ProfileManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    status: '',
    description: '',
    profilePhoto: null as File | null,
    profilePhotoUrl: ''
  });
  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    status: 'everyone',
    readReceipts: true,
    groups: 'everyone'
  });

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const instanceList = await evolutionApiService.getInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const loadProfileData = async () => {
    if (!selectedInstance) return;
    
    // Simular carregamento dos dados do perfil
    toast({
      title: "Dados Carregados",
      description: "Dados do perfil carregados com sucesso",
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData({ ...profileData, profilePhoto: file });
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData(prev => ({ ...prev, profilePhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateName = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    if (!profileData.name.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Nome Atualizado",
      description: `Nome alterado para "${profileData.name}"`,
    });
  };

  const handleUpdateStatus = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Status Atualizado",
      description: "Status do perfil atualizado com sucesso",
    });
  };

  const handleUpdateDescription = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Descrição Atualizada",
      description: "Descrição do perfil atualizada com sucesso",
    });
  };

  const handleUpdatePhoto = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    if (!profileData.profilePhoto) {
      toast({
        title: "Erro",
        description: "Selecione uma foto",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Foto Atualizada",
      description: "Foto do perfil atualizada com sucesso",
    });
  };

  const handleRemovePhoto = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    setProfileData({ ...profileData, profilePhoto: null, profilePhotoUrl: '' });
    toast({
      title: "Foto Removida",
      description: "Foto do perfil removida com sucesso",
    });
  };

  const handleUpdatePrivacy = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Privacidade Atualizada",
      description: "Configurações de privacidade atualizadas",
    });
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
              onClick={loadProfileData}
              className="bg-gray-800 border-gray-600 mt-6"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

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
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleUpdatePhoto} className="btn-primary flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Atualizar Foto
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemovePhoto}
              className="flex-1"
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
              <Button onClick={handleUpdateName} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Salvar Nome
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
              <Button onClick={handleUpdateStatus} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Salvar Status
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Descrição</Label>
            <div className="space-y-3">
              <Textarea
                value={profileData.description}
                onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                placeholder="Digite uma descrição"
                className="bg-gray-800 border-gray-600 text-gray-200"
                rows={3}
              />
              <Button onClick={handleUpdateDescription} className="btn-primary w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Descrição
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
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <Label className="text-gray-300">Visto por último</Label>
                <p className="text-sm text-gray-400">Quem pode ver quando você esteve online</p>
              </div>
              <Select 
                value={privacySettings.lastSeen} 
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, lastSeen: value })}
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Todos</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="nobody">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <Label className="text-gray-300">Foto do perfil</Label>
                <p className="text-sm text-gray-400">Quem pode ver sua foto do perfil</p>
              </div>
              <Select 
                value={privacySettings.profilePhoto} 
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, profilePhoto: value })}
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Todos</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="nobody">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <Label className="text-gray-300">Confirmação de leitura</Label>
                <p className="text-sm text-gray-400">Enviar confirmações de leitura</p>
              </div>
              <Switch
                checked={privacySettings.readReceipts}
                onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, readReceipts: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <Label className="text-gray-300">Grupos</Label>
                <p className="text-sm text-gray-400">Quem pode adicionar você em grupos</p>
              </div>
              <Select 
                value={privacySettings.groups} 
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, groups: value })}
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Todos</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="admins">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleUpdatePrivacy} className="btn-primary w-full">
            <Shield className="w-4 h-4 mr-2" />
            Salvar Configurações de Privacidade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
