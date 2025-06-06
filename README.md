# 🎵 Spotify Party App

Uma aplicação web moderna para criar festas musicais colaborativas onde o host controla a reprodução via Spotify e os convidados podem adicionar músicas à fila em tempo real.

![Spotify Party App](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4.1-blue) ![Supabase](https://img.shields.io/badge/Supabase-2.38.4-green)

## ✨ Funcionalidades

### 🎧 Para Hosts (Spotify Premium)
- ✅ **Login via OAuth Spotify** - Autenticação segura
- ✅ **Criação de festas** - Gere códigos únicos para suas festas
- ✅ **Controle total de reprodução** - Play, pause, skip, controle de volume
- ✅ **Gerenciamento da fila** - Visualize e organize músicas
- ✅ **Monitoramento de convidados** - Veja quem está na festa
- ✅ **Busca de músicas** - Encontre qualquer música do Spotify

### 👥 Para Convidados
- ✅ **Entrada fácil** - Entre na festa apenas com um código
- ✅ **Busca de músicas** - Procure suas músicas favoritas
- ✅ **Adição à fila** - Contribua com a playlist da festa
- ✅ **Visualização em tempo real** - Veja a fila atualizar instantaneamente
- ✅ **Interface responsiva** - Funciona perfeitamente no mobile

### 🔄 Real-time
- ✅ **Sincronização instantânea** - Todos veem as mudanças em tempo real
- ✅ **Atualizações automáticas** - Fila e convidados sempre atualizados
- ✅ **Notificações** - Feedback visual para todas as ações

## 🏗️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5
- **Styling**: Tailwind CSS 3 com tema customizado
- **Roteamento**: React Router DOM 6
- **Backend**: Supabase (PostgreSQL + Real-time)
- **API Externa**: Spotify Web API + Web Playback SDK
- **Ícones**: Lucide React
- **Testes**: Vitest + Testing Library

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Spotify Premium (para hosts)
- Projeto Supabase configurado

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/spotify-party-app.git
cd spotify-party-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Spotify API
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure o Spotify App

1. Acesse [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Crie um novo app
3. Configure as URLs de redirecionamento:
   - `http://localhost:5173/callback` (desenvolvimento)
   - `https://seu-dominio.com/callback` (produção)
4. Copie o Client ID para o `.env`

### 5. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL do arquivo `supabase-schema.sql` no SQL Editor
3. Configure as variáveis de ambiente com as credenciais do projeto

### 6. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `parties`
- `id` (UUID) - Primary Key
- `code` (VARCHAR) - Código único da festa
- `name` (VARCHAR) - Nome da festa
- `host_id` (VARCHAR) - ID do host
- `host_name` (VARCHAR) - Nome do host
- `is_active` (BOOLEAN) - Status da festa
- `current_track_id` (VARCHAR) - Música atual
- `created_at` / `updated_at` (TIMESTAMP)

#### `guests`
- `id` (UUID) - Primary Key
- `name` (VARCHAR) - Nome do convidado
- `party_id` (UUID) - FK para parties
- `created_at` (TIMESTAMP)

#### `tracks`
- `id` (UUID) - Primary Key
- `spotify_id` (VARCHAR) - ID da música no Spotify
- `name`, `artist`, `album` (VARCHAR) - Dados da música
- `duration_ms` (INTEGER) - Duração
- `image_url`, `preview_url` (TEXT) - URLs
- `added_by`, `added_by_name` (VARCHAR) - Quem adicionou
- `party_id` (UUID) - FK para parties
- `created_at` (TIMESTAMP)

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com interface
npm run test:ui

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## 📱 Como Usar

### 1. Criando uma Festa (Host)

1. Acesse a aplicação
2. Clique em "Criar Festa (Host)"
3. Faça login com sua conta Spotify Premium
4. Digite o nome da sua festa
5. Compartilhe o código gerado com os convidados
6. Controle a reprodução através da interface

### 2. Entrando numa Festa (Convidado)

1. Acesse a aplicação
2. Clique em "Entrar na Festa (Convidado)"
3. Digite seu nome e o código da festa
4. Busque e adicione músicas à fila
5. Aproveite a festa!

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado no Supabase
- **Validação e sanitização** de todos os inputs
- **Rate limiting** para prevenir spam
- **OAuth seguro** com Spotify
- **Tokens com refresh automático**

## 🎨 Personalização

### Cores do Tema

O app usa um sistema de cores customizado baseado no Spotify:

```css
/* Verde Spotify */
spotify-500: #1DB954

/* Roxo para ações secundárias */
purple-500: #8B5CF6

/* Gradientes escuros para backgrounds */
```

### Animações

- `fade-in` - Entrada suave
- `slide-up` - Deslizamento para cima
- `bounce-gentle` - Bounce suave
- `pulse-soft` - Pulsação suave

## 🚀 Deploy

### Netlify (Recomendado)

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Build Manual

```bash
npm run build
# Os arquivos estarão na pasta dist/
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎵 API do Spotify

Este app utiliza a Spotify Web API e Web Playback SDK:

- **Web API**: Para busca de músicas e informações
- **Web Playback SDK**: Para controle de reprodução
- **OAuth 2.0**: Para autenticação segura

## 📞 Suporte

- **Issues**: Use o GitHub Issues para bugs e sugestões
- **Documentação**: Confira a [Wiki](https://github.com/seu-usuario/spotify-party-app/wiki)
- **Spotify API**: [Documentação oficial](https://developer.spotify.com/documentation/web-api/)

## 🏆 Roadmap

- [ ] Histórico de festas
- [ ] Temas customizáveis
- [ ] Playlists salvas
- [ ] Chat em tempo real
- [ ] Votação em músicas
- [ ] Estatísticas de uso
- [ ] PWA (Progressive Web App)
- [ ] Integração com outras plataformas

---

**Feito com ❤️ para amantes de música** 