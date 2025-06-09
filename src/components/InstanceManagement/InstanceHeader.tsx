
import React from 'react';
import { Smartphone } from 'lucide-react';

interface InstanceHeaderProps {
  userName?: string;
}

const InstanceHeader = ({ userName }: InstanceHeaderProps) => {
  return (
    <div className="text-center pb-6 border-b border-white/10">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-primary-contrast">Gerenciamento de Instâncias</h3>
      </div>
      <p className="text-gray-400 text-lg">
        Configure e monitore suas instâncias do WhatsApp
        {userName && ` - ${userName}`}
      </p>
    </div>
  );
};

export default InstanceHeader;
