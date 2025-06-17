
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Package, Layers } from 'lucide-react';

interface ProductScopeSectionProps {
  newRule: any;
  setNewRule: (rule: any) => void;
}

export const ProductScopeSection = ({ newRule, setNewRule }: ProductScopeSectionProps) => {
  const handleScopeChange = (value: 'all' | 'specific') => {
    setNewRule((prev: any) => ({
      ...prev,
      productScope: value,
      specificProductName: value === 'all' ? '' : prev.specificProductName
    }));
  };

  const handleProductNameChange = (value: string) => {
    setNewRule((prev: any) => ({
      ...prev,
      specificProductName: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <Label className="font-semibold text-primary-contrast text-lg">Escopo do Produto</Label>
          <p className="text-sm text-gray-400 mt-1">
            Defina se a notificação é para todos os produtos ou específica
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <RadioGroup
          value={newRule.productScope || 'all'}
          onValueChange={handleScopeChange}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
            <RadioGroupItem value="all" id="all-products" className="border-gray-600 text-orange-400" />
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <Label htmlFor="all-products" className="text-white font-medium cursor-pointer">
                  Todos os Produtos
                </Label>
                <p className="text-sm text-gray-400">
                  A notificação será enviada para qualquer produto da plataforma
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
            <RadioGroupItem value="specific" id="specific-product" className="border-gray-600 text-orange-400" />
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <Label htmlFor="specific-product" className="text-white font-medium cursor-pointer">
                  Produto Específico
                </Label>
                <p className="text-sm text-gray-400 mb-3">
                  A notificação será enviada apenas para o produto especificado
                </p>
                
                {newRule.productScope === 'specific' && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Nome do Produto</Label>
                    <Input
                      value={newRule.specificProductName || ''}
                      onChange={(e) => handleProductNameChange(e.target.value)}
                      placeholder="Digite o nome exato do produto..."
                      className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-orange-400"
                    />
                    <p className="text-xs text-gray-500">
                      Digite o nome exato como aparece na plataforma
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
