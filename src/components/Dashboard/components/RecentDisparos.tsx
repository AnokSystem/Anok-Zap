
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Eye, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { useAdvancedDisparos } from '../hooks/useAdvancedDisparos';
import { DashboardFilters } from './DashboardFilters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentDisparosProps {
  showAll?: boolean;
}

export const RecentDisparos = ({ showAll = false }: RecentDisparosProps) => {
  const { 
    disparos, 
    isLoading, 
    error, 
    filters,
    updateFilters,
    clearFilters,
    refetch,
    hasFilters
  } = useAdvancedDisparos();

  const displayDisparos = showAll ? disparos : disparos.slice(0, 10);

  // Função para calcular contatos que receberam mensagens
  const getContactsReached = (disparo: any) => {
    // Para status 'concluido', todos os contatos receberam
    if (disparo.status === 'concluido') {
      return disparo.recipientCount;
    }
    
    // Para status 'enviando', usar o sentCount como base para contatos alcançados
    if (disparo.status === 'enviando') {
      // Se há mensagens múltiplas, dividir pelo número aproximado de mensagens por contato
      // Baseado nos dados do console, parece que cada contato recebe todas as mensagens da campanha
      return Math.min(disparo.sentCount || 0, disparo.recipientCount);
    }
    
    // Para 'erro' ou 'cancelado', verificar se há contatos que receberam antes do erro
    if (disparo.status === 'erro' || disparo.status === 'cancelado') {
      return Math.min(disparo.sentCount || 0, disparo.recipientCount);
    }
    
    // Para 'pendente', nenhum contato recebeu ainda
    if (disparo.status === 'pendente') {
      return 0;
    }
    
    // Default: usar sentCount limitado pelo recipientCount
    return Math.min(disparo.sentCount || 0, disparo.recipientCount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Concluído</Badge>;
      case 'enviando':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Enviando</Badge>;
      case 'enviado':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enviado</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case 'erro':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro</Badge>;
      case 'cancelado':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'enviado':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'enviando':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = (disparo: any) => {
    const contactsReached = getContactsReached(disparo);
    const totalContacts = disparo.recipientCount || 1;
    return Math.round((contactsReached / totalContacts) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showAll && (
          <DashboardFilters
            type="disparos"
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            hasFilters={hasFilters}
          />
        )}
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {showAll && (
          <DashboardFilters
            type="disparos"
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            hasFilters={hasFilters}
          />
        )}
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
              <Button
                variant="outline"
                onClick={refetch}
                className="mt-4 border-gray-600 hover:border-gray-500"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showAll && (
        <DashboardFilters
          type="disparos"
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          hasFilters={hasFilters}
        />
      )}
      
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            {showAll ? 'Todos os Disparos' : 'Disparos Recentes'}
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {disparos.length} registros
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetch}
                className="text-gray-400 hover:text-primary-contrast"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayDisparos.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {hasFilters ? 'Nenhum disparo encontrado com os filtros aplicados' : 'Nenhum disparo encontrado'}
              </p>
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4 border-gray-600 hover:border-gray-500"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Campanha</TableHead>
                    <TableHead className="text-gray-300">Instância</TableHead>
                    <TableHead className="text-gray-300">Destinatários</TableHead>
                    <TableHead className="text-gray-300">Contatos Alcançados</TableHead>
                    <TableHead className="text-gray-300">Progresso</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayDisparos.map((disparo) => {
                    const contactsReached = getContactsReached(disparo);
                    const progressPercentage = getProgressPercentage(disparo);
                    
                    return (
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
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-400" />
                            {disparo.recipientCount} contatos
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-400">
                              {contactsReached}/{disparo.recipientCount}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                progressPercentage === 100 
                                  ? 'border-green-500/30 text-green-400' 
                                  : progressPercentage > 0 
                                    ? 'border-blue-500/30 text-blue-400'
                                    : 'border-gray-500/30 text-gray-400'
                              }`}
                            >
                              {progressPercentage}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progressPercentage === 100 
                                  ? 'bg-green-500' 
                                  : progressPercentage > 0 
                                    ? 'bg-blue-500'
                                    : 'bg-gray-600'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
