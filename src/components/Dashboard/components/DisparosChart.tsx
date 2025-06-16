
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp } from 'lucide-react';

export const DisparosChart = () => {
  // Dados mock para demonstração
  const data = [
    { date: '01/01', disparos: 120, sucesso: 115 },
    { date: '02/01', disparos: 150, sucesso: 145 },
    { date: '03/01', disparos: 180, sucesso: 175 },
    { date: '04/01', disparos: 220, sucesso: 210 },
    { date: '05/01', disparos: 160, sucesso: 155 },
    { date: '06/01', disparos: 190, sucesso: 185 },
    { date: '07/01', disparos: 240, sucesso: 235 }
  ];

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

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Disparos nos Últimos 7 Dias
          <div className="ml-auto flex items-center gap-1 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12%</span>
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
