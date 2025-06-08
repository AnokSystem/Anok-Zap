
import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationHeaderProps {
  isEditing: boolean;
}

export const NotificationHeader = ({ isEditing }: NotificationHeaderProps) => {
  return (
    <div className="text-center pb-6 border-b border-white/10">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-primary-contrast">
          {isEditing ? 'Editar Notificação' : 'Notificações Inteligentes'}
        </h3>
      </div>
      <p className="text-gray-400 text-lg">
        {isEditing 
          ? 'Modifique os campos desejados e salve as alterações no banco de dados'
          : 'Configure notificações automáticas baseadas em eventos das plataformas de venda'
        }
      </p>
    </div>
  );
};
