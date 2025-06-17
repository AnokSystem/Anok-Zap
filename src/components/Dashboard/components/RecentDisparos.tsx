
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, RefreshCw } from 'lucide-react';
import { useAdvancedDisparos } from '../hooks/useAdvancedDisparos';
import { LoadingState } from './RecentDisparos/LoadingState';
import { ErrorState } from './RecentDisparos/ErrorState';
import { EmptyState } from './RecentDisparos/EmptyState';
import { DisparosTable } from './RecentDisparos/DisparosTable';

interface RecentDisparosProps {
  showAll?: boolean;
}

export const RecentDisparos = ({ showAll = false }: RecentDisparosProps) => {
  const { 
    disparos, 
    isLoading, 
    error, 
    refetch
  } = useAdvancedDisparos();

  const displayDisparos = showAll ? disparos : disparos.slice(0, 10);

  if (isLoading) {
    return <LoadingState showAll={showAll} />;
  }

  if (error) {
    return <ErrorState showAll={showAll} onRetry={refetch} />;
  }

  return (
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
          <EmptyState hasFilters={false} onClearFilters={() => {}} />
        ) : (
          <DisparosTable disparos={displayDisparos} />
        )}
      </CardContent>
    </Card>
  );
};
