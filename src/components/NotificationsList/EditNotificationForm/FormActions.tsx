
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, RefreshCw } from 'lucide-react';

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isFormValid: boolean;
}

export const FormActions = ({ onSave, onCancel, isLoading, isFormValid }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600/30">
      <Button
        onClick={onCancel}
        variant="ghost"
        disabled={isLoading}
        className="text-gray-400 hover:text-gray-200"
      >
        Cancelar
      </Button>
      <Button 
        onClick={onSave}
        disabled={isLoading || !isFormValid}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </>
        )}
      </Button>
    </div>
  );
};
