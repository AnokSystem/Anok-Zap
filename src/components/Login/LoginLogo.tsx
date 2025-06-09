
import React from 'react';
import { Zap } from 'lucide-react';

const LoginLogo = () => {
  return (
    <>
      {/* Desktop Logo */}
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

      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-gradient text-4xl font-bold mb-2">Anok Zap</h1>
      </div>
    </>
  );
};

export default LoginLogo;
