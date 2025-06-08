import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Smartphone, 
  Music, 
  Users, 
  Share2, 
  CheckCircle, 
  ArrowRight,
  X,
  Lightbulb
} from 'lucide-react';

interface OnboardingGuideProps {
  userType: 'host' | 'guest';
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ 
  userType, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const hostSteps = [
    {
      icon: <Smartphone className="w-8 h-8 text-green-400" />,
      title: "1. Abra o Spotify",
      description: "Abra o app do Spotify no seu celular, computador ou qualquer dispositivo",
      tip: "💡 Certifique-se de estar logado com a mesma conta"
    },
    {
      icon: <Play className="w-8 h-8 text-blue-400" />,
      title: "2. Inicie a Música",
      description: "Toque qualquer música no Spotify para ativar o player",
      tip: "🎵 Pode ser qualquer música, só para 'acordar' o Spotify"
    },
    {
      icon: <Music className="w-8 h-8 text-purple-400" />,
      title: "3. Clique em 'Playlist'",
      description: "Volte aqui e clique no botão verde 'Playlist' para iniciar a festa",
      tip: "🚀 Isso vai começar uma playlist automática de fundo"
    },
    {
      icon: <Share2 className="w-8 h-8 text-pink-400" />,
      title: "4. Compartilhe o Código",
      description: "Envie o código da festa para seus amigos entrarem",
      tip: "📱 Use WhatsApp, Instagram ou qualquer app de mensagem"
    }
  ];

  const guestSteps = [
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "Bem-vindo à Festa!",
      description: "Você entrou na festa musical. Agora pode adicionar suas músicas favoritas!",
      tip: "🎉 Suas músicas vão tocar no dispositivo do host"
    },
    {
      icon: <Music className="w-8 h-8 text-blue-400" />,
      title: "Como Adicionar Músicas",
      description: "Use a barra de busca abaixo para encontrar e adicionar músicas à fila",
      tip: "🔍 Digite o nome da música ou artista"
    }
  ];

  const steps = userType === 'host' ? hostSteps : guestSteps;
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {userType === 'host' ? 'Como Criar sua Festa' : 'Como Participar'}
                </h2>
                <p className="text-sm text-gray-600">
                  Passo {currentStep + 1} de {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {steps[currentStep].icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 mb-4">
              {steps[currentStep].description}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                {steps[currentStep].tip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between space-x-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Pular
              </button>
              <button
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
              >
                <span>{isLastStep ? 'Entendi!' : 'Próximo'}</span>
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
                {isLastStep && <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar onboarding
export const useOnboarding = (userType: 'host' | 'guest') => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`juke_onboarding_${userType}`);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [userType]);

  const completeOnboarding = () => {
    localStorage.setItem(`juke_onboarding_${userType}`, 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(`juke_onboarding_${userType}`, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(`juke_onboarding_${userType}`);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}; 