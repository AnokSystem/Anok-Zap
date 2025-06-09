import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Users, Bell, MessageSquare, Zap, Server, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import ContactManagement from '@/components/ContactManagement';
import MassMessaging from '@/components/MassMessaging';
import IntelligentNotifications from '@/components/IntelligentNotifications';
import InstanceManagement from '@/components/InstanceManagement';
import IntegrationStatus from '@/components/IntegrationStatus';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('contact-management');

  useEffect(() => {
    // Check if there's a tab in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');

    // If there's a tab in the URL and it's different from the active tab, update the active tab
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    navigate('/login');
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'contact-management':
        return <Users className="w-4 h-4" />;
      case 'mass-messaging':
        return <MessageSquare className="w-4 h-4" />;
      case 'intelligent-notifications':
        return <Bell className="w-4 h-4" />;
      case 'instance-management':
        return <Server className="w-4 h-4" />;
      case 'integration-status':
        return <Settings className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-800/50 border border-gray-700/50 p-1">
              <TabsTrigger 
                value="contact-management" 
                className="flex items-center space-x-2 data-[state=active]:bg-purple-accent data-[state=active]:text-white"
              >
                {getTabIcon('contact-management')}
                <span className="hidden sm:inline">Contatos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="mass-messaging" 
                className="flex items-center space-x-2 data-[state=active]:bg-purple-accent data-[state=active]:text-white"
              >
                {getTabIcon('mass-messaging')}
                <span className="hidden sm:inline">Disparos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="intelligent-notifications" 
                className="flex items-center space-x-2 data-[state=active]:bg-purple-accent data-[state=active]:text-white"
              >
                {getTabIcon('intelligent-notifications')}
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="instance-management" 
                className="flex items-center space-x-2 data-[state=active]:bg-purple-accent data-[state=active]:text-white"
              >
                {getTabIcon('instance-management')}
                <span className="hidden sm:inline">Instâncias</span>
              </TabsTrigger>
              <TabsTrigger 
                value="integration-status" 
                className="flex items-center space-x-2 data-[state=active]:bg-purple-accent data-[state=active]:text-white"
              >
                {getTabIcon('integration-status')}
                <span className="hidden sm:inline">Integrações</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contact-management" className="mt-6">
              <ContactManagement />
            </TabsContent>
            
            <TabsContent value="mass-messaging" className="mt-6">
              <MassMessaging />
            </TabsContent>
            
            <TabsContent value="intelligent-notifications" className="mt-6">
              <IntelligentNotifications />
            </TabsContent>
            
            <TabsContent value="instance-management" className="mt-6">
              <InstanceManagement />
            </TabsContent>
            
            <TabsContent value="integration-status" className="mt-6">
              <IntegrationStatus />
            </TabsContent>
          </Tabs>

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

const getTabIcon = (tab: string) => {
  switch (tab) {
    case 'contact-management':
      return <Users className="w-4 h-4" />;
    case 'mass-messaging':
      return <MessageSquare className="w-4 h-4" />;
    case 'intelligent-notifications':
      return <Bell className="w-4 h-4" />;
    case 'instance-management':
      return <Server className="w-4 h-4" />;
    case 'integration-status':
      return <Settings className="w-4 h-4" />;
    default:
      return <Users className="w-4 h-4" />;
  }
};

export default Index;
