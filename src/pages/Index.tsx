
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
      label: 'Disparo',
      icon: MessageSquare,
      description: 'Envie mensagens para múltiplos contatos'
    },
    {
      id: 'contacts',
      label: 'Contatos',
      icon: Users,
      description: 'Gerencie seus contatos e grupos'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      description: 'Configure alertas inteligentes'
    },
    {
      id: 'instances',
      label: 'Config',
      icon: Settings,
      description: 'Configurações do WhatsApp'
    },
    {
      id: 'status',
      label: 'Status',
      icon: Activity,
      description: 'Status das integrações'
    }
  ];

  const activeTabInfo = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-dark relative">
      {/* Header Minimalista */}
      <header className="header-gradient border-b border-purple-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-purple">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-montserrat font-bold text-primary-contrast">
                  Anok Zap
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Sistema Avançado de Automação WhatsApp
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 rounded-full gradient-primary text-white text-sm font-semibold shadow-purple">
                Pro
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Cards com Grid Simétrico */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid-nav spacing-section">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-card ${isActive ? 'active' : ''} animate-scale-in`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-purple-primary/10">
                    <Icon className="nav-icon" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="nav-label mb-1">
                      {tab.label}
                    </h3>
                    <p className="text-xs text-muted-foreground hidden md:block leading-tight">
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Section Header */}
        {activeTabInfo && (
          <div className="spacing-section animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <activeTabInfo.icon className="w-6 h-6 text-purple" />
              <h2 className="text-2xl font-montserrat font-bold text-primary-contrast">{activeTabInfo.label}</h2>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">{activeTabInfo.description}</p>
          </div>
        )}

        {/* Content Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="animate-fade-in-up">
            <TabsContent value="mass-messaging" className="mt-0">
              <div className="card-section">
                <MassMessaging />
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-0">
              <div className="card-section">
                <ContactManagement />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="card-section">
                <IntelligentNotifications />
              </div>
            </TabsContent>

            <TabsContent value="instances" className="mt-0">
              <div className="card-section">
                <InstanceManagement />
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-0">
              <div className="card-section">
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
