
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, Image } from 'lucide-react';
import { Group, EditGroupData } from '../types';

interface EditGroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onUpdateGroup: (groupId: string, data: EditGroupData, originalGroup: Group) => Promise<void>;
  isLoading: boolean;
}

export const EditGroupModal = ({
  isOpen,
  onOpenChange,
  group,
  onUpdateGroup,
  isLoading
}: EditGroupModalProps) => {
  const [editData, setEditData] = useState<EditGroupData>({
    name: '',
    description: '',
    pictureFile: null,
    isAnnounce: false,
    isRestricted: false,
  });

  useEffect(() => {
    if (group) {
      setEditData({
        name: group.name || '',
        description: group.description || '',
        pictureFile: null,
        isAnnounce: group.isAnnounce || false,
        isRestricted: group.isRestricted || false,
      });
    }
  }, [group]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditData(prev => ({ ...prev, pictureFile: file }));
    }
  };

  const handleSubmit = async () => {
    if (!group) return;
    
    await onUpdateGroup(group.id, editData, group);
    
    if (!isLoading) {
      onOpenChange(false);
      setEditData({
        name: '',
        description: '',
        pictureFile: null,
        isAnnounce: false,
        isRestricted: false,
      });
    }
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary-contrast">
            Editar Grupo: {group.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Nome do Grupo</Label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-700 border-gray-600"
              placeholder="Nome do grupo"
            />
          </div>

          <div>
            <Label className="text-gray-300">Descrição</Label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-gray-700 border-gray-600"
              placeholder="Descrição do grupo"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-gray-300">Imagem do Grupo</Label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="group-picture"
              />
              <label
                htmlFor="group-picture"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <Image className="w-4 h-4" />
                {editData.pictureFile ? editData.pictureFile.name : 'Escolher arquivo'}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Apenas Admins Enviam Mensagens</Label>
              <Switch
                checked={editData.isAnnounce}
                onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isAnnounce: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Apenas Admins Editam Informações</Label>
              <Switch
                checked={editData.isRestricted}
                onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isRestricted: checked }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Grupo'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
