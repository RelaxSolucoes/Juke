# 🎵 Juke - Spotify Party App

Um aplicativo de festa colaborativa que permite que convidados adicionem músicas à fila do Spotify do host sem precisar fazer login individual.

## 🚀 Funcionalidades

### Para o Host (Organizador da Festa)
- **Login com Spotify**: Autenticação segura com sua conta Spotify
- **Criar Festa**: Gere um código único para sua festa
- **Playlist de Fallback**: Configure uma playlist que toca automaticamente quando ninguém adiciona músicas
- **Controle de Reprodução**: Play/pause via API do Spotify
- **Busca de Músicas**: Busque e adicione músicas usando suas credenciais
- **Visualizar Convidados**: Veja quem está participando da festa

### Para Convidados
- **Entrada Simples**: Entre apenas com seu nome, sem login
- **Busca Colaborativa**: Busque músicas usando as credenciais do host
- **Adicionar à Fila**: Adicione músicas diretamente à fila do Spotify do host
- **Interface Responsiva**: Funciona perfeitamente no mobile

## 📋 Requisitos

### Para o Host
- **Spotify Premium**: Necessário para controlar a reprodução
- **Dispositivo Ativo**: Tenha o Spotify aberto em algum dispositivo (celular, computador, etc.)
- **Conexão com Internet**: Para sincronização em tempo real

### Para Convidados
- **Apenas um navegador**: Não precisa de conta Spotify ou Premium

## 🎯 Como Usar

### 1. Host - Criando uma Festa
1. Acesse o app e faça login com sua conta Spotify
2. Clique em "Criar Nova Festa"
3. Digite o nome da festa
4. **[OPCIONAL]** Selecione uma playlist de fallback:
   - Clique em "Selecionar Playlist"
   - Escolha uma de suas playlists
   - Esta playlist tocará automaticamente quando ninguém adicionar músicas
5. Clique em "Criar Festa"
6. Compartilhe o código gerado com seus convidados

### 2. Convidados - Entrando na Festa
1. Acesse o app
2. Digite o código da festa
3. Digite seu nome
4. Comece a buscar e adicionar músicas!

### 3. Iniciando a Playlist de Fallback
1. Na tela do host, clique no botão "Playlist" no header
2. A playlist configurada começará a tocar no seu Spotify
3. **Importante**: Certifique-se de que o Spotify está aberto em algum dispositivo

## ⚠️ Problemas Comuns e Soluções

### "Nenhum dispositivo Spotify ativo encontrado"
- **Solução**: Abra o Spotify em qualquer dispositivo (celular, computador, etc.)
- O app precisa de um dispositivo ativo para enviar comandos
- Aguarde alguns segundos após abrir o Spotify antes de tentar novamente

### "Nenhuma playlist de fallback configurada"
- **Solução**: Crie uma nova festa e selecione uma playlist durante a criação
- Festas já criadas sem playlist não podem ter uma adicionada posteriormente

### "Spotify Premium é necessário"
- **Solução**: Apenas o host precisa de Premium, convidados não
- O controle de reprodução via API requer Premium

### Músicas não aparecem na fila visual
- **Comportamento Normal**: O app adiciona diretamente à fila do Spotify
- Verifique a fila no próprio aplicativo do Spotify

### Playlist inicia mas mostra erro
- **Comportamento Normal**: Às vezes o Spotify "acorda" durante o processo
- Se a música começou a tocar, ignore a mensagem de erro

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **API**: Spotify Web API
- **Deploy**: Vercel

## 🔧 Arquitetura Simplificada

1. **Host faz login** → Credenciais salvas na festa (Supabase)
2. **Convidados entram** → Usam credenciais do host automaticamente
3. **Busca e adição** → Via API do Spotify com credenciais compartilhadas
4. **Controle de reprodução** → Comandos diretos para API do Spotify
5. **Playlist de fallback** → Reprodução automática quando configurada

## 🌐 Deploy

Aplicação disponível em: [https://juke-6kjg5t9zo-ronald-melos-projects.vercel.app/](https://juke-6kjg5t9zo-ronald-melos-projects.vercel.app/)

## 📝 Notas Importantes

- **Privacidade**: Convidados não têm acesso às credenciais do host
- **Segurança**: Tokens são gerenciados automaticamente e renovados quando necessário
- **Limitações**: Funciona apenas com Spotify Premium para o host
- **Compatibilidade**: Testado em Chrome, Firefox, Safari e Edge
- **Performance**: Busca AJAX em tempo real com debounce de 500ms
- **Mobile**: Interface otimizada para dispositivos móveis

## 🎵 Funcionalidades Avançadas

### Playlist de Fallback
- Configure uma playlist que toca automaticamente
- Ideal para manter a festa animada quando ninguém adiciona músicas
- Funciona com qualquer playlist pública ou própria do host

### Busca Inteligente
- Busca em tempo real enquanto você digita
- Resultados instantâneos da biblioteca completa do Spotify
- Interface otimizada para mobile e desktop

### Controle Simplificado
- Foco total na experiência de adicionar músicas
- Interface limpa sem elementos desnecessários
- Feedback visual imediato ao adicionar músicas

## 🚀 Próximas Funcionalidades

- [ ] Votação em músicas da fila
- [ ] Histórico de músicas tocadas
- [ ] Temas personalizáveis
- [ ] Integração com outras plataformas de música

---

Desenvolvido com ❤️ para festas mais divertidas e colaborativas!

**Versão atual**: 2.0 - MVP com Playlist de Fallback
**Última atualização**: Dezembro 2024