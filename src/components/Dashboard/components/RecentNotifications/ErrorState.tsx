
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  showAll: boolean;
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ showAll, error, onRetry }: ErrorStateProps) => {
  return (
    <Card className="card-modern border-red-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <Bell className="w-5 h-5 text-red-400" />
          Erro ao carregar notificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-red-400">{error}</span>
          <Button 
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
