
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Camera, Trash, Settings, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ProfileManagement = () => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    status: 'Disponível',
    description: 'Vendedor na empresa XYZ',
    profilePicture: null as File | null
  });

  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'contacts',
    status: 'contacts',
    readReceipts: true,
    groups: 'contacts'
  });

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData({ ...profileData, profilePicture: file });
      toast({
        title: "Foto Selecionada",
        description: "Nova foto de perfil selecionada",
      });
    }
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações de perfil foram atualizadas com sucesso!",
    });
  };

  const handleRemoveProfilePicture = () => {
    setProfileData({ ...profileData, profilePicture: null });
    toast({
      title: "Foto Removida",
      description: "Foto de perfil removida com sucesso",
    });
  };

  const handleUpdatePrivacy = () => {
    toast({
      title: "Privacidade Atualizada",
      description: "Configurações de privacidade atualizadas com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Editar Perfil */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Foto de Perfil */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
              {profileData.profilePicture ? (
                <img 
                  src={URL.createObjectURL(profileData.profilePicture)} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Label htmlFor="profile-picture" className="cursor-pointer">
                  <Button size="sm" className="btn-primary" asChild>
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      Alterar Foto
                    </span>
                  </Button>
                </Label>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                {profileData.profilePicture && (
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleRemoveProfilePicture}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400">Formatos aceitos: JPG, PNG (máx. 5MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nome</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label className="text-gray-300">Status</Label>
              <Select 
                value={profileData.status} 
                onValueChange={(value) => setProfileData({ ...profileData, status: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Ocupado">Ocupado</SelectItem>
                  <SelectItem value="Ausente">Ausente</SelectItem>
                  <SelectItem value="Não perturbe">Não perturbe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Descrição/Bio</Label>
            <Textarea
              value={profileData.description}
              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
              placeholder="Conte um pouco sobre você..."
              className="bg-gray-800 border-gray-600 text-gray-200"
              rows={3}
            />
          </div>

          <Button onClick={handleUpdateProfile} className="btn-primary w-full">
            <Upload className="w-4 h-4 mr-2" />
            Atualizar Perfil
          </Button>
        </CardContent>
      </Card>

      {/* Configurações de Privacidade */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Visto por último</Label>
              <Select 
                value={privacySettings.lastSeen} 
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, lastSeen: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Todos</SelectItem>
                  <SelectItem value="contacts">Meus contatos</SelectItem>
                  <SelectItem value="nobody">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Foto do perfil</Label>
              <Select 
                value={privacySettings.profilePhoto} 
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, profilePhoto: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Todos</SelectItem>
                  <SelectItem value="contacts">Meus contatos</SelectItem>
                  <SelectItem value="nobody">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Status</Label>
              <Select 
                value={privacySettings.status} 
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, status: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Todos</SelectItem>
                  <SelectItem value="contacts">Meus contatos</SelectItem>
                  <SelectItem value="nobody">Ninguém</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Adição a grupos</Label>
              <Select 
                value={privacySettings.groups} 
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, groups: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Todos</SelectItem>
                  <SelectItem value="contacts">Meus contatos</SelectItem>
                  <SelectItem value="admins">Apenas administradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="readReceipts"
              checked={privacySettings.readReceipts}
              onChange={(e) => setPrivacySettings({ ...privacySettings, readReceipts: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="readReceipts" className="text-gray-300">
              Confirmação de leitura
            </Label>
          </div>

          <Button onClick={handleUpdatePrivacy} className="btn-primary w-full">
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configurações de Privacidade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
