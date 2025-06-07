# 🎵 Juke - Spotify Party App

Uma aplicação moderna para criar festas musicais colaborativas usando o Spotify. Permite que hosts criem festas e convidados adicionem músicas à fila em tempo real.

## 🚀 Acesso Rápido

**🌐 App Online:** [https://juke-seven.vercel.app/](https://juke-seven.vercel.app/)

## ✨ Funcionalidades

### 🎯 Para Hosts (Criadores da Festa)
- **Criar Festa:** Gere um código único para sua festa
- **Busca Musical Premium:** Sistema de busca em tempo real do Spotify
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
- **API:** Spotify Web API + Web Playback SDK
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

-- Tabela de músicas
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  spotify_id TEXT NOT NULL,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration_ms INTEGER,
  image_url TEXT,
  added_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS (Row Level Security)
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (ajuste conforme necessário)
CREATE POLICY "Allow all operations on parties" ON parties FOR ALL USING (true);
CREATE POLICY "Allow all operations on guests" ON guests FOR ALL USING (true);
CREATE POLICY "Allow all operations on tracks" ON tracks FOR ALL USING (true);
```

## 📊 Funcionalidades Técnicas

### 🔄 Real-time
- Sincronização em tempo real via Supabase
- Atualizações automáticas da lista de convidados
- Fila de músicas atualizada instantaneamente

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

- [ ] Sistema de votação para músicas
- [ ] Chat em tempo real
- [ ] Histórico de festas
- [ ] Playlists personalizadas
- [ ] Integração com outras plataformas de música
- [ ] App mobile nativo

## 📞 Suporte

Para suporte ou dúvidas:
- 📧 Email: suporte@relaxsolucoes.com
- 🐛 Issues: [GitHub Issues](https://github.com/RelaxSolucoes/Juke/issues)
- 📖 Documentação: [Wiki do Projeto](https://github.com/RelaxSolucoes/Juke/wiki)

---

**Desenvolvido com ❤️ pela equipe Relax Soluções**

🎵 *"Música é a linguagem universal que conecta pessoas"* 🎵