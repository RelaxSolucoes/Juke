// Funções para gerenciar dispositivos Spotify baseado na documentação oficial
// https://developer.spotify.com/documentation/web-api/reference/get-a-users-available-devices

export interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
}

export interface DevicesResponse {
  devices: SpotifyDevice[];
}

/**
 * Busca dispositivos disponíveis do usuário
 * Endpoint: GET /me/player/devices
 * Scope necessário: user-read-playback-state
 */
export const getAvailableDevices = async (accessToken: string): Promise<SpotifyDevice[]> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de acesso inválido ou expirado');
      }
      if (response.status === 403) {
        throw new Error('Acesso negado. Verifique se você tem Spotify Premium');
      }
      throw new Error(`Erro ao buscar dispositivos: ${response.status}`);
    }

    const data: DevicesResponse = await response.json();
    return data.devices;
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    throw error;
  }
};

/**
 * Verifica se há pelo menos um dispositivo ativo
 */
export const hasActiveDevice = async (accessToken: string): Promise<boolean> => {
  try {
    const devices = await getAvailableDevices(accessToken);
    return devices.some(device => device.is_active);
  } catch (error) {
    console.error('Erro ao verificar dispositivos ativos:', error);
    return false;
  }
};

/**
 * Busca o dispositivo ativo atual
 */
export const getActiveDevice = async (accessToken: string): Promise<SpotifyDevice | null> => {
  try {
    const devices = await getAvailableDevices(accessToken);
    return devices.find(device => device.is_active) || null;
  } catch (error) {
    console.error('Erro ao buscar dispositivo ativo:', error);
    return null;
  }
};

/**
 * Verifica se há dispositivos disponíveis (mesmo que não ativos)
 */
export const hasAvailableDevices = async (accessToken: string): Promise<boolean> => {
  try {
    const devices = await getAvailableDevices(accessToken);
    return devices.length > 0;
  } catch (error) {
    console.error('Erro ao verificar dispositivos disponíveis:', error);
    return false;
  }
};

/**
 * Transfere reprodução para um dispositivo específico
 * Endpoint: PUT /me/player
 */
export const transferPlayback = async (
  accessToken: string, 
  deviceId: string, 
  play: boolean = false
): Promise<void> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: play
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao transferir reprodução: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao transferir reprodução:', error);
    throw error;
  }
};

/**
 * Mensagens de erro amigáveis baseadas no estado dos dispositivos
 */
export const getDeviceStatusMessage = (devices: SpotifyDevice[]): string => {
  if (devices.length === 0) {
    return 'Nenhum dispositivo Spotify encontrado. Abra o Spotify em qualquer dispositivo (celular, computador, etc.) e toque uma música.';
  }

  const activeDevices = devices.filter(d => d.is_active);
  if (activeDevices.length === 0) {
    const deviceNames = devices.map(d => d.name).join(', ');
    return `Dispositivos encontrados (${deviceNames}), mas nenhum está ativo. Toque uma música em qualquer um deles.`;
  }

  const activeDevice = activeDevices[0];
  return `Dispositivo ativo: ${activeDevice.name} (${activeDevice.type})`;
}; 