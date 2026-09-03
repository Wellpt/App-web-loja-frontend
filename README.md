# VTcell - Frontend

Frontend da aplicação VTcell, criado com React, TypeScript e Vite.

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

## Publicação no GitHub Pages

O workflow **.github/workflows/deploy-pages.yml** gera e publica o frontend em:

- https://wellpt.github.io/App-web-loja-frontend/

Antes de ativar a integração com o backend publicado, cadastre a variável
**VITE_API_BASE_URL** em **Settings > Secrets and variables > Actions > Variables**
com a URL pública da API, sem barra no final.

Em **Settings > Pages**, selecione **GitHub Actions** como fonte da publicação.
O deploy ocorre automaticamente após alterações integradas à branch **main** e
também pode ser iniciado manualmente pela aba **Actions**.

O build do Pages usa o caminho-base **/App-web-loja-frontend/**. O ambiente local
continua usando **/** e o proxy **/api**.

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

A US07 adiciona perfis de acesso e gestão da equipe:

- autenticação com os perfis funcionário e empresário
- menu e rotas protegidos conforme as permissões
- dashboard sem dados financeiros para funcionários
- cadastro de funcionário exclusivo para empresários
- perfil funcionário atribuído automaticamente
- tratamento das mensagens de erro da API

A US08 completa o gerenciamento de funcionários:

- listagem alfabética de contas com perfil funcionário
- identificação visual de acessos ativos e inativos
- desativação com confirmação
- reativação de acesso
- atualização imediata da linha alterada
- preservação do histórico sem exclusão de contas

A US09 adiciona privacidade aos indicadores financeiros:

- botão para ocultar e mostrar valores na visão geral
- totais financeiros mascarados sem ocultar indicadores operacionais
- controle disponível somente para o perfil empresário
- preferência mantida apenas durante a exibição atual

A US10 aprimora o histórico das ordens:

- data de abertura sempre visível
- data de conclusão exibida adicionalmente nas ordens finalizadas
- identificação visual entre abertura e conclusão

A US11 adiciona impressão de ordens de serviço:

- ação de impressão para ordens abertas e concluídas
- documento A4 com dados do cliente e do serviço
- datas, situação e recebimento
- campos para assinatura
- suporte ao diálogo nativo e salvamento em PDF

Testes automatizados não fazem parte desta fase do projeto.
