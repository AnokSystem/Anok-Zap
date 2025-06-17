
import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap, LogOut, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

export const AppHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    navigate('/login');
  };

  return (
    <header className="header-modern sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-gradient text-4xl font-bold">Anok Zap</h1>
              <p className="text-lg text-gray-400 font-medium">
                Sistema Completo de Automação WhatsApp
              </p>
            </div>
          </div>

          {/* User info, theme toggle and logout */}
          <div className="flex items-center space-x-4">
            <div className="card-modern flex items-center space-x-4 px-6 py-3 gradient-subtle border border-purple-light/20 backdrop-blur-lg">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-purple">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary-contrast">
                  {user?.Nome}
                </span>
                <span className="text-xs text-gray-400">
                  {user?.Email}
                </span>
              </div>
            </div>
            
            <ThemeToggle />
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="card-modern border-purple-light/30 hover:border-purple-light/50 bg-gray-800/50 text-primary-contrast hover:bg-gradient-primary hover:text-white transition-all duration-300 shadow-purple hover:shadow-purple-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
