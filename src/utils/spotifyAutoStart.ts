// Funções para abrir Spotify automaticamente e iniciar reprodução
// Implementação robusta baseada na documentação oficial do Spotify Web API

interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

interface DevicesResponse {
  devices: SpotifyDevice[];
}

/**
 * Busca dispositivos disponíveis do usuário
 */
const getAvailableDevices = async (accessToken: string): Promise<SpotifyDevice[]> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dispositivos: ${response.status}`);
    }

    const data: DevicesResponse = await response.json();
    console.log('🔍 Dispositivos encontrados:', data.devices);
    return data.devices;
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    return [];
  }
};

/**
 * Transfere playback para um dispositivo específico
 */
const transferPlayback = async (accessToken: string, deviceId: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false, // Não inicia automaticamente
      }),
    });

    if (response.status === 204) {
      console.log('✅ Playback transferido para dispositivo:', deviceId);
      return true;
    }

    console.error('❌ Falha ao transferir playback:', response.status);
    return false;
  } catch (error) {
    console.error('Erro ao transferir playback:', error);
    return false;
  }
};

/**
 * Detecta o dispositivo e abre o Spotify com URLs de protocolo corretas
 */
export const openSpotifyApp = (): void => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    // Android - Usa intent do Android
    console.log('📱 Abrindo Spotify no Android...');
    window.location.href = 'intent://open.spotify.com#Intent;scheme=https;package=com.spotify.music;end';
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    // iOS - Usa URL scheme do iOS
    console.log('📱 Abrindo Spotify no iOS...');
    window.location.href = 'spotify://';
  } else if (/windows/.test(userAgent)) {
    // Windows - Usa protocolo spotify:// para desktop
    console.log('💻 Abrindo Spotify no Windows...');
    window.location.href = 'spotify://';
    
    // Fallback para web se app não estiver instalado
    setTimeout(() => {
      window.open('https://open.spotify.com', '_blank');
    }, 2000);
  } else if (/mac/.test(userAgent)) {
    // macOS - Usa protocolo spotify:// para desktop
    console.log('💻 Abrindo Spotify no macOS...');
    window.location.href = 'spotify://';
    
    // Fallback para web se app não estiver instalado
    setTimeout(() => {
      window.open('https://open.spotify.com', '_blank');
    }, 2000);
  } else {
    // Outros sistemas - Abre web player
    console.log('🌐 Abrindo Spotify Web Player...');
    window.open('https://open.spotify.com', '_blank');
  }
};

/**
 * Inicia reprodução com verificação de dispositivos
 */
const startPlaybackWithDevice = async (
  accessToken: string,
  deviceId?: string,
  playlistUri?: string
): Promise<boolean> => {
  try {
    const body: any = {};
    
    if (playlistUri) {
      body.context_uri = playlistUri;
      console.log('🎵 Iniciando playlist:', playlistUri);
    } else {
      console.log('▶️ Dando play no Spotify (sem playlist específica)');
    }

    const url = deviceId 
      ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
      : 'https://api.spotify.com/v1/me/player/play';

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      console.log('✅ Reprodução iniciada com sucesso!');
      return true;
    }

    if (response.status === 404) {
      console.log('❌ Dispositivo não encontrado ou inativo');
      return false;
    }

    if (response.status === 403) {
      console.log('❌ Dispositivo restrito ou sem Premium');
      return false;
    }

    console.error('❌ Erro inesperado:', response.status);
    return false;

  } catch (error) {
    console.error('Erro ao iniciar reprodução:', error);
    return false;
  }
};

/**
 * Fluxo completo e robusto para iniciar Spotify
 */
export const autoStartSpotify = async (
  accessToken: string,
  playlistUri?: string
): Promise<boolean> => {
  try {
    console.log('🚀 Iniciando fluxo automático do Spotify...');

    // 1. Busca dispositivos disponíveis
    const devices = await getAvailableDevices(accessToken);
    
    if (devices.length === 0) {
      console.log('📱 Nenhum dispositivo encontrado, abrindo Spotify...');
      openSpotifyApp();
      
      // Aguarda o Spotify abrir e tenta novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const newDevices = await getAvailableDevices(accessToken);
      if (newDevices.length === 0) {
        throw new Error('Nenhum dispositivo disponível após abrir Spotify');
      }
      
      // Usa o primeiro dispositivo encontrado
      const device = newDevices[0];
      console.log('🎯 Usando dispositivo:', device.name);
      
      if (!device.is_active) {
        await transferPlayback(accessToken, device.id);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return await startPlaybackWithDevice(accessToken, device.id, playlistUri);
    }

    // 2. Procura dispositivo ativo
    let activeDevice = devices.find(device => device.is_active);
    
    if (!activeDevice) {
      console.log('🔄 Nenhum dispositivo ativo, ativando o primeiro disponível...');
      
      // Usa o primeiro dispositivo disponível
      const device = devices[0];
      console.log('🎯 Ativando dispositivo:', device.name);
      
      const transferred = await transferPlayback(accessToken, device.id);
      if (!transferred) {
        console.log('📱 Falha ao transferir, abrindo Spotify...');
        openSpotifyApp();
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      activeDevice = device;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 3. Inicia reprodução no dispositivo ativo
    console.log('🎵 Iniciando reprodução no dispositivo:', activeDevice.name);
    const success = await startPlaybackWithDevice(accessToken, activeDevice.id, playlistUri);
    
    if (!success) {
      console.log('🔄 Falha na reprodução, tentando abrir Spotify...');
      openSpotifyApp();
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Última tentativa
      return await startPlaybackWithDevice(accessToken, activeDevice.id, playlistUri);
    }

    return success;

  } catch (error) {
    console.error('❌ Erro no fluxo automático:', error);
    
    // Fallback: abre Spotify e tenta reprodução simples
    console.log('🆘 Tentativa de fallback...');
    openSpotifyApp();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      return await startPlaybackWithDevice(accessToken, undefined, playlistUri);
    } catch (fallbackError) {
      console.error('❌ Fallback também falhou:', fallbackError);
      throw new Error('Não foi possível iniciar o Spotify. Tente abrir o Spotify manualmente.');
    }
  }
};

/**
 * Função legada para compatibilidade
 */
export const startPlayback = async (
  accessToken: string, 
  playlistUri?: string
): Promise<void> => {
  const success = await autoStartSpotify(accessToken, playlistUri);
  if (!success) {
    throw new Error('Falha ao iniciar reprodução');
  }
}; 