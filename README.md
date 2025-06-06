# 🎵 Juke - Spotify Party App

**Sistema de festa colaborativa do Spotify ultra-simplificado**

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://juke-seven.vercel.app/)
[![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?logo=spotify)](https://developer.spotify.com/documentation/web-api)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com)

## 🎯 **O que é o Juke?**

O Juke é um aplicativo que permite criar festas colaborativas onde **qualquer pessoa pode adicionar músicas à fila do Spotify** sem precisar de login individual. O sistema usa as credenciais do host para que todos os convidados possam buscar e adicionar músicas diretamente na conta Spotify do anfitrião.

### ✨ **Principais Características:**
- 🎪 **Zero login para convidados** - Apenas nome necessário
- 🎵 **Busca colaborativa** - Todos podem buscar músicas usando credenciais do host
- 🎮 **Controle remoto** - Host controla qualquer dispositivo Spotify
- 💚 **Spotify Free compatível** - Não precisa Premium
- ⚡ **Ultra-simples** - 90% menos complexidade que sistemas tradicionais

---

## 🚀 **Como Funciona**

### 👑 **Para Hosts (Anfitriões):**
1. **Login no Spotify** → Suas credenciais são salvas automaticamente
2. **Criar festa** → Gera código de 6 dígitos
3. **Compartilhar código** → Convidados entram com o código
4. **Controlar reprodução** → Play/pause/skip via API do Spotify

### 👥 **Para Convidados:**
1. **Entrar com código + nome** → Sem necessidade de login no Spotify
2. **Buscar músicas** → Sistema usa credenciais do host automaticamente
3. **Adicionar à fila** → Músicas vão direto para o Spotify do host
4. **Ver fila em tempo real** → Atualizações instantâneas

---

## 🛠️ **Tecnologias Utilizadas**

### **Frontend:**
- ⚛️ **React 18** + TypeScript
- 🎨 **Tailwind CSS** - Design moderno e responsivo
- ⚡ **Vite** - Build tool ultra-rápido
- 🎯 **Lucide React** - Ícones consistentes

### **Backend:**
- 🗄️ **Supabase** - Database PostgreSQL + Real-time
- 🔐 **Row Level Security (RLS)** - Segurança avançada
- 🔄 **Real-time subscriptions** - Atualizações instantâneas

### **Integração:**
- 🎵 **Spotify Web API** - Busca e controle de reprodução
- 🔑 **OAuth 2.0 + PKCE** - Autenticação segura
- 🔄 **Auto-refresh tokens** - Sistema robusto de renovação

### **Deploy:**
- 🚀 **Vercel** - Deploy automático e CDN global
- 🌐 **HTTPS** - Necessário para Spotify API

---

## 📋 **Funcionalidades Detalhadas**

### 🎪 **Sistema de Festas**
- ✅ Criação de festas com código único
- ✅ Entrada de convidados apenas com nome
- ✅ Lista de participantes em tempo real
- ✅ Encerramento automático quando host sai

### 🎵 **Gerenciamento de Música**
- ✅ Busca de músicas usando credenciais compartilhadas
- ✅ Adição à fila do Spotify do host
- ✅ Visualização da fila em tempo real
- ✅ Remoção de músicas (apenas host)
- ✅ Informações detalhadas (artista, álbum, duração)

### 🎮 **Controles de Reprodução**
- ✅ Play/Pause via API do Spotify
- ✅ Pular para próxima música
- ✅ Pular para música anterior
- ✅ Monitoramento do estado atual
- ✅ Funciona com qualquer dispositivo Spotify do host

### 🔐 **Sistema de Credenciais**
- ✅ Salvamento automático de tokens do host
- ✅ Renovação automática quando expira
- ✅ Compartilhamento seguro via Supabase
- ✅ Verificação de expiração a cada 5 minutos

---

## 🏗️ **Arquitetura do Sistema**

### **Fluxo Simplificado:**
```
Host → Login Spotify → Credenciais salvas no Supabase
                           ↓
Convidados → Código + Nome → Usam credenciais do host
                           ↓
Busca/Adiciona músicas → API Spotify com token do host
```

### **Estrutura do Banco (Supabase):**
```sql
parties {
  id, code, name, host_id, host_name,
  host_token, host_refresh_token, token_expires_at,
  is_active, created_at, updated_at
}

guests {
  id, name, party_id, created_at
}

tracks {
  id, spotify_id, name, artist, album,
  duration_ms, image_url, preview_url,
  added_by, added_by_name, party_id, created_at
}
```

### **Funções SQL Customizadas:**
- `get_host_credentials(party_code)` - Busca credenciais do host
- `update_host_token(party_code, new_token, expires_at)` - Atualiza tokens

---

## 🎯 **Vantagens do Sistema Refatorado**

### **Antes (Web Playback SDK):**
- ❌ Requeria Spotify Premium para host
- ❌ Funcionava apenas no navegador específico
- ❌ Complexo de configurar e manter
- ❌ Convidados precisavam login individual
- ❌ Limitado a um dispositivo

### **Agora (API + Credenciais Compartilhadas):**
- ✅ Funciona com Spotify Free
- ✅ Controle remoto de qualquer dispositivo
- ✅ 90% menos código e complexidade
- ✅ Zero login para convidados
- ✅ Sistema robusto e confiável

---

## 🚀 **Como Usar**

### **1. Acesse o App:**
🔗 **https://juke-seven.vercel.app/**

### **2. Como Host:**
1. Clique em **"Entrar com Spotify"**
2. Autorize o aplicativo
3. Crie uma festa com nome
4. Compartilhe o **código de 6 dígitos**
5. Controle a reprodução no seu dispositivo Spotify

### **3. Como Convidado:**
1. Clique em **"Entrar em uma Festa"**
2. Digite o **código** e seu **nome**
3. Busque e adicione músicas
4. Veja a fila atualizar em tempo real

---

## 🔧 **Desenvolvimento Local**

### **Pré-requisitos:**
- Node.js 18+
- Conta Spotify Developer
- Projeto Supabase

### **Configuração:**
```bash
# Clone o repositório
git clone <repo-url>
cd juke

# Instale dependências
npm install

# Configure variáveis de ambiente (.env.local)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/callback
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy na Vercel
vercel --prod
```

### **Configuração Spotify:**
1. Acesse [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Crie um novo app
3. Adicione redirect URI: `https://your-domain.vercel.app/callback`
4. Copie Client ID para as variáveis de ambiente

### **Configuração Supabase:**
1. Execute o SQL de criação das tabelas
2. Configure Row Level Security (RLS)
3. Copie URL e chave anônima

---

## 📊 **Monitoramento e Logs**

### **Logs Importantes:**
- ✅ `Credenciais do host salvas com sucesso`
- 🔄 `Token expirando, renovando...`
- ✅ `Token do host renovado com sucesso`
- ✅ `Música adicionada à fila do host`

### **Tratamento de Erros:**
- 🔄 Auto-retry em falhas de rede
- 🔄 Renovação automática de tokens expirados
- ⚠️ Alertas claros para usuários
- 📝 Logs detalhados para debugging

---

## 🤝 **Contribuição**

### **Como Contribuir:**
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### **Padrões de Código:**
- TypeScript obrigatório
- Comentários em português brasileiro
- Componentes funcionais com hooks
- Tailwind CSS para estilização

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 🎵 **Créditos**

- **Spotify Web API** - Integração musical
- **Supabase** - Backend e real-time
- **Vercel** - Deploy e hosting
- **React** + **TypeScript** - Frontend moderno

---

**🎉 Feito com ❤️ para democratizar festas musicais colaborativas!**