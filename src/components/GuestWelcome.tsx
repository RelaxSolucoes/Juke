import React from 'react';
import { 
  Music, 
  Search, 
  Users, 
  Headphones,
  Sparkles,
  ArrowDown
} from 'lucide-react';

interface GuestWelcomeProps {
  partyName: string;
  hostName: string;
  guestCount: number;
  hasAddedSongs: boolean;
}

export const GuestWelcome: React.FC<GuestWelcomeProps> = ({
  partyName,
  hostName,
  guestCount,
  hasAddedSongs
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          🎉 Bem-vindo à festa!
        </h2>
        <p className="text-purple-200">
          Você entrou na <strong>{partyName}</strong>
        </p>
        <p className="text-purple-300 text-sm">
          Host: {hostName} • {guestCount} {guestCount === 1 ? 'pessoa' : 'pessoas'} na festa
        </p>
      </div>

      {/* How it works */}
      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Headphones className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-200 mb-2">Como funciona:</h3>
            <div className="space-y-1 text-sm text-blue-100">
              <p>• Suas músicas tocam no dispositivo do host</p>
              <p>• Use a busca abaixo para adicionar músicas</p>
              <p>• Quanto mais pessoas adicionarem, melhor a festa!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Search className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">
            {hasAddedSongs ? 'Adicione mais músicas!' : 'Adicione sua primeira música!'}
          </span>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
        <p className="text-purple-200 text-sm mb-4">
          {hasAddedSongs 
            ? 'Continue adicionando suas favoritas para manter a festa animada'
            : 'Digite o nome de uma música ou artista na busca abaixo'
          }
        </p>
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-purple-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}; 