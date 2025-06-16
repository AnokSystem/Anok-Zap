
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Bell, TrendingUp } from 'lucide-react';
import { useNotificationsChartData } from '../hooks/useChartData';

export const NotificationsChart = () => {
  const { data, isLoading, error } = useNotificationsChartData(7);

  const chartConfig = {
    hotmart: {
      label: "Hotmart",
      color: "#8b5cf6",
    },
    eduzz: {
      label: "Eduzz",
      color: "#3b82f6",
    },
    monetizze: {
      label: "Monetizze",
      color: "#10b981",
    },
  };

  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <Bell className="w-5 h-5 text-green-400" />
            Notificações por Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <Bell className="w-5 h-5 text-green-400" />
            Notificações por Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-red-400">Erro ao carregar dados</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalNotifications = data.reduce((acc, item) => 
    acc + (item.hotmart || 0) + (item.eduzz || 0) + (item.monetizze || 0), 0
  );
  const previousTotal = totalNotifications * 0.92; // Simular crescimento de 8%
  const growthPercentage = totalNotifications > 0 ? ((totalNotifications - previousTotal) / previousTotal * 100).toFixed(0) : 0;

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <Bell className="w-5 h-5 text-green-400" />
          Notificações por Plataforma
          <div className="ml-auto flex items-center gap-1 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+{growthPercentage}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="hotmart" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="eduzz" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="monetizze" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
