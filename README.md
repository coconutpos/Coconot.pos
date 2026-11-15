# Coconut P.O.S

Sistema de ponto de venda para restaurante, em preto e branco, feito para iPad, computador e celular.
Funciona sem internet depois de aberto uma vez. Os dados ficam salvos no navegador de cada aparelho.

PassCode inicial do administrador: **0000** (troque em Gerenciar → Equipe).

## O que tem

- **Vender:** cardápio com categorias e busca, teclado para valor avulso, complementos com preço, observações, preço livre.
- **Comanda:** balcão, mesa ou para viagem, número de pessoas, desconto manual (gerente) ou cupom, taxa de serviço, dividir por itens em outra comanda, imprimir a conta.
- **Pagamento:** dinheiro com troco, cartão (confirma se a maquininha aprovou), PIX (em real) e outros. Dá para dividir em várias formas ou em partes iguais. Um pagamento parcial fica salvo na comanda.
- **Salão:** mapa de mesas com tempo de ocupação e alerta. Uma mesa pode ter mais de uma comanda.
- **Cozinha (KDS):** pedidos chegam ao guardar ou cobrar, com cronômetro, complementos, observações, aviso sonoro e impressão. A função "Cozinha" só vê esta tela.
- **Gerenciar:** resumo do dia, vendas (cancelamento com motivo), caixa (abertura, sangria, suprimento, conferência, fechamento por cédulas), produtos, promoções (cupons e taxa de serviço), mesas, impostos, equipe, registro de auditoria e configurações.
- **Impressão:** navegador, Star PassPRNT (iPad) ou Star webPRNT direto pela rede, além da gaveta de dinheiro. A configuração é guardada em cada aparelho.
- **Idiomas:** português, inglês e espanhol.
- **Dados:** backup completo, exportar e importar cardápio, mesas e equipe, e CSV de vendas. Na primeira abertura, importa sozinho os dados do sistema anterior (`coconut_pos_v013`) sem apagá-los.

## Novidades da 3.2.0

- **Cor por categoria:** a interface continua preto e branco, mas cada categoria ganha uma cor. Ela aparece nos cartões do cardápio, nos filtros, na comanda, na lista de produtos, nos cartões de Comandas (faixa com a mistura de categorias) e na Cozinha (a quantidade na cor da categoria). Emoji e foto voltam a aparecer coloridos.
- As cores são automáticas. Para trocar: **Gerenciar → Produtos → Cores das categorias**.
- **Importar cardápio** aceita também uma lista simples de produtos (por exemplo, um arquivo convertido pelo ChatGPT), com preço em dólar ou em centavos.

## Novidades da 3.1.0

- A descrição do produto não aparece mais na venda nem vira observação da comanda ao importar do sistema anterior.
- O botão **Cobrar** fica sempre visível. No iPad em pé e no celular, a comanda abre como gaveta, e a barra de baixo tem a comanda e o Cobrar.
- HUD de venda nova: cartões compactos (cabem muito mais produtos na tela), animação ao tocar, contador que pula e linha nova destacada na comanda.
- Mais rápido com inventário grande: tocar em um produto não redesenha mais o cardápio inteiro.
- Não há marca d'água "Lab", aviso online/offline nem botão "Voltar ao POS".

## Rodar no computador

```bash
node tools/dev-server.js 5194
```

Depois abra http://127.0.0.1:5194

## Publicar (Git + Netlify)

1. Suba esta pasta para um repositório no GitHub.
2. No Netlify, abra o site → **Site configuration → Build & deploy → Link repository** e escolha o repositório.
3. Build command: vazio. Publish directory: `.` (o `netlify.toml` já faz isso).

A cada `git push` o Netlify publica sozinho. Nos aparelhos aparece o aviso "Nova versão disponível" para atualizar.

## Arquivos

| Arquivo | Para quê |
| --- | --- |
| `index.html` | página |
| `styles.css` | visual |
| `app.js` | todo o sistema |
| `sw.js` | modo offline |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | instalar na tela de início do iPad |
| `logo.webp` | logo da abertura |
| `tools/dev-server.js` | servidor local para testes (não vai para o ar) |

## Importante

Os dados não sincronizam entre aparelhos diferentes: cada iPad tem os próprios dados. Para levar tudo de um aparelho para outro, use **Configurações → Baixar backup completo / Restaurar backup**. A tela da cozinha se atualiza na hora em outra aba ou janela do mesmo aparelho.
