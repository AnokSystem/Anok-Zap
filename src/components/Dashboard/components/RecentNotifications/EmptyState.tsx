
import React from 'react';
import { Bell } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="text-center py-8">
      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-300 mb-2">
        Nenhuma notificação encontrada
      </h3>
      <p className="text-gray-400">
        Aguardando novas notificações das plataformas...
      </p>
    </div>
  );
};
