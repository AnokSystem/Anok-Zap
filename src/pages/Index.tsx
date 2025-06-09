
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Users, Bell, MessageSquare, Zap, Server, LogOut, User, Activity } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import MassMessaging from '@/components/MassMessaging';
import ContactManagement from '@/components/ContactManagement';
import IntelligentNotifications from '@/components/IntelligentNotifications';
import InstanceManagement from '@/components/InstanceManagement';
import IntegrationStatus from '@/components/IntegrationStatus';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('mass-messaging');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    navigate('/login');
  };

  const handleCardClick = (tab: string) => {
    setActiveTab(tab);
    const urlParams = new URLSearchParams();
    urlParams.set('tab', tab);
    setSearchParams(urlParams);
  };

  const navigationCards = [
    {
      id: 'mass-messaging',
      title: 'Disparo',
      subtitle: 'Envie mensagens para múltiplos contatos',
      icon: MessageSquare,
      gradient: 'gradient-primary',
      active: activeTab === 'mass-messaging'
    },
    {
      id: 'contact-management',
      title: 'Contatos',
      subtitle: 'Gerencie seus contatos e grupos',
      icon: Users,
      gradient: 'gradient-secondary',
      active: activeTab === 'contact-management'
    },
    {
      id: 'intelligent-notifications',
      title: 'Notificações',
      subtitle: 'Configure alertas inteligentes',
      icon: Bell,
      gradient: 'gradient-subtle',
      active: activeTab === 'intelligent-notifications'
    },
    {
      id: 'instance-management',
      title: 'Config',
      subtitle: 'Configurações do WhatsApp',
      icon: Settings,
      gradient: 'gradient-card',
      active: activeTab === 'instance-management'
    },
    {
      id: 'integration-status',
      title: 'Status',
      subtitle: 'Status das integrações',
      icon: Activity,
      gradient: 'gradient-form',
      active: activeTab === 'integration-status'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mass-messaging':
        return <MassMessaging />;
      case 'contact-management':
        return <ContactManagement />;
      case 'intelligent-notifications':
        return <IntelligentNotifications />;
      case 'instance-management':
        return <InstanceManagement />;
      case 'integration-status':
        return <IntegrationStatus />;
      default:
        return <MassMessaging />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Header with user info and logout */}
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

            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
                <User className="w-5 h-5 text-purple-accent" />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-200">{user?.Nome}</p>
                  <p className="text-xs text-gray-400">{user?.Email}</p>
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-fade-in-up">
          {/* Navigation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {navigationCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`nav-card ${card.active ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 ${card.gradient} rounded-2xl flex items-center justify-center shadow-purple`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="nav-label text-lg font-bold">{card.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {renderTabContent()}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => navigate('/notifications')}
              variant="secondary"
              size="lg"
              className="bg-gray-800/50 border border-gray-600/50 text-gray-200 hover:bg-gray-700/50"
            >
              <Bell className="w-5 h-5 mr-2" />
              Ver Todas as Notificações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
