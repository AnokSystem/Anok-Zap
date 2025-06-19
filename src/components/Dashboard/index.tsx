
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bell, TrendingUp, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { DashboardStats } from './components/DashboardStats';
import { RecentDisparos } from './components/RecentDisparos';
import { RecentNotifications } from './components/RecentNotifications';
import { DisparosChart } from './components/DisparosChart';
import { NotificationsChart } from './components/NotificationsChart';
import { useDashboardInitialization } from './hooks/useDashboardInitialization';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isInitialized, isInitializing, initError, retryInitialization } = useDashboardInitialization();

  if (isInitializing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Inicializando conexão com NocoDB...
            </p>
          </div>
        </div>

        <Card className="card-modern">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-4">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-primary-contrast">
                  Configurando Dashboard
                </h3>
                <p className="text-gray-400">
                  Verificando e criando tabelas necessárias...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initError && !isInitialized) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Erro na inicialização
            </p>
          </div>
        </div>

        <Card className="card-modern border-red-500/20">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">
                  Erro de Inicialização
                </h3>
                <p className="text-gray-400">
                  {initError}
                </p>
              </div>
            </div>
            <Button
              onClick={retryInitialization}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Acompanhe todos os disparos e notificações em tempo real
          </p>
        </div>
        {isInitialized && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Banco de Dados Conectado</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900 data-[theme=light]:bg-gray-100 data-[theme=light]:border data-[theme=light]:border-gray-200 data-[theme=dark]:bg-gray-900 data-[theme=dark]:border data-[theme=dark]:border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[theme=light]:data-[state=active]:bg-purple-500 data-[theme=dark]:data-[state=active]:bg-purple-600 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300"
          >
            <TrendingUp className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="disparos" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[theme=light]:data-[state=active]:bg-purple-500 data-[theme=dark]:data-[state=active]:bg-purple-600 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300"
          >
            <MessageSquare className="w-4 h-4" />
            Disparos
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[theme=light]:data-[state=active]:bg-purple-500 data-[theme=dark]:data-[state=active]:bg-purple-600 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300"
          >
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DisparosChart />
            <NotificationsChart />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentDisparos />
            <RecentNotifications />
          </div>
        </TabsContent>

        <TabsContent value="disparos" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <DisparosChart />
            <RecentDisparos showAll={true} />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <NotificationsChart />
            <RecentNotifications showAll={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
