import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAvailableDevices, 
  hasActiveDevice, 
  getDeviceStatusMessage,
  SpotifyDevice 
} from '../utils/spotifyDevices';

interface DeviceStatusProps {
  onDeviceReady: (hasDevice: boolean) => void;
  showRefreshButton?: boolean;
}

export const DeviceStatus: React.FC<DeviceStatusProps> = ({ 
  onDeviceReady, 
  showRefreshButton = true 
}) => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActive, setHasActive] = useState(false);

  const checkDevices = async () => {
    if (!user?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const availableDevices = await getAvailableDevices(user.access_token);
      const activeDevice = await hasActiveDevice(user.access_token);
      
      setDevices(availableDevices);
      setHasActive(activeDevice);
      onDeviceReady(activeDevice);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      onDeviceReady(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDevices();
  }, [user?.access_token]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
        <span className="text-yellow-300 text-sm">Verificando dispositivos Spotify...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-400 text-sm font-medium">❌ Erro ao verificar dispositivos</span>
        </div>
        <p className="text-red-300 text-xs mb-2">{error}</p>
        {showRefreshButton && (
          <button
            onClick={checkDevices}
            className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  const statusMessage = getDeviceStatusMessage(devices);
  const statusColor = hasActive ? 'green' : devices.length > 0 ? 'yellow' : 'red';
  const statusIcon = hasActive ? '✅' : devices.length > 0 ? '⚠️' : '❌';

  return (
    <div className={`p-3 border rounded-lg ${
      statusColor === 'green' 
        ? 'bg-green-500/10 border-green-500/20' 
        : statusColor === 'yellow'
        ? 'bg-yellow-500/10 border-yellow-500/20'
        : 'bg-red-500/10 border-red-500/20'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          statusColor === 'green' 
            ? 'text-green-400' 
            : statusColor === 'yellow'
            ? 'text-yellow-400'
            : 'text-red-400'
        }`}>
          {statusIcon} Status do Spotify
        </span>
        {showRefreshButton && (
          <button
            onClick={checkDevices}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              statusColor === 'green' 
                ? 'bg-green-500/20 hover:bg-green-500/30' 
                : statusColor === 'yellow'
                ? 'bg-yellow-500/20 hover:bg-yellow-500/30'
                : 'bg-red-500/20 hover:bg-red-500/30'
            }`}
          >
            🔄 Atualizar
          </button>
        )}
      </div>
      
      <p className={`text-xs ${
        statusColor === 'green' 
          ? 'text-green-300' 
          : statusColor === 'yellow'
          ? 'text-yellow-300'
          : 'text-red-300'
      }`}>
        {statusMessage}
      </p>

      {devices.length > 0 && (
        <div className="mt-2 space-y-1">
          {devices.map((device, index) => (
            <div 
              key={device.id || index} 
              className={`text-xs p-2 rounded ${
                device.is_active 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{device.name}</span>
                <span className="text-xs opacity-75">{device.type}</span>
              </div>
              {device.is_active && (
                <div className="text-xs opacity-75 mt-1">
                  ✅ Ativo {device.volume_percent !== null && `• Volume: ${device.volume_percent}%`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 