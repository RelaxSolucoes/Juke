# 🎵 Juke - Spotify Party App

Uma aplicação moderna para criar festas musicais colaborativas usando o Spotify. Permite que hosts criem festas e convidados adicionem músicas à fila em tempo real.

## 🚀 Acesso Rápido

**🌐 App Online:** [https://juke-seven.vercel.app/](https://juke-seven.vercel.app/)

## ✨ Funcionalidades

### 🎯 Para Hosts (Criadores da Festa)
- **Criar Festa:** Gere um código único para sua festa
- **Busca Musica** Sistema de busca em tempo real do Spotify
- **Gerenciar Convidados:** Veja quem está na festa
- **Playlist de Fallback:** Inicie uma playlist automática quando não há músicas na fila
- **Controle Total:** Encerre a festa quando quiser

### 🎉 Para Convidados
- **Entrar na Festa:** Use o código da festa para participar
- **Adicionar Músicas:** Busque e adicione suas músicas favoritas
- **Interface Intuitiva:** Design responsivo e moderno
- **Tempo Real:** Veja outros participantes da festa

## 📱 Responsividade

### ✅ Melhorias Implementadas (Versão Atual)
- **Cabeçalho Mobile Otimizado:**
  - Layout em duas linhas para melhor organização
  - Textos truncados para evitar sobreposição
  - Botões compactos com ícones
  - Código da festa em formato compacto

- **Campos de Busca Responsivos:**
  - Placeholder adaptativo (mais curto no mobile)
  - Tamanhos de fonte e padding ajustados
  - Ícones proporcionais ao tamanho da tela

- **Interface Adaptativa:**
  - Espaçamentos otimizados para mobile
  - Elementos flexíveis que se ajustam ao conteúdo
  - Navegação simplificada em telas pequenas

## 🛠️ Tecnologias

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Build:** Vite
- **Backend:** Supabase (Real-time Database)
- **API:** Spotify Web API (controle remoto)
- **Deploy:** Vercel
- **Testes:** Vitest + Testing Library

## 🏗️ Arquitetura

```
src/
├── components/          # Componentes React
│   ├── HostDashboard.tsx    # Dashboard do host
│   ├── GuestView.tsx        # Interface do convidado
│   ├── LoginScreen.tsx      # Tela de login
│   └── ErrorBoundary.tsx    # Tratamento de erros
├── contexts/           # Contextos React
│   └── AuthContext.tsx     # Autenticação
├── hooks/              # Hooks customizados
│   ├── useLocalStorage.ts  # Persistência local
│   ├── useRateLimit.ts     # Controle de rate limiting
│   └── useDebouncedSearch.ts # Busca com debounce
├── types/              # Definições TypeScript
├── utils/              # Utilitários
│   ├── supabase.ts         # Cliente Supabase
│   ├── spotify.ts          # Integração Spotify
│   └── validation.ts       # Validação e sanitização
└── App.tsx             # Componente principal
```

## 🔧 Configuração para Desenvolvimento

### Pré-requisitos
- Node.js 18+
- Conta Spotify Premium
- Projeto no Supabase
- App registrado no Spotify for Developers

### Variáveis de Ambiente
```env
VITE_SPOTIFY_CLIENT_ID=seu_client_id_spotify
VITE_SPOTIFY_REDIRECT_URI=https://juke-seven.vercel.app/callback
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
```

### Instalação
```bash
# Clone o repositório
git clone https://github.com/RelaxSolucoes/Juke.git
cd Juke

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Execute em desenvolvimento
npm run dev
```

### Testes
```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Deploy para produção
vercel --prod

# Deploy para preview
vercel
```

### Configuração no Vercel
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente no dashboard da Vercel
3. O deploy acontece automaticamente a cada push

## 🔐 Configuração do Spotify

1. Acesse [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Crie um novo app
3. Configure as Redirect URIs:
   - `https://juke-seven.vercel.app/callback` (produção)
   - `http://localhost:5173/callback` (desenvolvimento)
4. Copie o Client ID para as variáveis de ambiente

## 🗄️ Configuração do Supabase

### Schema do Banco
```sql
-- Tabela de festas
CREATE TABLE parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela de convidados
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nota: Tabela de músicas removida - músicas vão direto para o Spotify
-- O sistema foi simplificado para adicionar músicas diretamente na fila do Spotify

-- Políticas RLS (Row Level Security)
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (ajuste conforme necessário)
CREATE POLICY "Allow all operations on parties" ON parties FOR ALL USING (true);
CREATE POLICY "Allow all operations on guests" ON guests FOR ALL USING (true);
```

## 🔧 Correções Recentes (v2.4.1)

### ✅ Correções Críticas
- **SDK Residual Eliminado:** Removido "Juke Party Player" fake do Web Playback SDK
- **Playlist Realmente Opcional:** Festa pode iniciar sem playlist de fundo configurada
- **Limpeza Completa:** Removidos tipos, mocks e resíduos do Web Playback SDK
- **Status Correto:** Interface mostra "🎉 Festa Ativa" ao invés de "♪ Tocando"
- **Mensagens Claras:** "Festa iniciada! Aguardando convidados adicionarem músicas..."

### ✅ Verificação Inteligente de Dispositivos (v2.4.0)
- **Verificação Automática:** Sistema verifica dispositivos Spotify ativos antes de qualquer ação
- **API Oficial:** Implementado baseado na documentação oficial do Spotify Web API
- **Botão Corrigido:** "Iniciar Festa" substitui o confuso botão "Playlist"
- **Modal Educativo:** Guia passo-a-passo para ativar dispositivos Spotify
- **Mensagens Específicas:** Erros claros baseados no estado real dos dispositivos
- **Status em Tempo Real:** Mostra dispositivos disponíveis, ativos e suas informações

### 🧹 Limpeza de UX
- **Componentes Removidos:** OnboardingGuide, HostCallToAction, GuestWelcome, etc.
- **Abordagem Simplificada:** Foco na verificação técnica real ao invés de tutoriais
- **Interface Limpa:** Removida poluição visual de componentes desnecessários

## 🔧 Correções Anteriores (v2.1.3)

### ✅ Problemas Corrigidos
- **OAuth Spotify:** Corrigido erro "invalid_grant" ao fazer login
  - Melhor tratamento de códigos de autorização reutilizados
  - Limpeza automática de dados OAuth antigos
  - Logs detalhados para debugging
  
- **Content Security Policy:** Adicionado suporte ao Google reCAPTCHA
  - CSP atualizado para permitir conexões com Google
  - Correção de erros de bloqueio de recursos

- **Tratamento de Erros:** Interface melhorada para erros de autenticação
  - Mensagens de erro mais claras
  - Redirecionamento automático após erros
  - Prevenção de múltiplas tentativas de callback

## 📊 Funcionalidades Técnicas

### 🎵 Como Funciona a Reprodução
- **Playlist de Fallback:** Host inicia uma playlist automática no Spotify
- **Adição de Músicas:** Convidados adicionam músicas diretamente à fila nativa do Spotify via API
- **Controle Remoto:** App controla dispositivos Spotify existentes (celular, desktop, etc.)
- **Fila Gerenciada pelo Spotify:** Músicas são adicionadas diretamente na fila do Spotify (não salvas no Supabase)
- **Dependência:** Requer dispositivo Spotify ativo e conta Premium

### 🔄 Real-time
- Sincronização em tempo real via Supabase
- Atualizações automáticas da lista de convidados
- Dados da festa sincronizados instantaneamente
- Reprodução gerenciada pelo Spotify (fila nativa)

### 🛡️ Segurança
- Validação e sanitização de dados
- Error boundaries para captura de erros
- Rate limiting para prevenir spam
- Políticas RLS no Supabase

### 🎨 UX/UI
- Design moderno com Tailwind CSS
- Animações suaves e feedback visual
- Interface responsiva para todos os dispositivos
- Tema escuro com gradientes premium

### 🧪 Qualidade
- Testes unitários com Vitest
- TypeScript para type safety
- ESLint para qualidade de código
- Error handling robusto

## 📈 Melhorias Recentes

### v2.4.1 - Correções Críticas de SDK e Playlist Opcional
- ✅ **SDK Residual Removido:** Eliminado "Juke Party Player" fake do Web Playback SDK
- ✅ **Playlist Realmente Opcional:** Festa pode iniciar sem playlist de fundo
- ✅ **Limpeza de Código:** Removidos tipos e mocks do Web Playback SDK
- ✅ **Status Correto:** "🎉 Festa Ativa" ao invés de "♪ Tocando"
- ✅ **Mensagens Claras:** "Festa iniciada! Aguardando convidados adicionarem músicas..."

### v2.4.0 - Verificação Inteligente de Dispositivos Spotify
- ✅ **Verificação de Dispositivos:** Sistema baseado na API oficial do Spotify
- ✅ **Botão "Iniciar Festa":** Substitui o confuso botão "Playlist" 
- ✅ **Modal de Orientação:** Guia passo-a-passo para ativar dispositivos Spotify
- ✅ **Verificação Automática:** Antes de iniciar festa ou adicionar músicas
- ✅ **Status em Tempo Real:** Mostra dispositivos disponíveis e ativos
- ✅ **Mensagens Específicas:** Erros claros baseados no estado real dos dispositivos
- ✅ **UX Simplificada:** Removidos componentes de onboarding complexos

### v2.3.0 - UX Intuitiva e Auto-Explicativa (Removida)
- ❌ **Componentes Removidos:** OnboardingGuide, HostCallToAction, GuestWelcome
- ❌ **Abordagem Complexa:** Substituída por verificação técnica real
- ✅ **Aprendizado:** Implementação baseada em documentação oficial do Spotify

### v2.2.0 - Sistema Híbrido Free + Premium
- ✅ **Arquitetura Híbrida:** Sistema Free (atual) + Premium (futuro) implementado
- ✅ **Context de Planos:** Gerenciamento de funcionalidades Free/Premium
- ✅ **Interface Premium:** Componentes de upgrade e demonstração
- ✅ **Modo Desenvolvedor:** Acesso secreto para testes (dev=true)
- ✅ **Documentação Completa:** Roadmap detalhado das funcionalidades premium
- ✅ **Base Sólida:** Free continua 100% funcional, Premium como adicional

### v2.1.4 - Correção Final de Documentação
- ✅ **Documentação corrigida:** Sistema simplificado - músicas vão direto para o Spotify
- ✅ Esclarecido que usa Spotify Web API (não Web Playback SDK)
- ✅ Explicado que reprodução é gerenciada pelo Spotify (não app)
- ✅ **Correção CSP:** WebSocket do Supabase funcionando sem erros
- ✅ **Fila Simplificada:** Músicas adicionadas diretamente na fila do Spotify (não salvas no Supabase)

### v2.1.1 - Correção de Acentos
- ✅ **Correção crítica:** Nomes com acentos agora são preservados corretamente
- ✅ Suporte completo a caracteres especiais do português (á, é, ç, ã, etc.)
- ✅ Validação aprimorada mantendo segurança contra XSS
- ✅ Banco de dados limpo e otimizado (remoção de tabelas desnecessárias)

### v2.1.0 - Responsividade Mobile
- ✅ Cabeçalho otimizado para mobile
- ✅ Layout adaptativo em duas linhas
- ✅ Botões compactos com tooltips
- ✅ Textos truncados para evitar overflow
- ✅ Placeholders adaptativos
- ✅ Espaçamentos otimizados

### v2.0.0 - Funcionalidades Avançadas
- ✅ Backend real com Supabase
- ✅ Sistema de testes completo
- ✅ Error boundaries e validação
- ✅ Hooks customizados
- ✅ Deploy automatizado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Roadmap

### 🆓 Versão Free (Atual)
- [x] Criação e entrada em festas
- [x] Busca e adição de músicas
- [x] Sistema em tempo real
- [x] Interface responsiva
- [x] Playlist de fallback

### 💎 Versão Premium (Em Desenvolvimento)
- [ ] **Modo TV** - Tela dedicada para mostrar música atual e fila
- [ ] **Visualização da Fila** - Ver todas as músicas que vão tocar
- [ ] **Sistema de Votação** - Músicas mais votadas tocam primeiro
- [ ] **Gerenciamento de Fila** - Host pode remover músicas
- [ ] **Player Integrado** - Controles avançados no navegador
- [ ] **Controles Avançados** - Volume, posição, pular músicas

### 🚀 Futuro
- [ ] Chat em tempo real
- [ ] Histórico de festas
- [ ] Playlists personalizadas
- [ ] App mobile nativo

> 📋 **Documentação completa:** Veja `PREMIUM_ROADMAP.md` para detalhes técnicos

## 📞 Suporte

Para suporte ou dúvidas:
- 📧 Email: suporte@relaxsolucoes.com
- 🐛 Issues: [GitHub Issues](https://github.com/RelaxSolucoes/Juke/issues)
- 📖 Documentação: [Wiki do Projeto](https://github.com/RelaxSolucoes/Juke/wiki)

---

**Desenvolvido com ❤️ pela equipe Relax Soluções**

🎵 *"Música é a linguagem universal que conecta pessoas"* 🎵