
import React from 'react';
import LoginLogo from '@/components/Login/LoginLogo';
import LoginForm from '@/components/Login/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Gradient Overlay - removida a imagem de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-gray-900/90 to-blue-900/80" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Logo */}
        <LoginLogo />

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
