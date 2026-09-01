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

A US02 adiciona a navegação autenticada:

- layout compartilhado para páginas protegidas
- cabeçalho com título contextual
- menu lateral com destaque da rota ativa
- identificação do funcionário e logout
- menu recolhível para dispositivos móveis
- estrutura inicial da visão geral

A US03 implementa o fluxo de clientes:

- listagem integrada à API
- estados de carregamento, erro e lista vazia
- cadastro de cliente em formulário modal
- validação e formatação de telefone e CPF/CNPJ
- tratamento de documento duplicado
- tabela responsiva para dispositivos móveis

A US04 implementa o fluxo de ordens de serviço:

- listagem por status, com ordens abertas e concluídas
- criação de ordem vinculada a um cliente
- conclusão definitiva com valor e forma de pagamento
- atualização imediata da interface após cada operação
- estados de carregamento, erro e lista vazia
- tabela responsiva para dispositivos móveis

A US05 implementa os balanços e conclui a visão geral:

- balanços diário, semanal e mensal integrados à API
- totais e quantidades calculados somente com ordens concluídas
- atualização manual dos indicadores financeiros
- visão geral com valores recebidos e quantidade de ordens abertas
- estados de carregamento e recuperação de erro
- cartões responsivos para dispositivos móveis

A US06 adiciona a edição de clientes:

- alteração de nome, telefone e e-mail
- envio somente dos campos modificados
- CPF/CNPJ exibido como dado imutável
- validação para impedir envio sem alterações
- atualização e reordenação imediata da lista

Testes automatizados não fazem parte desta fase do projeto.
