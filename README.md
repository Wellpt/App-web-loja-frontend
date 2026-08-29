# App Web Loja - Frontend

Frontend da aplicação App Web Loja, criado com React, TypeScript e Vite.

## Requisitos

- Node.js na versão LTS
- npm
- Backend disponível em `http://localhost:8080`

## Executando localmente

```bash
npm install
npm run dev
```

O Vite inicia o frontend e encaminha chamadas feitas para `/api` ao backend
local, removendo esse prefixo antes de enviar a requisição.

## Comandos

```bash
npm run dev      # ambiente de desenvolvimento
npm run lint     # análise estática
npm run build    # build de produção
npm run preview  # visualização do build
```

## Estrutura

```text
src/
  api/         comunicação com o backend
  components/  componentes compartilhados
  contexts/    providers e contextos React
  hooks/       hooks reutilizáveis
  pages/       páginas da aplicação
  routes/      configuração das rotas
  styles/      estilos globais
  types/       contratos TypeScript
```

## Autenticação

- A API cria uma sessão por cookie HttpOnly.
- Todas as requisições usam `credentials: "include"`.
- Nenhum token é armazenado no `localStorage`.
- O funcionário autenticado permanece somente na memória do React.
- Ao recarregar a página, o usuário deve entrar novamente.
- Uma resposta `401` limpa o estado local e redireciona para o login.

## Escopo atual

A US01 estabelece a fundação do frontend:

- React, TypeScript e Vite
- React Router declarativo
- proxy `/api`
- cliente HTTP centralizado
- login e logout
- rotas protegidas
- interface responsiva inicial

Testes automatizados não fazem parte desta fase do projeto.
