
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useRecentDisparos } from '../hooks/useRecentDisparos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentDisparosProps {
  showAll?: boolean;
}

export const RecentDisparos = ({ showAll = false }: RecentDisparosProps) => {
  const { disparos, isLoading, error } = useRecentDisparos(showAll ? 50 : 10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enviado</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case 'erro':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            {showAll ? 'Todos os Disparos' : 'Disparos Recentes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
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
            {showAll ? 'Todos os Disparos' : 'Disparos Recentes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-400">Erro ao carregar disparos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          {showAll ? 'Todos os Disparos' : 'Disparos Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {disparos.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum disparo encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Campanha</TableHead>
                  <TableHead className="text-gray-300">Instância</TableHead>
                  <TableHead className="text-gray-300">Destinatários</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Data</TableHead>
                  <TableHead className="text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disparos.map((disparo) => (
                  <TableRow key={disparo.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(disparo.status)}
                        <span className="font-medium text-primary-contrast">
                          {disparo.campaignName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {disparo.instanceName}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {disparo.recipientCount} contatos
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(disparo.status)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(disparo.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-primary-contrast"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
