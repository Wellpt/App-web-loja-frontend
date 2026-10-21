# Orçamentos — frontend

Data: 2026-10-21. Branch: `feat/service-quotes`. Destino do PR: `release/20261021`.

## Funcionamento

### Disponibilidade Premium

Orçamentos fica na última posição do menu, apagado, sem navegação e com aviso “Funcionalidade exclusiva do plano Premium.” ao passar o mouse ou focar pelo teclado. O endereço direto apresenta o aviso, sem montar a tela de operações. O módulo implementado permanece preservado para futura liberação.

O contrato atual de autenticação não informa plano. Portanto, o bloqueio atual se aplica a todos no frontend; não representa autorização Premium na API. A liberação por assinatura exige contrato e validação no backend. O roteiro abaixo descreve o módulo quando liberado.

- Menu Orçamentos (`/orcamentos`) disponível para empresário e funcionário autenticados.
- Cadastro com cliente, descrição do serviço (até 5.000 caracteres), valor positivo e custo interno opcional dos materiais, limitado ao valor total.
- Valores monetários usam a máscara em centavos já adotada pelo sistema.
- Busca por número, nome do cliente ou descrição; filtro por pendentes e convertidos.
- Edição somente de orçamento pendente. A revisão vem da API, sem entrada manual.
- Impressão pelo navegador, com cliente, serviço, datas e total. O custo dos materiais não aparece no documento.
- Conversão pede confirmação e cria uma OS aberta. O número retornado aparece na lista e há acesso à tela de ordens.
- Orçamentos não representam recebimentos nem movimentam estoque. A conclusão da OS continua pelo fluxo existente.
- Em conflito 409, a lista é recarregada. Uma edição conflitante fica bloqueada até cancelar e abrir os dados atualizados; a conversão exige nova conferência e confirmação.
- A API garante idempotência da conversão. Durante uma solicitação, novas submissões são bloqueadas.

## Contrato

Requisições usam `src/api/http.ts`, com cookie de sessão e tratamento existente de 401.

| Método | Caminho | Corpo / resposta |
| --- | --- | --- |
| GET | `/quotes` | `{ orcamentos: Quote[] }` |
| POST | `/quotes` | Envia `cliente_id`, `descricao_servico`, `valor`, `custo_materiais`; recebe `{ orcamento }` |
| PATCH | `/quotes/{id}` | Mesmos campos mais `revisao`; recebe `{ orcamento }` |
| POST | `/quotes/{id}/convert` | Envia `revisao`; recebe `{ orcamento }` com `ordem_servico_id` |

Clientes vêm de `GET /customers`. Tipos completos em `src/types/quote.ts`.

## Roteiro de validação manual

1. Entrar como empresário e funcionário: verificar acesso ao menu e à página.
2. Cadastrar orçamento com cliente, descrição e valor; conferir presença na lista e mensagem de sucesso.
3. Validar valor zero, descrição vazia e custo maior que o valor. O cadastro deve ser impedido.
4. Editar orçamento pendente e conferir os valores persistidos após atualizar a lista.
5. Buscar por cliente, serviço e número; alternar os filtros de situação.
6. Imprimir e cancelar a impressão; conferir cliente, descrição, datas, total e ausência do custo interno. Testar descrição longa e impressão em mais de uma página.
7. Cancelar uma conversão e verificar que não criou OS. Confirmar depois e conferir número, cliente, serviço e valores em Ordens de serviço.
8. Verificar que o convertido não oferece edição/conversão e continua disponível para impressão.
9. Em duas sessões, editar o mesmo orçamento; salvar na primeira e tentar salvar/converter a versão antiga na segunda. Deve mostrar conflito e exigir conferir os dados atualizados.
10. Verificar falha da API, botão Tentar novamente, lista vazia e cliente ainda não cadastrado.
11. Conferir a nova tela em celular, tablet e desktop, além da visibilidade do menu e Sair. Estilos globais e breakpoints existentes não foram alterados.

## Publicação

O backend com `/quotes` e a migração `000010_create_service_quotes` precisam estar disponíveis no ambiente antes de publicar o frontend. A publicação não aplica essa migração. Integração prevista em `release/20261021`; criação de branches, commits, push e deploy ficam com o responsável pelo projeto.

Despesas não faz parte desta branch.
