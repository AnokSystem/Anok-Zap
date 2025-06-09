
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Save } from 'lucide-react';

interface NotificationRule {
  eventType: string;
  instanceId: string;
  userRole: string;
  platform: string;
  profileName: string;
}

interface FormActionsProps {
  newRule: Partial<NotificationRule>;
  isEditing: boolean;
  isLoading: boolean;
  onSave: () => void;
  onCancelEdit?: () => void;
}

export const FormActions = ({ newRule, isEditing, isLoading, onSave, onCancelEdit }: FormActionsProps) => {
  const isFormValid = !!(
    newRule.eventType && 
    newRule.instanceId && 
    newRule.userRole && 
    newRule.platform && 
    newRule.profileName
  );

  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-600/30">
      <div className="flex items-center space-x-3">
        {isEditing && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            Modo de Edição
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {isEditing && onCancelEdit && (
          <Button
            onClick={onCancelEdit}
            variant="ghost"
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-200"
          >
            Cancelar
          </Button>
        )}
        <Button 
          onClick={onSave}
          disabled={isLoading || !isFormValid}
          className="bg-purple-accent hover:bg-purple-accent/90 text-white px-6"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? 'Atualizando...' : 'Salvando...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Atualizar Notificação' : 'Salvar Notificação'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
