
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Settings, Bell, Activity, Zap, ChevronRight, Sparkles } from 'lucide-react';
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
      description: 'Envie mensagens para múltiplos contatos',
      color: 'text-purple-400'
    },
    {
      id: 'contacts',
      label: 'Contatos',
      icon: Users,
      description: 'Gerencie seus contatos e grupos',
      color: 'text-blue-400'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      description: 'Configure alertas inteligentes',
      color: 'text-emerald-400'
    },
    {
      id: 'instances',
      label: 'Config',
      icon: Settings,
      description: 'Configurações do WhatsApp',
      color: 'text-orange-400'
    },
    {
      id: 'status',
      label: 'Status',
      icon: Activity,
      description: 'Status das integrações',
      color: 'text-cyan-400'
    }
  ];

  const activeTabInfo = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Header Moderno */}
      <header className="header-modern sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-gradient text-5xl font-bold">
                  Anok Zap
                </h1>
                <p className="text-lg text-gray-400 font-medium">
                  Sistema Avançado de Automação WhatsApp
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-6 py-2 rounded-full gradient-primary text-white text-sm font-semibold shadow-lg">
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Pro</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Grid */}
        <div className="grid-nav spacing-section">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group nav-card ${isActive ? 'active' : ''} animate-scale-in`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-white/10' : 'bg-purple-500/10'
                  }`}>
                    <Icon className="nav-icon" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="nav-label mb-2 text-base">
                      {tab.label}
                    </h3>
                    <p className="text-xs text-gray-500 hidden md:block leading-relaxed max-w-32">
                      {tab.description}
                    </p>
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-20 bg-gradient-to-br from-purple-400 to-purple-600"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Section Header */}
        {activeTabInfo && (
          <div className="spacing-section animate-fade-in-up">
            <div className="card-glass p-8 rounded-2xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                  <activeTabInfo.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-primary-contrast">
                    {activeTabInfo.label}
                  </h2>
                  <p className="text-gray-400 text-lg mt-1">
                    {activeTabInfo.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
              </div>
            </div>
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
