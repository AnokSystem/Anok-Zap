
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp, RefreshCw } from 'lucide-react';
import { useDisparosChartData } from '../hooks/useChartData';

export const DisparosChart = () => {
  const { data, isLoading, error, refetch } = useDisparosChartData(7);

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
            <RefreshCw className="w-4 h-4 ml-auto animate-spin text-blue-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Carregando dados reais...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-modern border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <MessageSquare className="w-5 h-5 text-red-400" />
            Disparos nos Últimos 7 Dias
            <button 
              onClick={refetch}
              className="ml-auto p-1 hover:bg-gray-700 rounded"
              title="Tentar novamente"
            >
              <RefreshCw className="w-4 h-4 text-red-400" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
              <button 
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDisparos = data.reduce((acc, item) => acc + (item.disparos || 0), 0);
  const totalSucesso = data.reduce((acc, item) => acc + (item.sucesso || 0), 0);
  const successRate = totalDisparos > 0 ? ((totalSucesso / totalDisparos) * 100).toFixed(1) : '0';

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Disparos nos Últimos 7 Dias
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-gray-400">
              Total: {totalDisparos} | Sucesso: {totalSucesso}
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{successRate}% sucesso</span>
            </div>
            <button 
              onClick={refetch}
              className="p-1 hover:bg-gray-700 rounded"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
              <Line
                type="monotone"
                dataKey="disparos"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 2, fill: "#1e40af" }}
                name="Disparos"
              />
              <Line
                type="monotone"
                dataKey="sucesso"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#10b981", strokeWidth: 2, fill: "#059669" }}
                name="Sucessos"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {totalDisparos === 0 && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm text-center">
              📊 Nenhum disparo registrado nos últimos 7 dias. Inicie uma campanha para ver os dados aqui!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
