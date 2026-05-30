# Rede Construai — Deck de Investimento (Lásaro do Carmo Jr.)

Apresentação em HTML, autocontida, para rodar no navegador e exportar em PDF.
Captação para **expandir a franqueadora de 10 para 50 franqueados** (R$ 2 mi),
construída para o perfil do investidor **Lásaro do Carmo Jr.** — posicionado
como **sócio estratégico** (nome, rede, escala), e não apenas como capital.

Todos os números (EBITDA, valuation, ramp, retorno) vêm do modelo
"Construai Valuation" — ver `DADOS-FONTE.md`.

## Como abrir
Abra o arquivo `index.html` em qualquer navegador (Chrome recomendado).

- **Navegar:** setas `←` `→` (ou `↑` `↓`), barra de espaço, ou role a página. Clique nos pontos à direita.
- **Apresentar:** `F11` para tela cheia.

## Como exportar em PDF
1. Abra `index.html` no Chrome.
2. `Ctrl/Cmd + P` → Destino: **Salvar como PDF**.
3. Layout **Paisagem**, Margens **Nenhuma**, marque **Gráficos de plano de fundo**.

## Estrutura
```
index.html            # o deck (16 slides)
assets/css/deck.css   # design system — TODAS as cores ficam em :root (topo do arquivo)
assets/js/deck.js     # navegação (teclado, dots, barra de progresso)
assets/img/logo.svg   # logo PLACEHOLDER — trocar pelo oficial
CONTEUDO-PENDENTE.md  # o que falta você me passar para finalizar
```

## Trocar a identidade da marca (cores e logo)
- **Cores:** edite o bloco `BRAND TOKENS` no topo de `assets/css/deck.css`
  (`--c-primary`, `--c-accent`, `--c-bg` etc.). Tudo no deck reage a essas variáveis.
- **Logo:** substitua `assets/img/logo.svg` pelo arquivo oficial (mantendo o nome,
  ou ajuste o caminho no `index.html`).

## Status
Estrutura, design e narrativa: **prontos**. Campos marcados em amarelo (`[...]`)
são dados reais a preencher — ver `CONTEUDO-PENDENTE.md`.
