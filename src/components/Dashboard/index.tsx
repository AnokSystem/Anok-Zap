
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, TrendingUp, Users } from 'lucide-react';
import { DashboardStats } from './components/DashboardStats';
import { RecentDisparos } from './components/RecentDisparos';
import { RecentNotifications } from './components/RecentNotifications';
import { DisparosChart } from './components/DisparosChart';
import { NotificationsChart } from './components/NotificationsChart';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="disparos" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Disparos
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
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
