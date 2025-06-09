
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';

interface CreateInstanceFormProps {
  onCreateInstance: (name: string) => Promise<void>;
  isLoading: boolean;
}

const CreateInstanceForm = ({ onCreateInstance, isLoading }: CreateInstanceFormProps) => {
  const [newInstanceName, setNewInstanceName] = useState('');

  const handleSubmit = async () => {
    if (!newInstanceName.trim()) return;
    await onCreateInstance(newInstanceName);
    setNewInstanceName('');
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-purple-accent" />
        </div>
        <div>
          <Label className="font-semibold text-primary-contrast text-lg">Nova Instância</Label>
          <p className="text-sm text-gray-400 mt-1">
            Crie uma nova instância do WhatsApp pessoal
          </p>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Input
          value={newInstanceName}
          onChange={(e) => setNewInstanceName(e.target.value)}
          placeholder="Nome da instância"
          className="input-form"
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !newInstanceName.trim()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar
        </Button>
      </div>
    </div>
  );
};

export default CreateInstanceForm;
