
import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import NotificationsList from '@/components/NotificationsList';

const Notifications = () => {
  const navigate = useNavigate();

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-fade-in-up">
          <NotificationsList />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
