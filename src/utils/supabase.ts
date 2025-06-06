import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using fallback configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database helper functions
export const createPartyInDB = async (party: {
  code: string;
  name: string;
  host_id: string;
  host_name: string;
}) => {
  const { data, error } = await supabase
    .from('parties')
    .insert([
      {
        code: party.code,
        name: party.name,
        host_id: party.host_id,
        host_name: party.host_name,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPartyByCode = async (code: string) => {
  const { data, error } = await supabase
    .from('parties')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const addGuestToParty = async (guest: {
  name: string;
  party_id: string;
}) => {
  const { data, error } = await supabase
    .from('guests')
    .insert([guest])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPartyGuests = async (partyId: string) => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('party_id', partyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addTrackToQueueDB = async (track: {
  spotify_id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  image_url?: string;
  preview_url?: string;
  added_by: string;
  added_by_name: string;
  party_id: string;
}) => {
  const { data, error } = await supabase
    .from('tracks')
    .insert([track])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPartyQueue = async (partyId: string) => {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('party_id', partyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const removeTrackFromQueueDB = async (trackId: string) => {
  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', trackId);

  if (error) throw error;
};

export const updateCurrentTrack = async (partyId: string, trackId: string | null) => {
  const { error } = await supabase
    .from('parties')
    .update({ current_track_id: trackId })
    .eq('id', partyId);

  if (error) throw error;
};

export const deactivateParty = async (partyId: string) => {
  const { error } = await supabase
    .from('parties')
    .update({ is_active: false })
    .eq('id', partyId);

  if (error) throw error;
};

// Buscar credenciais do host para permitir que convidados façam buscas
export const getPartyHostCredentials = async (hostId: string) => {
  // Primeiro, vamos buscar na tabela de usuários/hosts
  // Como não temos uma tabela específica, vamos simular a busca
  // Em um sistema real, você salvaria as credenciais do host em uma tabela segura
  
  // Por enquanto, retornamos null para indicar que não encontramos as credenciais
  // Isso forçará o sistema a usar apenas as credenciais locais do host
  return null;
};

// Função para salvar credenciais do host (para implementação futura)
export const saveHostCredentials = async (hostId: string, credentials: {
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
}) => {
  // Esta função seria implementada para salvar as credenciais do host
  // em uma tabela segura no banco de dados
  // Por segurança, as credenciais deveriam ser criptografadas
  
  console.log('saveHostCredentials não implementado ainda');
  return null;
};

// Real-time subscriptions
export const subscribeToPartyUpdates = (
  partyId: string,
  onUpdate: (payload: any) => void
) => {
  return supabase
    .channel(`party-${partyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tracks',
        filter: `party_id=eq.${partyId}`,
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'guests',
        filter: `party_id=eq.${partyId}`,
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'parties',
        filter: `id=eq.${partyId}`,
      },
      onUpdate
    )
    .subscribe();
};