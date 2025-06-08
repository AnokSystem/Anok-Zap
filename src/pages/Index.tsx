
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Settings, Bell, Activity, Zap } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <div className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 gradient-purple rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 w-12 h-12 gradient-purple rounded-xl blur-xl opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text-purple">Anok Zap</h1>
                <p className="text-sm text-muted-foreground">Sistema completo de automação WhatsApp</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="px-3 py-1 rounded-full bg-gradient-purple text-white text-xs font-medium">
                Pro
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 p-1 rounded-2xl">
            <TabsTrigger 
              value="mass-messaging" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-purple data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Disparo em Massa</span>
              <span className="sm:hidden">Disparo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contacts" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-purple data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Users className="w-4 h-4" />
              <span>Contatos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-purple data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Notif.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="instances" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-purple data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Instâncias</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
            <TabsTrigger 
              value="status" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-purple data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Activity className="w-4 h-4" />
              <span>Status</span>
            </TabsTrigger>
          </TabsList>

          <div className="animate-fade-in">
            <TabsContent value="mass-messaging" className="mt-8">
              <div className="card-modern rounded-2xl p-1">
                <MassMessaging />
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-8">
              <div className="card-modern rounded-2xl p-1">
                <ContactManagement />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-8">
              <div className="card-modern rounded-2xl p-1">
                <IntelligentNotifications />
              </div>
            </TabsContent>

            <TabsContent value="instances" className="mt-8">
              <div className="card-modern rounded-2xl p-1">
                <InstanceManagement />
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-8">
              <div className="card-modern rounded-2xl p-1">
                <IntegrationStatus />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default Index;
