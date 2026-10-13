# US18 — Produtos e estoque

Data: 2026-10-11. Branch: `feat/us18-product-inventory`.

Como empresário, quero cadastrar produtos e acompanhar quantidades e preços. Como atendente, quero localizar produtos na venda por descrição ou código de barras.

## Entrega

- Menu e rota `/estoque` exclusivos do empresário.
- Cadastro com código, descrição, estoque inicial, custo e percentual próprio do produto.
- Prévia do preço final calculada como custo mais acréscimo percentual, com arredondamento em centavos igual ao backend.
- Percentual e preço final podem ser editados; o outro campo é preenchido automaticamente. Alterar o custo mantém o último campo editado. O preço digitado é preservado mesmo quando o percentual não é exato.
- Botões do estoque seguem as cores do sistema. Estilos globais e regras responsivas das telas existentes preservados conforme a versão anterior à feature.
- Edição do cadastro sem alterar saldo; ajuste separado com delta e motivo.
- Lista pesquisável com custo, percentual, preço e indicação de esgotado.
- Vendas permitem selecionar produto, preencher preço automaticamente e aumentar quantidade pela leitura repetida.
- Campo de busca intercepta Enter para adicionar o código exato, sem concluir a venda. Compatibilidade destinada a leitores em modo teclado com sufixo Enter; equipamento físico ainda precisa ser validado.
- Itens avulsos continuam disponíveis e não movimentam estoque.
- Em conflito de preço ou saldo, atualizar os produtos e revisar a venda antes de tentar novamente.
- Alterações de cadastro não modificam os itens já registrados no histórico.

## Validação e publicação

- Executar `npm run lint` e `npm run build`.
- Verificar empresário e funcionário, cadastro duplicado, ajuste de entrada/saída, saldo insuficiente, busca com zeros à esquerda e leitura repetida.
- Conferir a página em desktop e dispositivo móvel.
- Publicar primeiro o backend US24 com a migração `000009`; depois publicar esta branch pelo fluxo de PR/merge existente.

Os contratos estão em [frontend-contracts.md](frontend-contracts.md).
