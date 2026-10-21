# Despesas — frontend

Data: 2026-10-21. Branch: `feat/store-expenses`. Destino do PR: `release/20261021`.

## Escopo

### Disponibilidade Premium

Fluxo funcional validado pelo responsável antes do bloqueio. Nesta entrega, Despesas fica ao final do menu, após Orçamentos, apagado e sem clique, com aviso “Funcionalidade exclusiva do plano Premium.” O endereço direto mostra o mesmo aviso. Lembretes e resumo de despesas/líquido não são montados nas telas abertas enquanto a feature estiver bloqueada.

Disponibilidade temporária centralizada em `src/config/features.ts`. Como o login ainda não informa plano, o bloqueio se aplica a todos no frontend. Autorização por assinatura no backend e liberação por cliente serão tratadas em outra US; esta configuração não protege endpoints da API. A implementação abaixo permanece preservada para futura liberação.

- Menu e rota `/despesas` exclusivos do empresário, usando a proteção de perfil existente.
- Cadastro com descrição livre, valor e data de vencimento, sem categoria. Conta começa pendente.
- Consulta, busca por descrição/número e filtros: todas, pendentes, atrasadas, pagas e com lembrete.
- Edição de contas não pagas envia a revisão atual. Em 409/404, exige cancelar a edição e conferir os dados atualizados.
- Pagamento em janela de confirmação, exibindo descrição, valor e vencimento. Data real de pagamento obrigatória, sem datas futuras, considerando hoje em São Paulo.
- Pagamento não é uma nova despesa. Envia somente data e revisão; a API garante a repetição sem duplicar desconto.
- Contas pagas permanecem no histórico e não oferecem edição nem novo pagamento.
- Requisições duplicadas bloqueadas durante a submissão; erros preservam o preenchimento. Conflitos no pagamento exigem fechar a janela e conferir a lista atualizada.

## Lembretes

Na Visão geral do empresário, painel de lembretes com descrição, vencimento e dias até o vencimento/atraso. Não mostra valores financeiros, preservando a privacidade dos indicadores ocultos. Mostra até cinco contas e o total com acesso à página Despesas.

Na página Despesas, o aviso mostra a quantidade de contas que precisam de atenção e permite filtrar essas contas. Cada conta elegível mostra “Vence em X dias”, “Vence hoje” ou “Vencida há X dias”.

Situação e elegibilidade são calculadas pela API: cinco dias antes, incluindo o vencimento e todos os atrasos; contas pagas ficam fora. A leitura não dispensa o lembrete.

As consultas são atualizadas ao abrir a tela, ao retornar à aba/janela e após cadastro/edição/pagamento. Enquanto a aba está visível, uma checagem a cada minuto detecta mudança do dia em America/Sao_Paulo e atualiza os dados. Ao reabrir uma aba suspensa, atualiza imediatamente. Não há notificações fora do aplicativo.

## Balanços

Faturamento bruto (`valor_total`) permanece preservado. Nos balanços diário, semanal, mensal e histórico mensal, exibir também `valor_despesas` e `valor_liquido` retornados pela API. Resultado negativo é exibido com sinal e destaque. Contas pendentes não são descontadas.

Caso o backend ainda não forneça esses campos, apresentar resumo de despesas indisponível, sem inventar valores zero. Os indicadores de recebimentos da Visão geral continuam mostrando o faturamento bruto.

## Contratos

| Método | Endpoint | Uso |
| --- | --- | --- |
| GET | `/expenses` | Lista `{ despesas: [...] }` |
| GET | `/expenses/alerts` | Lembretes `{ alertas: [...] }` |
| POST | `/expenses` | `{ descricao, valor, data_vencimento }` |
| PATCH | `/expenses/{id}` | Campos do cadastro mais `revisao` |
| POST | `/expenses/{id}/pay` | `{ data_pagamento, revisao }` |

Mutações retornam `{ despesa }`. Todos usam cookie de sessão pelo cliente HTTP existente. Revisão e autoria não são preenchidas manualmente pelo usuário. Tipos em `src/types/expense.ts`.

## Roteiro manual

1. Empresário vê Despesas; funcionário não vê menu/lembretes e não acessa a rota.
2. Cadastrar descrição, valor e vencimento; consultar novamente e conferir dados persistidos. Testar lista vazia e busca sem resultado.
3. Conferir contas a seis dias, cinco dias, hoje e ontem: somente a de seis dias fica fora dos lembretes. Verificar Visão geral e filtro Com lembrete.
4. Conferir retorno à aba e mudança do dia de São Paulo; lembretes continuam até pagar.
5. Abrir pagamento e cancelar: nada deve mudar. Confirmar: status Paga, saída dos alertas, permanência no histórico e reflexo no balanço da data informada.
6. Conferir resultado negativo e histórico mensal. Conta pendente não altera os valores financeiros.
7. Validar descrição vazia, valor zero e ausência de vencimento. No pagamento, rejeitar data futura.
8. Em duas sessões, testar conflito de revisão. O formulário não pode sobrescrever silenciosamente dados mais recentes.
9. Conferir falha da API, mensagem e Tentar novamente. Erros de lembretes não podem ocultar os demais indicadores da Visão geral.
10. Conferir desktop, tablet e celular, abertura/fechamento da janela pelo teclado e visibilidade de Sair no menu. Estilos globais e breakpoints existentes não foram alterados.

## Integração e publicação

PR desta branch para `release/20261021`, não para main. Orçamentos permanece no último item, reservado ao Premium. Esta feature não muda seu bloqueio.

Backend de Despesas e migrações até a versão 12 precisam estar disponíveis antes de publicar este frontend. Não há migração automática nesta aplicação.

Testes visuais e funcionais serão realizados pelo responsável no ambiente local. Nenhum commit, push, deploy ou comando Docker foi executado pelo assistente.
