import React, { createContext, useContext, useState, useEffect } from 'react';
import { PartyPlan } from '../types';

interface PlanContextType {
  currentPlan: PartyPlan;
  upgradeToPremium: () => void;
  downgradToFree: () => void;
  isPremium: boolean;
  canUseFeature: (feature: keyof PartyPlan['features']) => boolean;
}

const defaultFreePlan: PartyPlan = {
  type: 'free',
  features: {
    queueVisualization: false,
    queueManagement: false,
    votingSystem: false,
    webPlaybackSDK: false,
    tvMode: false,
    advancedControls: false,
  }
};

const premiumPlan: PartyPlan = {
  type: 'premium',
  features: {
    queueVisualization: true,
    queueManagement: true,
    votingSystem: true,
    webPlaybackSDK: true,
    tvMode: true,
    advancedControls: true,
  }
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<PartyPlan>(defaultFreePlan);

  // Carregar plano do localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('juke_plan');
    if (savedPlan === 'premium') {
      setCurrentPlan(premiumPlan);
    }
  }, []);

  const upgradeToPremium = () => {
    // Modo desenvolvedor secreto
    const isDev = window.location.search.includes('dev=true') || 
                  localStorage.getItem('juke_dev_mode') === 'true';
    
    if (isDev) {
      setCurrentPlan(premiumPlan);
      localStorage.setItem('juke_plan', 'premium');
      localStorage.setItem('juke_dev_mode', 'true');
      console.log('🎉 Modo Premium DEV ativado!');
    } else {
      console.log('🚧 Premium em desenvolvimento - Em breve!');
      alert('🚧 Funcionalidades Premium em desenvolvimento!\n\nEm breve você poderá:\n• Visualizar fila completa\n• Sistema de votação\n• Modo TV\n• Controles avançados\n\nFique ligado! 🎵');
    }
  };

  const downgradToFree = () => {
    setCurrentPlan(defaultFreePlan);
    localStorage.setItem('juke_plan', 'free');
    console.log('📱 Voltou para plano Free');
  };

  const isPremium = currentPlan.type === 'premium';

  const canUseFeature = (feature: keyof PartyPlan['features']): boolean => {
    return currentPlan.features[feature];
  };

  return (
    <PlanContext.Provider value={{
      currentPlan,
      upgradeToPremium,
      downgradToFree,
      isPremium,
      canUseFeature
    }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan deve ser usado dentro de um PlanProvider');
  }
  return context;
}; 