
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Camera, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PhotoManagerProps {
  selectedInstance: string;
  profilePhotoUrl: string;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdatePhoto: () => void;
  onRemovePhoto: () => void;
  isUpdating: boolean;
  isInstanceDisconnected: () => boolean;
  hasPhotoToUpdate: boolean;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({
  selectedInstance,
  profilePhotoUrl,
  onPhotoChange,
  onUpdatePhoto,
  onRemovePhoto,
  isUpdating,
  isInstanceDisconnected,
  hasPhotoToUpdate
}) => {
  return (
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
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Label className="text-gray-300">Nova Foto</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="bg-gray-800 border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">
              Máximo 5MB - JPG, PNG, WEBP
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={onUpdatePhoto} 
            className="btn-primary flex-1"
            disabled={isUpdating || !selectedInstance || !hasPhotoToUpdate || isInstanceDisconnected()}
          >
            <Camera className="w-4 h-4 mr-2" />
            {isUpdating ? 'Atualizando...' : 'Atualizar Foto'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={onRemovePhoto}
            className="flex-1"
            disabled={isUpdating || !selectedInstance || isInstanceDisconnected()}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remover Foto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoManager;
