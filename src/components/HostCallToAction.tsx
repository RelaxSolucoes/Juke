import React, { useState } from 'react';
import { 
  Play, 
  Smartphone, 
  Share2, 
  Users, 
  CheckCircle,
  AlertCircle,
  Music,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface HostCallToActionProps {
  onStartPlaylist: () => void;
  onOpenShareModal: () => void;
  hasStartedPlaylist: boolean;
  guestCount: number;
  partyCode: string;
}

export const HostCallToAction: React.FC<HostCallToActionProps> = ({
  onStartPlaylist,
  onOpenShareModal,
  hasStartedPlaylist,
  guestCount,
  partyCode
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const steps = [
    {
      id: 'spotify',
      title: 'Abra o Spotify',
      description: 'Abra o app do Spotify e toque qualquer música',
      icon: <Smartphone className="w-5 h-5" />,
      status: 'pending' as const,
      action: null
    },
    {
      id: 'playlist',
      title: 'Inicie a Festa',
      description: 'Clique para começar a playlist de fundo',
      icon: <Play className="w-5 h-5" />,
      status: hasStartedPlaylist ? 'completed' : 'current' as const,
      action: hasStartedPlaylist ? null : onStartPlaylist
    },
    {
      id: 'share',
      title: 'Convide Amigos',
      description: 'Compartilhe o código da festa',
      icon: <Share2 className="w-5 h-5" />,
      status: guestCount > 0 ? 'completed' as const : (hasStartedPlaylist ? 'current' as const : 'pending' as const),
      action: onOpenShareModal
    }
  ];

  const getStepStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white animate-pulse';
      case 'pending':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  const getStepIcon = (step: typeof steps[0]) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5" />;
    }
    return step.icon;
  };

  const currentStep = steps.find(step => step.status === 'current');
  const completedSteps = steps.filter(step => step.status === 'completed').length;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Music className="w-6 h-6 text-purple-400" />
            <span>Configure sua Festa</span>
          </h3>
          <p className="text-purple-200 text-sm">
            {completedSteps === steps.length 
              ? '🎉 Festa configurada! Seus convidados já podem adicionar músicas'
              : `${completedSteps}/${steps.length} passos concluídos`
            }
          </p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-purple-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
          title="Ajuda"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
              step.status === 'current' ? 'bg-white/20 border border-blue-400/50' : 'bg-white/5'
            }`}
          >
            {/* Step Number/Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepStyle(step.status)}`}>
              {getStepIcon(step)}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <h4 className="font-semibold text-white">{step.title}</h4>
              <p className="text-purple-200 text-sm">{step.description}</p>
            </div>

            {/* Action Button */}
            {step.action && step.status === 'current' && (
              <button
                onClick={step.action}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 font-semibold"
              >
                <span>
                  {step.id === 'playlist' ? 'Iniciar' : 'Compartilhar'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Status Indicator */}
            {step.status === 'completed' && (
              <div className="text-green-400 text-sm font-semibold">
                ✓ Concluído
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Highlight */}
      {currentStep && (
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/50 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-200 mb-1">Próximo Passo:</h4>
              <p className="text-blue-100 text-sm">
                {currentStep.id === 'playlist' && 
                  'Primeiro, abra o Spotify em qualquer dispositivo e toque uma música. Depois volte aqui e clique em "Iniciar".'
                }
                {currentStep.id === 'share' && 
                  'Agora compartilhe o código da festa com seus amigos para eles poderem adicionar músicas!'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {showHelp && (
        <div className="mt-6 p-4 bg-purple-500/20 border border-purple-400/50 rounded-xl">
          <h4 className="font-semibold text-purple-200 mb-3">💡 Como funciona:</h4>
          <div className="space-y-2 text-sm text-purple-100">
            <p>• <strong>Spotify:</strong> O Juke controla seu Spotify remotamente</p>
            <p>• <strong>Playlist:</strong> Música de fundo quando ninguém adiciona nada</p>
            <p>• <strong>Convidados:</strong> Adicionam músicas que tocam na sua conta</p>
            <p>• <strong>Dispositivo:</strong> Música toca onde você abriu o Spotify</p>
          </div>
        </div>
      )}

      {/* Success State */}
      {completedSteps === steps.length && (
        <div className="mt-6 p-4 bg-green-500/20 border border-green-400/50 rounded-xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h4 className="font-bold text-green-200">Festa Ativa!</h4>
          </div>
          <p className="text-green-100 text-sm">
            {guestCount > 0 
              ? `${guestCount} ${guestCount === 1 ? 'pessoa está' : 'pessoas estão'} na festa`
              : 'Aguardando convidados...'
            }
          </p>
        </div>
      )}
    </div>
  );
}; 