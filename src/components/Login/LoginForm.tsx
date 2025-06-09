
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authService } from '@/services/auth';
import LoginFormField from './LoginFormField';

const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.senha) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login({
        email: formData.email,
        senha: formData.senha
      });

      if (result.success && result.user) {
        toast({
          title: "Sucesso",
          description: `Bem-vindo, ${result.user.Nome}!`,
        });
        navigate('/');
      } else {
        toast({
          title: "Erro no Login",
          description: result.error || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Login Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">
          Faça seu login<span className="text-purple-400">.</span>
        </h2>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <LoginFormField
          id="email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <LoginFormField
          id="senha"
          name="senha"
          type="password"
          label="Senha"
          value={formData.senha}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        {/* Forgot Password Link */}
        <div className="text-right">
          <a 
            href="#" 
            className="text-gray-400 hover:text-purple-400 text-sm underline transition-colors"
          >
            Esqueci minha senha
          </a>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 gradient-primary text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Entrando...</span>
            </div>
          ) : (
            "Entrar"
          )}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center pt-6">
          <p className="text-gray-400 text-sm">
            Ainda não tenho uma conta{' '}
            <a 
              href="https://cupomativado.store/pv-anokzap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline font-medium transition-colors"
            >
              Criar conta
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
