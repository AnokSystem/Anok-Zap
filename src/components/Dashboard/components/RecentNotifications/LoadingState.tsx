
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from 'lucide-react';

interface LoadingStateProps {
  showAll: boolean;
}

export const LoadingState = ({ showAll }: LoadingStateProps) => {
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-contrast">
          <Bell className="w-5 h-5 text-green-400" />
          {showAll ? 'Todas as Notificações' : 'Notificações Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
