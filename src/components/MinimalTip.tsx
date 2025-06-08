import React, { useState, useEffect } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface MinimalTipProps {
  type: 'host' | 'guest';
  onDismiss?: () => void;
}

export const MinimalTip: React.FC<MinimalTipProps> = ({ type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar se já foi mostrada
    const tipKey = `juke_tip_${type}`;
    const hasSeenTip = localStorage.getItem(tipKey);
    
    if (!hasSeenTip) {
      setIsVisible(true);
    }
  }, [type]);

  const handleDismiss = () => {
    const tipKey = `juke_tip_${type}`;
    localStorage.setItem(tipKey, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const hostTip = "💡 Abra o Spotify em qualquer dispositivo para que as músicas toquem lá";
  const guestTip = "💡 Suas músicas vão tocar no dispositivo do host";

  return (
    <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-3 mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <p className="text-yellow-200 text-sm">
          {type === 'host' ? hostTip : guestTip}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-yellow-400 hover:text-yellow-200 p-1 rounded transition-colors"
        title="Entendi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}; 