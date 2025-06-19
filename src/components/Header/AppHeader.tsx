
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
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-gradient text-3xl font-bold">Anok Zap</h1>
              <p className="text-base text-gray-400 font-medium">
                Sistema Completo de Automação WhatsApp
              </p>
            </div>
          </div>

          {/* Bloco Unificado do Usuário */}
          <div className="flex items-center space-x-4 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            {/* Informações do Usuário */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary-contrast leading-tight">
                  {user?.Nome}
                </span>
                <span className="text-xs text-gray-400 leading-tight">
                  {user?.Email}
                </span>
              </div>
            </div>
            
            {/* Separador */}
            <div className="w-px h-8 bg-gray-600/50"></div>
            
            {/* Toggle do Tema */}
            <ThemeToggle />
            
            {/* Separador */}
            <div className="w-px h-8 bg-gray-600/50"></div>
            
            {/* Botão de Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-red-500/10 text-primary-contrast hover:text-red-400 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
