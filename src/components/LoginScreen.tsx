import React, { useState } from 'react';
import { Music, Users, Play, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { validateGuestName, validatePartyCode, sanitizeErrorMessage } from '../utils/validation';

export const LoginScreen: React.FC = () => {
  const { signInWithSpotify, setGuestUser, loading } = useAuth();
  const { joinParty } = useParty();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [partyCode, setPartyCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleGuestNameChange = (value: string) => {
    setGuestName(value);
    setNameError('');
    setJoinError('');
  };

  const handlePartyCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setPartyCode(upperValue);
    setCodeError('');
    setJoinError('');
  };

  const handleGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setNameError('');
    setCodeError('');

    // Validate guest name
    const nameValidation = validateGuestName(guestName);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || 'Nome inválido');
      return;
    }

    // Validate party code
    if (!validatePartyCode(partyCode)) {
      setCodeError('Código deve ter 6 caracteres (letras e números)');
      return;
    }

    setIsJoining(true);
    try {
      setGuestUser(nameValidation.sanitized);
      const success = await joinParty(partyCode, nameValidation.sanitized);
      if (!success) {
        setJoinError('Código da festa inválido ou festa não encontrada');
      }
    } catch (error) {
      const errorMessage = sanitizeErrorMessage(error);
      setJoinError(errorMessage || 'Erro ao entrar na festa. Tente novamente.');
    } finally {
      setIsJoining(false);
    }
  };

  const resetForm = () => {
    setShowGuestForm(false);
    setGuestName('');
    setPartyCode('');
    setJoinError('');
    setNameError('');
    setCodeError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-spotify-500 rounded-full mb-4 animate-bounce-gentle">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Spotify Party
          </h1>
          <p className="text-gray-300 text-lg">
            Crie festas musicais e deixe seus convidados escolherem as músicas
          </p>
        </div>

        {!showGuestForm ? (
          /* Host/Guest Selection */
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl animate-slide-up">
            <div className="space-y-4">
              {/* Host Login */}
              <button
                onClick={signInWithSpotify}
                disabled={loading}
                className="w-full bg-spotify-500 hover:bg-spotify-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus className="w-5 h-5" />
                <span>
                  {loading ? 'Conectando...' : 'Criar Festa (Host)'}
                </span>
              </button>
              
              {/* Guest Join */}
              <button
                onClick={() => setShowGuestForm(true)}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <Users className="w-5 h-5" />
                <span>Entrar na Festa (Convidado)</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-300">
                <div>
                  <Play className="w-6 h-6 mx-auto mb-2 text-spotify-400" />
                  <p>Controle de reprodução</p>
                </div>
                <div>
                  <Music className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <p>Fila colaborativa</p>
                </div>
                <div>
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <p>Múltiplos convidados</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Guest Form */
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Entrar na Festa
            </h2>
            
            <form onSubmit={handleGuestJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => handleGuestNameChange(e.target.value)}
                  className={`w-full bg-white/20 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-500 focus:border-transparent ${
                    nameError ? 'border-red-500/50' : 'border-white/30'
                  }`}
                  placeholder="Digite seu nome"
                  maxLength={50}
                  disabled={isJoining}
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-300">{nameError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Código da festa
                </label>
                <input
                  type="text"
                  value={partyCode}
                  onChange={(e) => handlePartyCodeChange(e.target.value)}
                  className={`w-full bg-white/20 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-500 focus:border-transparent text-center text-lg font-mono tracking-wider ${
                    codeError ? 'border-red-500/50' : 'border-white/30'
                  }`}
                  placeholder="ABC123"
                  maxLength={6}
                  disabled={isJoining}
                />
                {codeError && (
                  <p className="mt-1 text-sm text-red-300">{codeError}</p>
                )}
              </div>

              {joinError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                  {joinError}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isJoining}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !guestName.trim() || !partyCode.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};