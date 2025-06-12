
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, RefreshCw } from 'lucide-react';

interface PrivacySettingsType {
  readreceipts: 'all' | 'none';
  profile: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  status: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  online: 'all' | 'match_last_seen';
  last: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  groupadd: 'all' | 'contacts' | 'contact_blacklist';
}

interface PrivacySettingsProps {
  selectedInstance: string;
  privacySettings: PrivacySettingsType;
  onPrivacySettingsChange: (settings: PrivacySettingsType) => void;
  onLoadPrivacySettings: () => void;
  onUpdatePrivacySettings: () => void;
  isUpdating: boolean;
  isLoadingPrivacy: boolean;
  isInstanceDisconnected: () => boolean;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  selectedInstance,
  privacySettings,
  onPrivacySettingsChange,
  onLoadPrivacySettings,
  onUpdatePrivacySettings,
  isUpdating,
  isLoadingPrivacy,
  isInstanceDisconnected
}) => {
  return (
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
            onClick={onLoadPrivacySettings}
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
                onPrivacySettingsChange({ ...privacySettings, readreceipts: value })
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
                onPrivacySettingsChange({ ...privacySettings, profile: value })
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
                onPrivacySettingsChange({ ...privacySettings, status: value })
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
                onPrivacySettingsChange({ ...privacySettings, online: value })
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
                onPrivacySettingsChange({ ...privacySettings, last: value })
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
                onPrivacySettingsChange({ ...privacySettings, groupadd: value })
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
          onClick={onUpdatePrivacySettings} 
          className="btn-primary w-full"
          disabled={isUpdating || !selectedInstance || isInstanceDisconnected()}
        >
          <Shield className="w-4 h-4 mr-2" />
          {isUpdating ? 'Salvando...' : 'Salvar Configurações de Privacidade'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
