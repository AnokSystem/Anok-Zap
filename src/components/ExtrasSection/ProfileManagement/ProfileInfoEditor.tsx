
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save } from 'lucide-react';

interface ProfileInfoEditorProps {
  selectedInstance: string;
  profileName: string;
  profileStatus: string;
  onNameChange: (name: string) => void;
  onStatusChange: (status: string) => void;
  onUpdateName: () => void;
  onUpdateStatus: () => void;
  isUpdating: boolean;
  isInstanceDisconnected: () => boolean;
}

const ProfileInfoEditor: React.FC<ProfileInfoEditorProps> = ({
  selectedInstance,
  profileName,
  profileStatus,
  onNameChange,
  onStatusChange,
  onUpdateName,
  onUpdateStatus,
  isUpdating,
  isInstanceDisconnected
}) => {
  return (
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
              value={profileName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Digite seu nome"
              className="bg-gray-800 border-gray-600 flex-1"
            />
            <Button 
              onClick={onUpdateName} 
              className="btn-primary"
              disabled={isUpdating || !selectedInstance || !profileName.trim() || isInstanceDisconnected()}
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
              value={profileStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              placeholder="Digite seu status"
              className="bg-gray-800 border-gray-600 flex-1"
            />
            <Button 
              onClick={onUpdateStatus} 
              className="btn-primary"
              disabled={isUpdating || !selectedInstance || !profileStatus.trim() || isInstanceDisconnected()}
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? 'Salvando...' : 'Salvar Status'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoEditor;
