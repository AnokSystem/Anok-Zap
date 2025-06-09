
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

const LoginFormField = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  disabled = false,
  required = false
}: LoginFormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-300 text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-14 bg-gray-800/50 border-2 border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-0 text-lg px-6"
        required={required}
      />
    </div>
  );
};

export default LoginFormField;
