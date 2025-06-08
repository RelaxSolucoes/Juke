import React from 'react';
import { usePlan } from '../contexts/PlanContext';

interface PremiumUpgradeProps {
  feature?: string;
  showModal?: boolean;
  onClose?: () => void;
}

export const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ 
  feature = "esta funcionalidade", 
  showModal = false,
  onClose 
}) => {
  const { upgradeToPremium, isPremium } = usePlan();

  if (isPremium) return null;

  const premiumFeatures = [
    { icon: "👁️", title: "Visualizar Fila", desc: "Veja todas as músicas que vão tocar" },
    { icon: "🗑️", title: "Gerenciar Fila", desc: "Remova músicas indesejadas (apenas host)" },
    { icon: "❤️", title: "Sistema de Votação", desc: "Músicas mais votadas tocam primeiro" },
    { icon: "🎵", title: "Player Integrado", desc: "Controle total sem depender de dispositivos" },
    { icon: "📺", title: "Modo TV", desc: "Tela dedicada para mostrar o que está tocando" },
    { icon: "🎛️", title: "Controles Avançados", desc: "Volume, posição, pular músicas" }
  ];

  const handleUpgrade = () => {
    upgradeToPremium();
    if (onClose) onClose();
  };

  if (!showModal) {
    // Versão inline/banner
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">🚀 Upgrade para Premium</h3>
            <p className="text-sm opacity-90">Desbloqueie {feature} e muito mais!</p>
          </div>
          <button
            onClick={handleUpgrade}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Em Breve
          </button>
        </div>
      </div>
    );
  }

  // Versão modal completa
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🎵 Juke Premium</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg text-center mb-6">
              <h3 className="text-xl font-bold mb-2">✨ Experiência Premium</h3>
              <p className="opacity-90">Transforme suas festas com funcionalidades avançadas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              🚀 Em Breve - Premium
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continuar Free
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            * Funcionalidades premium em desenvolvimento. Disponível em breve!
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook para mostrar upgrade quando necessário
export const usePremiumFeature = (featureName: keyof import('../types').PartyPlan['features']) => {
  const { canUseFeature } = usePlan();
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  const checkFeature = () => {
    if (!canUseFeature(featureName)) {
      setShowUpgrade(true);
      return false;
    }
    return true;
  };

  return {
    canUse: canUseFeature(featureName),
    checkFeature,
    showUpgrade,
    setShowUpgrade
  };
}; 