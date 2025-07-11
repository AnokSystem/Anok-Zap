
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, RefreshCw } from 'lucide-react';

interface InstanceSelectorProps {
  instances: any[];
  selectedInstance: string;
  onInstanceChange: (value: string) => void;
  onRefresh: () => void;
  isLoadingGroups: boolean;
}

export const InstanceSelector = ({
  instances,
  selectedInstance,
  onInstanceChange,
  onRefresh,
  isLoadingGroups
}: InstanceSelectorProps) => {
  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Label className="text-gray-200 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-200">Instância Ativa</Label>
        <Select value={selectedInstance} onValueChange={onInstanceChange}>
          <SelectTrigger className="bg-gray-800 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-800 border-gray-600 data-[theme=light]:border-gray-300 data-[theme=dark]:border-gray-600 text-gray-100 data-[theme=light]:text-gray-900 data-[theme=dark]:text-gray-100">
            <SelectValue placeholder="Escolha uma instância" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-800 border-gray-600 data-[theme=light]:border-gray-300 data-[theme=dark]:border-gray-600">
            {instances.map((instance) => (
              <SelectItem key={instance.id} value={instance.id} className="text-gray-100 data-[theme=light]:text-gray-900 data-[theme=dark]:text-gray-100 focus:bg-gray-700 data-[theme=light]:focus:bg-gray-100 data-[theme=dark]:focus:bg-gray-700">
                <div className="flex items-center gap-2">
                  {instance.name}
                  <span className={`text-xs px-2 py-1 rounded ${
                    instance.status === 'conectado' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {instance.status}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        variant="outline" 
        onClick={onRefresh}
        disabled={!selectedInstance || isLoadingGroups}
        className="bg-gray-800 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-800 border-gray-600 data-[theme=light]:border-gray-300 data-[theme=dark]:border-gray-600 text-gray-100 data-[theme=light]:text-gray-900 data-[theme=dark]:text-gray-100 hover:bg-gray-700 data-[theme=light]:hover:bg-gray-50 data-[theme=dark]:hover:bg-gray-700 mt-6"
      >
        <RefreshCw className={`w-4 h-4 ${isLoadingGroups ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
