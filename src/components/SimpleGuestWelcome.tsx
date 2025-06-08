import React from 'react';
import { 
  Music, 
  Search, 
  Users, 
  Sparkles,
  ArrowDown
} from 'lucide-react';

interface SimpleGuestWelcomeProps {
  partyName: string;
  hostName: string;
  guestCount: number;
}

export const SimpleGuestWelcome: React.FC<SimpleGuestWelcomeProps> = ({
  partyName,
  hostName,
  guestCount
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          🎉 Você entrou na festa!
        </h2>
        <p className="text-purple-200 text-lg">
          <strong>{partyName}</strong>
        </p>
        <p className="text-purple-300 text-sm">
          Host: {hostName} • {guestCount} {guestCount === 1 ? 'pessoa' : 'pessoas'} aqui
        </p>
      </div>

      {/* Simple Instructions */}
      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-6">
        <div className="text-center">
          <h3 className="font-semibold text-blue-200 mb-2">
            🎵 Como funciona:
          </h3>
          <p className="text-blue-100 text-sm">
            Busque músicas abaixo e adicione à festa. Elas vão tocar no dispositivo do host!
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Search className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">
            Adicione suas músicas favoritas!
          </span>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-purple-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}; 