
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, X } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Notification } from '../types';

interface FormHeaderProps {
  notification: Notification;
  onCancel: () => void;
}

export const FormHeader = ({ notification, onCancel }: FormHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between text-primary-contrast">
        <div className="flex items-center space-x-2">
          <Edit className="w-5 h-5 text-blue-400" />
          <span>Editando Notificação</span>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            ID: {notification.ID}
          </Badge>
        </div>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardTitle>
      <CardDescription className="text-gray-400">
        Modifique os campos abaixo e clique em salvar para atualizar a notificação
      </CardDescription>
    </CardHeader>
  );
};
