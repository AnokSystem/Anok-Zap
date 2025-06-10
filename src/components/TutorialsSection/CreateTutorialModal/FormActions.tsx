
import React from 'react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClose: () => void;
  uploading: boolean;
  isFormValid: boolean;
}

const FormActions = ({ onClose, uploading, isFormValid }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={uploading}
        className="border-gray-600"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={uploading || !isFormValid}
        className="btn-primary"
      >
        {uploading ? 'Criando...' : 'Criar Tutorial'}
      </Button>
    </div>
  );
};

export default FormActions;
