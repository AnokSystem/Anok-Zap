
import React from 'react';
import { DashboardGuard } from '@/components/Dashboard/DashboardGuard';
import { DashboardStats } from '@/components/Dashboard/components/DashboardStats';
import { DisparosChart } from '@/components/Dashboard/components/DisparosChart';
import { NotificationsChart } from '@/components/Dashboard/components/NotificationsChart';
import { RecentDisparos } from '@/components/Dashboard/components/RecentDisparos';

const Dashboard = () => {
  return (
    <DashboardGuard>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-contrast mb-2">
            Dashboard Pessoal
          </h1>
          <p className="text-gray-400">
            Acompanhe suas métricas e atividades em tempo real
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DisparosChart />
          <NotificationsChart />
        </div>

        {/* Recent Activity */}
        <RecentDisparos />
      </div>
    </DashboardGuard>
  );
};

export default Dashboard;
