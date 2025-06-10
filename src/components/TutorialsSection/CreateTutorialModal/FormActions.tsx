
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';

interface FormActionsProps {
  onClose: () => void;
  uploading: boolean;
  isFormValid: boolean;
  submitText?: string;
}

const FormActions = ({ onClose, uploading, isFormValid, submitText = "Criar Tutorial" }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={uploading}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={!isFormValid || uploading}
        className="btn-primary"
      >
        {uploading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            {submitText.includes("Atualizar") ? "Atualizando..." : "Criando..."}
          </>
        ) : (
          submitText
        )}
      </Button>
    </div>
  );
};

export default FormActions;
