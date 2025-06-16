
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Bell, TrendingUp } from 'lucide-react';

export const NotificationsChart = () => {
  // Dados mock para demonstração
  const data = [
    { date: '01/01', hotmart: 15, eduzz: 8, monetizze: 3 },
    { date: '02/01', hotmart: 22, eduzz: 12, monetizze: 5 },
    { date: '03/01', hotmart: 18, eduzz: 15, monetizze: 7 },
    { date: '04/01', hotmart: 28, eduzz: 10, monetizze: 4 },
    { date: '05/01', hotmart: 20, eduzz: 18, monetizze: 6 },
    { date: '06/01', hotmart: 25, eduzz: 14, monetizze: 8 },
    { date: '07/01', hotmart: 30, eduzz: 16, monetizze: 5 }
  ];

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

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <Bell className="w-5 h-5 text-green-400" />
          Notificações por Plataforma
          <div className="ml-auto flex items-center gap-1 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+8%</span>
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
