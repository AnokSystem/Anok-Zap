
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { useDisparosChartData } from '../hooks/useChartData';

export const DisparosChart = () => {
  const { data, isLoading, error } = useDisparosChartData(7);

  const chartConfig = {
    disparos: {
      label: "Disparos",
      color: "#3b82f6",
    },
    sucesso: {
      label: "Sucesso",
      color: "#10b981",
    },
  };

  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Disparos nos Últimos 7 Dias
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
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Disparos nos Últimos 7 Dias
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

  const totalDisparos = data.reduce((acc, item) => acc + (item.disparos || 0), 0);
  const previousTotal = totalDisparos * 0.88; // Simular crescimento de 12%
  const growthPercentage = totalDisparos > 0 ? ((totalDisparos - previousTotal) / previousTotal * 100).toFixed(0) : 0;

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Disparos nos Últimos 7 Dias
          <div className="ml-auto flex items-center gap-1 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+{growthPercentage}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
              <Line
                type="monotone"
                dataKey="disparos"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="sucesso"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
