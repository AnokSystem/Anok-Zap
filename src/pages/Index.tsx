
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Settings, Bell, Activity, Zap, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import MassMessaging from '@/components/MassMessaging';
import ContactManagement from '@/components/ContactManagement';
import InstanceManagement from '@/components/InstanceManagement';
import IntelligentNotifications from '@/components/IntelligentNotifications';
import IntegrationStatus from '@/components/IntegrationStatus';

const Index = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'mass-messaging');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const tabs = [
    {
      id: 'mass-messaging',
      label: 'Disparo em Massa',
      shortLabel: 'Disparo',
      icon: MessageSquare,
      description: 'Envie mensagens para múltiplos contatos',
      highlightColor: 'text-highlight-cyan'
    },
    {
      id: 'contacts',
      label: 'Contatos',
      shortLabel: 'Contatos',
      icon: Users,
      description: 'Gerencie seus contatos e grupos',
      highlightColor: 'text-highlight-emerald'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      shortLabel: 'Notif.',
      icon: Bell,
      description: 'Configure alertas inteligentes',
      highlightColor: 'text-highlight-amber'
    },
    {
      id: 'instances',
      label: 'Instâncias',
      shortLabel: 'Config',
      icon: Settings,
      description: 'Configurações do WhatsApp',
      highlightColor: 'text-highlight-rose'
    },
    {
      id: 'status',
      label: 'Status',
      shortLabel: 'Status',
      icon: Activity,
      description: 'Status das integrações',
      highlightColor: 'text-purple-400'
    }
  ];

  const activeTabInfo = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Header Futurístico */}
      <header className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-14 h-14 gradient-primary rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                  Anok Zap
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Sistema Avançado de Automação WhatsApp
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 rounded-full gradient-primary text-white text-sm font-semibold shadow-md border border-white/15">
                Pro
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-102
                  ${isActive 
                    ? 'card-futuristic border-purple-500/30 shadow-lg' 
                    : 'glass-morphism hover:border-purple-500/20'
                  }
                `}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive 
                      ? 'gradient-primary shadow-md' 
                      : 'bg-muted/50 group-hover:bg-purple-600/15'
                    }
                  `}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-purple-400'}`} />
                  </div>
                  
                  <div className="text-center">
                    <h3 className={`
                      font-semibold text-sm mb-1 transition-colors
                      ${isActive ? `${tab.highlightColor} font-bold` : 'text-foreground group-hover:text-purple-400'}
                    `}>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground hidden md:block leading-tight">
                      {tab.description}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-purple-800/10 animate-pulse-glow"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Section Header */}
        {activeTabInfo && (
          <div className="mb-8 animate-slide-in">
            <div className="flex items-center space-x-3 mb-2">
              <activeTabInfo.icon className={`w-6 h-6 ${activeTabInfo.highlightColor}`} />
              <h2 className="text-2xl font-bold text-foreground">{activeTabInfo.label}</h2>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{activeTabInfo.description}</p>
          </div>
        )}

        {/* Content Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="animate-slide-in">
            <TabsContent value="mass-messaging" className="mt-0">
              <div className="card-futuristic p-1">
                <MassMessaging />
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-0">
              <div className="card-futuristic p-1">
                <ContactManagement />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="card-futuristic p-1">
                <IntelligentNotifications />
              </div>
            </TabsContent>

            <TabsContent value="instances" className="mt-0">
              <div className="card-futuristic p-1">
                <InstanceManagement />
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-0">
              <div className="card-futuristic p-1">
                <IntegrationStatus />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
