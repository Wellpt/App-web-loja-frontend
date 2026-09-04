# Contratos consumidos pelo frontend

Última atualização: 2026-09-03.

Este documento registra os contratos que orientam a integração do frontend da
VTcell. Ele deve ser atualizado no mesmo PR sempre que um endpoint, campo,
permissão ou regra de negócio mudar.

## Comunicação com a API

### Ambientes

- Desenvolvimento: o frontend chama `/api` e o Vite encaminha a requisição para
  `http://localhost:8080`.
- Produção: `VITE_API_BASE_URL` deve conter
  `https://app-web-loja-api.onrender.com`, sem barra no final.
- Publicação do frontend:
  <https://wellpt.github.io/App-web-loja-frontend/>.

### Regras comuns

- Todas as requisições passam por `src/api/http.ts`.
- Todas enviam `credentials: "include"`.
- Corpos JSON recebem `Content-Type: application/json` automaticamente.
- Erros da API seguem o formato `{ "erro": "mensagem" }`.
- O frontend apresenta a mensagem de `erro` ao usuário.
- Uma resposta `401` limpa o estado local de autenticação.
- O cookie de produção é HttpOnly, Secure, SameSite=None e possui Path=/.

## Permissões

| Área | Funcionário | Empresário |
| --- | --- | --- |
| Visão geral operacional | Sim | Sim |
| Clientes | Sim | Sim |
| Ordens de serviço | Sim | Sim |
| Vendas | Sim | Sim |
| Balanços | Não | Sim |
| Funcionários | Não | Sim |

As restrições de balanços e funcionários existem no menu, nas rotas do
frontend e no backend.

## Autenticação

### Entrar

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "usuario@loja.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "funcionario": {
    "id": 1,
    "nome": "Wellington",
    "email": "usuario@loja.com",
    "perfil": "empresario"
  },
  "expira_em": "2026-09-03T20:00:00Z"
}
```

`perfil` aceita apenas `funcionario` ou `empresario`.

### Sair

```http
POST /auth/logout
```

O estado autenticado é mantido somente na memória do React. Recarregar a página
exige um novo login.

## Clientes

### Listar

```http
GET /customers
```

Resposta:

```json
{
  "clientes": [
    {
      "id": 1,
      "nome": "Cliente Teste",
      "telefone": "21988887777",
      "email": "cliente@teste.com",
      "documento": "12345678901"
    }
  ]
}
```

### Cadastrar

```http
POST /customers
Content-Type: application/json
```

O cadastro envia `nome`, `telefone`, `email` e `documento`.

### Atualizar

```http
PATCH /customers/{id}
Content-Type: application/json
```

```json
{
  "nome": "Cliente Atualizado",
  "telefone": "21999999999",
  "email": "atualizado@teste.com"
}
```

- Todos os campos são opcionais, mas ao menos um deve ser enviado.
- O frontend envia somente campos alterados.
- `documento` é imutável e nunca deve ser enviado no PATCH.

## Funcionários

Esta área é exclusiva do perfil `empresario`.

### Cadastrar

```http
POST /employees
Content-Type: application/json
```

```json
{
  "nome": "Funcionário Teste",
  "email": "funcionario@loja.com",
  "senha": "123456"
}
```

- A senha deve possuir entre 6 e 8 caracteres.
- O perfil é sempre `funcionario`.

### Listar

```http
GET /employees
```

A resposta possui `funcionarios` com `id`, `nome`, `email`, `perfil` e
`ativo`. A conta do empresário não aparece.

### Alterar situação

```http
PATCH /employees/{id}
Content-Type: application/json
```

```json
{
  "ativo": false
}
```

A demissão é representada pela desativação. Não existe exclusão de funcionário.

## Ordens de serviço

Modelo retornado após a release 20260903:

```ts
type ServiceOrder = {
  id: number;
  cliente: {
    id: number;
    nome: string;
  };
  descricao_servico: string;
  status: "aberta" | "concluida";
  valor: number | null;
  custo_materiais: number;
  valor_mao_de_obra: number | null;
  forma_pagamento: string | null;
  criada_em: string;
  concluida_em: string | null;
};
```

Ordens antigas abertas ainda podem possuir `valor: null`. Nesse caso,
`valor_mao_de_obra` também pode não estar disponível.

### Listar

```http
GET /service-orders
```

A resposta possui `ordens_servico` ordenadas da mais recente para a mais antiga.

### Cadastrar

```http
POST /service-orders
Content-Type: application/json
```

```json
{
  "cliente_id": 1,
  "descricao_servico": "Troca de tela",
  "valor": 300,
  "custo_materiais": 100
}
```

- `valor` é obrigatório e deve ser maior que zero.
- `custo_materiais` é opcional e assume zero quando omitido.
- O custo não pode ser negativo ou maior que `valor`.
- O backend calcula `valor_mao_de_obra = valor - custo_materiais`.

### Alterar valores

```http
PATCH /service-orders/{id}
Content-Type: application/json
```

Pode enviar `valor`, `custo_materiais` ou ambos:

```json
{
  "valor": 350,
  "custo_materiais": 120
}
```

- Ao menos um campo deve ser enviado.
- A alteração é permitida somente enquanto a OS estiver aberta.
- O frontend substitui a OS na lista pelo objeto devolvido pela API.

### Concluir

```http
PATCH /service-orders/{id}/complete
Content-Type: application/json
```

```json
{
  "forma_pagamento": "Pix"
}
```

- Não enviar `status`, `valor` ou `custo_materiais`.
- Depois da conclusão, valor e custo ficam bloqueados.
- A OS entra no balanço somente após a conclusão.

### Impressão

A impressão destinada ao cliente contém o valor cobrado e a situação do
pagamento. `custo_materiais` e `valor_mao_de_obra` são informações internas e
não devem aparecer nesse documento.

## Vendas

Modelo retornado:

```ts
type Sale = {
  id: number;
  cliente: {
    id: number;
    nome: string;
  } | null;
  itens: Array<{
    id: number;
    descricao: string;
    quantidade: number;
    valor_unitario: number;
    subtotal: number;
  }>;
  forma_pagamento: string;
  valor_total: number;
  funcionario: {
    id: number;
    nome: string;
  };
  status: "concluida";
  realizada_em: string;
};
```

### Cadastrar

```http
POST /sales
Content-Type: application/json
```

```json
{
  "cliente_id": null,
  "itens": [
    {
      "descricao": "Capa para celular",
      "quantidade": 1,
      "valor_unitario": 50
    }
  ],
  "forma_pagamento": "Pix"
}
```

- `cliente_id` é opcional e pode ser omitido ou enviado como `null`.
- Deve existir ao menos um item.
- Descrição é obrigatória.
- Quantidade e valor unitário devem ser maiores que zero.
- Subtotais e total são calculados pelo backend.
- O funcionário é obtido da sessão.
- A venda nasce concluída.
- Não existem edição, cancelamento ou exclusão.

### Listar

```http
GET /sales
```

A resposta possui `vendas` da mais recente para a mais antiga. Quando não
existirem registros, `vendas` será um array vazio.

## Balanços

Esta área é exclusiva do perfil `empresario`.

```http
GET /balances?periodo=diario
GET /balances?periodo=semanal
GET /balances?periodo=mensal
```

Resposta:

```json
{
  "balanco": {
    "periodo": "diario",
    "quantidade_ordens": 2,
    "valor_servicos": 500,
    "quantidade_vendas": 3,
    "valor_vendas": 250,
    "valor_total": 750
  }
}
```

- Serviços consideram somente ordens concluídas.
- Vendas entram no balanço no momento do cadastro.
- `valor_total = valor_servicos + valor_vendas`.
- Custos e mão de obra não alteram o faturamento apresentado.
- Os períodos seguem o fuso horário de São Paulo.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica o frontend sempre que
há um push na `main`.

Quando uma release altera o contrato entre as aplicações:

1. publicar a release correspondente do backend;
2. validar a API de produção;
3. integrar a release do frontend na `main`;
4. aguardar o workflow do GitHub Pages;
5. validar login, operações alteradas e balanços em produção.

Para a release de 2026-09-03, o backend deve conter `release/20260903` antes da
publicação do frontend.

## Manutenção deste documento

Em cada mudança de contrato:

1. atualizar os tipos em `src/types`;
2. atualizar a função correspondente em `src/api`;
3. atualizar este documento;
4. registrar a mudança no `CHANGELOG.md`;
5. executar `npm run lint` e `npm run build`;
6. descrever o impacto e a ordem de deploy no pull request.
