
import React, { useState, useEffect } from 'react';
import { Bell, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import NotificationsList from '@/components/NotificationsList';

const Notifications = () => {
  const navigate = useNavigate();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoOpenNotification, setAutoOpenNotification] = useState(null);

  useEffect(() => {
    // Verificar se há uma notificação para abrir automaticamente
    const autoOpenData = sessionStorage.getItem('autoOpenNotification');
    if (autoOpenData) {
      try {
        const notification = JSON.parse(autoOpenData);
        setAutoOpenNotification(notification);
        sessionStorage.removeItem('autoOpenNotification');
      } catch (error) {
        console.error('Erro ao processar notificação para abertura automática:', error);
      }
    }
  }, []);

  const handleManualRefresh = () => {
    setLastUpdate(new Date());
    window.dispatchEvent(new CustomEvent('refreshNotifications'));
  };

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Header */}
      <header className="header-modern sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-gradient text-4xl font-bold">
                    Notificações Criadas
                  </h1>
                  <p className="text-lg text-gray-400 font-medium">
                    Visualize e gerencie suas notificações automáticas
                  </p>
                </div>
              </div>
            </div>

            {/* Controles de Atualização */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Agora
              </Button>
              
              <div className="text-sm text-gray-400">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-fade-in-up">
          <NotificationsList 
            key={lastUpdate.getTime()} 
            autoOpenNotification={autoOpenNotification}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
