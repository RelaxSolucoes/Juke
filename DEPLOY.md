# 🚀 Deploy na Vercel - Spotify Party App

Este guia te ajudará a fazer o deploy do Spotify Party App na Vercel.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com)
- Conta no [Spotify for Developers](https://developer.spotify.com)
- Projeto no [Supabase](https://supabase.com)

## 🔧 Configuração Inicial

### 1. Prepare o Repositório GitHub

```bash
# Inicialize o Git (se ainda não fez)
git init
git add .
git commit -m "Initial commit: Spotify Party App"

# Adicione o repositório remoto
git remote add origin https://github.com/seu-usuario/spotify-party-app.git
git branch -M main
git push -u origin main
```

### 2. Configure o Spotify App

1. Acesse [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Crie um novo app ou edite o existente
3. Nas configurações, adicione as URLs de redirecionamento:
   - `http://localhost:5173/callback` (desenvolvimento)
   - `https://seu-dominio.vercel.app/callback` (produção)
4. Anote o **Client ID** para usar nas variáveis de ambiente

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL do arquivo `supabase-schema.sql` no SQL Editor
3. Anote a **URL do projeto** e **Anon Key** das configurações

## 🚀 Deploy na Vercel

### Opção 1: Deploy via Dashboard (Recomendado)

1. **Conecte seu GitHub à Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login ou crie uma conta
   - Clique em "New Project"
   - Conecte sua conta do GitHub
   - Selecione o repositório do Spotify Party App

2. **Configure o Projeto:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Configure as Variáveis de Ambiente:**
   
   Clique em "Environment Variables" e adicione:

   ```bash
   # Spotify API
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=https://seu-dominio.vercel.app/callback

   # Supabase
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build concluir (2-3 minutos)
   - Sua aplicação estará disponível em `https://seu-projeto.vercel.app`

### Opção 2: Deploy via CLI

```bash
# Instale a Vercel CLI (se ainda não fez)
npm install -g vercel

# Faça login na Vercel
vercel login

# Configure e faça deploy
vercel

# Siga as instruções:
# ? Set up and deploy "~/Juke"? [Y/n] y
# ? Which scope do you want to deploy to? Seu Username
# ? Link to existing project? [y/N] n
# ? What's your project's name? spotify-party-app
# ? In which directory is your code located? ./

# Configure as variáveis de ambiente
vercel env add VITE_SPOTIFY_CLIENT_ID production
vercel env add VITE_SPOTIFY_REDIRECT_URI production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Deploy para produção
vercel --prod
```

## 🔄 Configuração Pós-Deploy

### 1. Atualize o Spotify App

Depois do deploy, você terá uma URL da Vercel. Atualize o Spotify App:

1. Vá em [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Selecione seu app
3. Vá em "Settings"
4. Adicione a URL de callback: `https://seu-dominio.vercel.app/callback`

### 2. Teste a Aplicação

1. Acesse sua aplicação na URL da Vercel
2. Teste o login com Spotify
3. Teste criação de festa e entrada como convidado
4. Verifique se todas as funcionalidades estão funcionando

## 🔄 Deploy Automático

A Vercel automaticamente fará redeploy quando você fizer push para o branch main:

```bash
# Faça mudanças no código
git add .
git commit -m "Sua mensagem de commit"
git push origin main

# A Vercel automaticamente detectará e fará o deploy
```

## 🐛 Troubleshooting

### Erro de Redirect URI
```
Error: redirect_uri_mismatch
```
**Solução:** Verifique se a URL de callback no Spotify App está correta.

### Erro de CORS
```
Error: CORS policy blocked
```
**Solução:** As APIs do Spotify e Supabase já têm CORS configurado. Verifique se as URLs estão corretas.

### Erro de Build
```
Error: Build failed
```
**Solução:** Verifique se todas as variáveis de ambiente estão configuradas corretamente.

### Erro de Supabase
```
Error: Invalid project URL
```
**Solução:** Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos.

## 📊 Monitoramento

### Analytics da Vercel
- Acesse o dashboard da Vercel
- Vá em "Analytics" para ver métricas de uso
- Monitor performance e erros

### Logs da Vercel
- Acesse "Functions" → "View Function Logs"
- Monitor erros em tempo real
- Configure alertas se necessário

## 🔐 Segurança em Produção

### Headers de Segurança
O arquivo `vercel.json` já inclui headers de segurança:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Variáveis de Ambiente
- ✅ Nunca commite variáveis sensíveis no código
- ✅ Use apenas variáveis prefixadas com `VITE_` no frontend
- ✅ Configure todas as variáveis no dashboard da Vercel

## 🎯 Otimizações

### Performance
- ✅ Vite já otimiza automaticamente o bundle
- ✅ Tree-shaking automático
- ✅ Code splitting implementado
- ✅ Assets com cache otimizado

### SEO
- ✅ Meta tags configuradas no `index.html`
- ✅ Título e descrição otimizados
- ✅ OpenGraph tags para compartilhamento

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# Faça suas mudanças
git add .
git commit -m "Feature: Nova funcionalidade"
git push origin main

# A Vercel automaticamente fará o deploy
```

---

**🎉 Parabéns! Sua Spotify Party App está no ar!**

Compartilhe o link com seus amigos e aproveitem as festas musicais colaborativas! 