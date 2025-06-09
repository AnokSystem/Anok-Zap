
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from 'lucide-react';

interface FormHeaderProps {
  isEditing: boolean;
  onCancelEdit?: () => void;
}

export const FormHeader = ({ isEditing, onCancelEdit }: FormHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-purple-accent" />
        </div>
        <div>
          <h4 className="font-semibold text-primary-contrast text-lg">
            {isEditing ? 'Editar Notificação' : 'Nova Notificação'}
          </h4>
          <p className="text-sm text-gray-400 mt-1">
            {isEditing ? 'Modifique os campos e salve as alterações' : 'Configure uma nova notificação automática'}
          </p>
        </div>
      </div>
      
      {isEditing && onCancelEdit && (
        <Button
          onClick={onCancelEdit}
          variant="outline"
          size="sm"
          className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar Edição
        </Button>
      )}
    </div>
  );
};
