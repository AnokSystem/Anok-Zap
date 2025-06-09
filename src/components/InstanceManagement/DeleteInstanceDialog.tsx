
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteInstanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  instanceName: string;
}

const DeleteInstanceDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  instanceName 
}: DeleteInstanceDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-800 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-200">
            Confirmar Exclusão de Instância
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Tem certeza que deseja excluir a instância:
            <br />
            <span className="font-mono text-sm text-purple-accent font-semibold">
              {instanceName}
            </span>
            <br />
            <br />
            Esta ação não pode ser desfeita e a instância será permanentemente removida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Excluir Instância
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteInstanceDialog;
