
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoFormProps {
  title: string;
  description: string;
  category: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const BasicInfoForm = ({
  title,
  description,
  category,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange
}: BasicInfoFormProps) => {
  const categories = [
    'Primeiros Passos',
    'Guias Avançados',
    'Suporte',
    'Recursos Extras'
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-gray-300">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-gray-800 border-gray-600 text-gray-200"
          placeholder="Digite o título do tutorial"
          required
        />
      </div>

      <div>
        <Label htmlFor="category" className="text-gray-300">Categoria</Label>
        <Select onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description" className="text-gray-300">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="bg-gray-800 border-gray-600 text-gray-200 min-h-[100px]"
          placeholder="Descreva o conteúdo do tutorial"
          required
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
