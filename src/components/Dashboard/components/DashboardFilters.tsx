
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar } from 'lucide-react';

interface DashboardFiltersProps {
  type: 'notifications' | 'disparos';
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export const DashboardFilters = ({ 
  type, 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  hasFilters 
}: DashboardFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsExpanded(false);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onClearFilters();
    setIsExpanded(false);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => filters[key]).length;
  };

  return (
    <Card className="card-modern mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary-contrast">
            <Filter className="w-5 h-5 text-blue-400" />
            Filtros
            {hasFilters && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {getActiveFiltersCount()} ativo{getActiveFiltersCount() !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-400 hover:text-red-400"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-gray-600 hover:border-blue-500"
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Busca por termo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Nome, email, produto..."
                  value={localFilters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-gray-300"
                />
              </div>
            </div>

            {/* Data de início */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Data Início</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-gray-300"
                />
              </div>
            </div>

            {/* Data fim */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Data Fim</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-gray-300"
                />
              </div>
            </div>

            {type === 'notifications' ? (
              <>
                {/* Tipo de evento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tipo de Evento</label>
                  <Select value={localFilters.eventType || ''} onValueChange={(value) => handleFilterChange('eventType', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-300">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="purchase">Compra</SelectItem>
                      <SelectItem value="subscription">Assinatura</SelectItem>
                      <SelectItem value="cancel">Cancelamento</SelectItem>
                      <SelectItem value="refund">Reembolso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plataforma */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Plataforma</label>
                  <Select value={localFilters.platform || ''} onValueChange={(value) => handleFilterChange('platform', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-300">
                      <SelectValue placeholder="Todas as plataformas" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="">Todas as plataformas</SelectItem>
                      <SelectItem value="hotmart">Hotmart</SelectItem>
                      <SelectItem value="eduzz">Eduzz</SelectItem>
                      <SelectItem value="monetizze">Monetizze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <Select value={localFilters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-300">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                {/* Status do disparo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <Select value={localFilters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-300">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="enviando">Enviando</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="erro">Erro</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Instância */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Instância</label>
                  <Input
                    placeholder="Nome ou ID da instância"
                    value={localFilters.instanceId || ''}
                    onChange={(e) => handleFilterChange('instanceId', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-300"
                  />
                </div>

                {/* Nome da campanha */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Campanha</label>
                  <Input
                    placeholder="Nome da campanha"
                    value={localFilters.campaignName || ''}
                    onChange={(e) => handleFilterChange('campaignName', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-300"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="border-gray-600 hover:border-gray-500"
            >
              Cancelar
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
