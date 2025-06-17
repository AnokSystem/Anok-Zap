
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Users, Bell, MessageSquare, Zap, LogOut, User, BookOpen, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import MassMessaging from '@/components/MassMessaging';
import ContactManagement from '@/components/ContactManagement';
import IntelligentNotifications from '@/components/IntelligentNotifications';
import InstanceManagement from '@/components/InstanceManagement';
import ExtrasSection from '@/components/ExtrasSection';
import ThemeToggle from '@/components/ThemeToggle';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

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
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Acompanhe disparos e notificações',
      icon: TrendingUp,
      gradient: 'gradient-primary',
      active: activeTab === 'dashboard'
    },
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
      gradient: 'gradient-primary',
      active: activeTab === 'contact-management'
    },
    {
      id: 'intelligent-notifications',
      title: 'Notificações',
      subtitle: 'Configure alertas inteligentes',
      icon: Bell,
      gradient: 'gradient-primary',
      active: activeTab === 'intelligent-notifications'
    },
    {
      id: 'instance-management',
      title: 'Config',
      subtitle: 'Configurações do WhatsApp',
      icon: Settings,
      gradient: 'gradient-primary',
      active: activeTab === 'instance-management'
    },
    {
      id: 'extras',
      title: 'Extras',
      subtitle: 'Funções adicionais e tutoriais',
      icon: BookOpen,
      gradient: 'gradient-primary',
      active: activeTab === 'extras'
    }
  ];

  function renderTabContent() {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'mass-messaging':
        return <MassMessaging />;
      case 'contact-management':
        return <ContactManagement />;
      case 'intelligent-notifications':
        return <IntelligentNotifications />;
      case 'instance-management':
        return <InstanceManagement />;
      case 'extras':
        return <ExtrasSection />;
      default:
        return <Dashboard />;
    }
  }

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-fade-in-up">
          {/* Navigation Cards Grid - Single horizontal line */}
          <div className="flex justify-center gap-3 mb-12 overflow-x-auto">
            {navigationCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`nav-card ${card.active ? 'active' : ''} flex-shrink-0`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex flex-col items-center text-center space-y-2 p-3 min-w-[120px]">
                    <div className={`w-10 h-10 ${card.gradient} rounded-xl flex items-center justify-center shadow-purple`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="nav-label text-xs font-bold">{card.title}</h3>
                      <p className="text-xs text-gray-400 leading-tight text-center max-w-[100px]">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
