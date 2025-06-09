
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from '@/services/auth';
import { Lock, Mail, LogIn, Zap } from 'lucide-react';

const Login = () => {
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
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Gradient Overlay - removida a imagem de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-gray-900/90 to-blue-900/80" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Logo */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="text-center">
            <div className="w-32 h-32 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Zap className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-gradient text-6xl font-bold mb-4">Anok Zap</h1>
            <p className="text-2xl text-gray-300 font-medium max-w-md">
              Sistema Completo de Automação WhatsApp
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-gradient text-4xl font-bold mb-2">Anok Zap</h1>
            </div>

            {/* Login Title */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">
                Faça seu login<span className="text-purple-400">.</span>
              </h2>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-14 bg-gray-800/50 border-2 border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-0 text-lg px-6"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-gray-300 text-sm font-medium">
                  Senha
                </Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-14 bg-gray-800/50 border-2 border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-0 text-lg px-6"
                  required
                />
              </div>

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
        </div>
      </div>
    </div>
  );
};

export default Login;
