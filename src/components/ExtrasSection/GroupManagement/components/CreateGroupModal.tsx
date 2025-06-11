
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, X, Download, FileSpreadsheet, Image } from 'lucide-react';
import { GroupData } from '../types';
import { useSpreadsheetProcessor } from '@/components/MassMessaging/hooks/useSpreadsheetProcessor';

interface CreateGroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupData: GroupData;
  onGroupDataChange: (data: GroupData) => void;
  onCreateGroup: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const CreateGroupModal = ({
  isOpen,
  onOpenChange,
  groupData,
  onGroupDataChange,
  onCreateGroup,
  isLoading,
  disabled
}: CreateGroupModalProps) => {
  const { uploadedFile, isLoading: isProcessingFile, handleSpreadsheetUpload, downloadTemplate } = useSpreadsheetProcessor();

  const handleParticipantsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSpreadsheetUpload(event, groupData.participants, (value) => 
      onGroupDataChange({ ...groupData, participants: value })
    );
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      
      onGroupDataChange({ ...groupData, profileImage: file });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-primary h-16" disabled={disabled}>
          <Plus className="w-5 h-5 mr-2" />
          Criar Novo Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary-contrast">Criar Novo Grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Nome do Grupo</Label>
            <Input
              value={groupData.name}
              onChange={(e) => onGroupDataChange({ ...groupData, name: e.target.value })}
              placeholder="Digite o nome do grupo"
              className="bg-gray-700 border-gray-600"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Descrição</Label>
            <Textarea
              value={groupData.description}
              onChange={(e) => onGroupDataChange({ ...groupData, description: e.target.value })}
              placeholder="Descrição do grupo (opcional)"
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-300">Imagem de Perfil (opcional)</Label>
            {!groupData.profileImage ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-400 text-sm mb-3">
                  Selecione uma imagem para o perfil do grupo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('profile-image-upload')?.click()}
                  className="bg-gray-700 border-gray-600"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Escolher Imagem
                </Button>
              </div>
            ) : (
              <div className="border border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-200 text-sm font-medium">{groupData.profileImage.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(groupData.profileImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onGroupDataChange({ ...groupData, profileImage: null })}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Participantes (opcional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="bg-gray-700 border-gray-600"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Modelo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('participants-file-upload')?.click()}
                  disabled={isProcessingFile}
                  className="bg-gray-700 border-gray-600"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  {isProcessingFile ? 'Processando...' : 'Importar'}
                </Button>
                {groupData.participants && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onGroupDataChange({ ...groupData, participants: '' })}
                    className="bg-gray-700 border-gray-600 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <input
              id="participants-file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleParticipantsFileUpload}
              className="hidden"
            />
            
            <Textarea
              value={groupData.participants}
              onChange={(e) => onGroupDataChange({ ...groupData, participants: e.target.value })}
              placeholder="Digite os números dos participantes (um por linha)
Formato: +5511999999999 ou +5511999999999 - Nome

Ou importe de uma planilha CSV"
              className="bg-gray-700 border-gray-600"
              rows={6}
            />
            
            {uploadedFile && (
              <div className="text-sm text-gray-400 bg-gray-700/30 p-2 rounded">
                📎 Arquivo: {uploadedFile.name}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={groupData.isPrivate}
              onCheckedChange={(checked) => onGroupDataChange({ ...groupData, isPrivate: !!checked })}
            />
            <Label htmlFor="private" className="text-gray-300">Grupo Privado</Label>
          </div>
          
          <Button onClick={onCreateGroup} disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Criando...' : 'Criar Grupo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
