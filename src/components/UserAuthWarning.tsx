
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User } from 'lucide-react';

const UserAuthWarning = () => {
  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <Shield className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-200">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>Você precisa estar logado para acessar suas instâncias do WhatsApp.</span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UserAuthWarning;
