
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, User, Lock } from 'lucide-react';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export const DashboardGuard: React.FC<DashboardGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="card-modern max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Verificando autenticação...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated() || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="card-modern max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary-contrast mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-400 mb-4">
              Você precisa estar logado para acessar o dashboard.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Fazer Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userDisplayId = user.id || user.ID || user.user_id || user.Email?.split('@')[0] || 'N/A';

  return (
    <div className="dashboard-container">
      {/* Enhanced User Context Indicator with Security Info */}
      <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-blue-400">
          <User className="w-4 h-4" />
          <span className="text-sm">
            Dashboard de <strong>{user.Nome || user.Email}</strong>
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Lock className="w-3 h-3 text-green-400" />
            <span className="text-xs text-gray-400">
              ID: {userDisplayId}
            </span>
            <span className="text-xs text-green-400">
              Dados Privados
            </span>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
};
