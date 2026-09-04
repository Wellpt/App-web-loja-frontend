# Histórico de alterações

Este arquivo registra as mudanças funcionais e operacionais relevantes do
frontend. Os commits e pull requests permanecem como fonte dos detalhes de
implementação e revisão.

## 2026-09-03 — Release 20260903

### Vendas — US14

- Criada a área de cadastro e histórico de vendas.
- Adicionado cliente opcional e suporte a múltiplos itens.
- Adicionados subtotal por item, total da venda e forma de pagamento.
- Registrado automaticamente o funcionário autenticado por meio da sessão.
- Vendas são concluídas no cadastro e não possuem edição, cancelamento ou
  exclusão.
- Adicionados menu, rota e atalhos para a área de vendas.

### Custos da ordem de serviço — US15

- Adicionado custo opcional de materiais na abertura da OS.
- Adicionado cálculo de mão de obra: valor cobrado menos custo dos materiais.
- Permitida a alteração do valor, do custo ou de ambos enquanto a OS estiver
  aberta.
- Adicionado detalhamento dos valores na área de ordens.
- Mantidos custos e mão de obra fora da impressão destinada ao cliente.

### Balanços — US16

- Separadas as quantidades e receitas de serviços e vendas.
- Mantido o faturamento total como soma de `valor_servicos` e `valor_vendas`.
- Ordens entram no balanço somente após a conclusão.
- Vendas entram no balanço no momento do cadastro.
- Custos de materiais e mão de obra não reduzem o faturamento apresentado.
- Mantido o acesso aos balanços exclusivo para empresários.

### Dependência de publicação

- O frontend desta release depende dos contratos do backend incluídos em
  `release/20260903`.
- O backend deve ser publicado antes do merge da release do frontend na
  `main`.
- O merge na `main` inicia automaticamente o deploy do GitHub Pages.

## 2026-09-02 — Release 020926

- Configurado o deploy automático no GitHub Pages.
- Publicado o frontend em
  <https://wellpt.github.io/App-web-loja-frontend/>.
- Adicionada impressão de ordens em formato adequado para A4 e PDF.
- Tornado obrigatório o valor na abertura de novas ordens.
- Permitida a alteração do valor enquanto a ordem estiver aberta.
- Alterada a conclusão da OS para solicitar apenas a forma de pagamento.
- Atualizada a identidade visual da aplicação para VTcell.

## 2026-09-01 — Operação inicial

- Criados layout autenticado e navegação responsiva.
- Implementados cadastro, listagem e edição de clientes.
- Implementados criação, listagem e conclusão de ordens de serviço.
- Implementados balanços diário, semanal e mensal.
- Criada a visão geral com indicadores financeiros e operacionais.
- Adicionados os perfis `funcionario` e `empresario`.
- Implementados cadastro e gerenciamento de funcionários.
- Adicionado controle para ocultar valores financeiros, ocultos por padrão.
- Adicionadas as datas de abertura e conclusão ao histórico das ordens.

## 2026-08-29 — Fundação do frontend

- Criado o projeto com React, TypeScript e Vite.
- Adicionados cliente HTTP centralizado, proxy local e React Router.
- Implementados login, logout e proteção das rotas autenticadas.
