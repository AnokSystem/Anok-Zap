
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bell, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const DashboardStats = () => {
  const { stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: 'Total de Disparos',
      value: stats?.totalDisparos || 0,
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: 'Mensagens enviadas hoje'
    },
    {
      title: 'Notificações Ativas',
      value: stats?.totalNotifications || 0,
      icon: Bell,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: 'Webhooks recebidos hoje'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${stats?.successRate || 0}%`,
      icon: CheckCircle2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: 'Entregas bem-sucedidas'
    },
    {
      title: 'Contatos Únicos',
      value: stats?.uniqueContacts || 0,
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      description: 'Contatos alcançados'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title} className="card-modern hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${card.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary-contrast">
                  {card.value}
                </h3>
                <p className="text-sm font-medium text-gray-300">
                  {card.title}
                </p>
                <p className="text-xs text-gray-400">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
