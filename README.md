# ConstruMaia — Novo site institucional

Redesign moderno e interativo do site da **ConstruMaia** (Almeida e Maia
Materiais de Construção — Montes Claros/MG), substituindo o conteúdo de
https://www.construmaia.com/ por uma página única, rápida e responsiva.

## Como abrir
Abra `index.html` em qualquer navegador — o site é 100% estático, sem build.

## O que tem no site
- **3 alcovas WebGL (Three.js)** — cada seção-chave tem sua própria cena 3D
  com câmera guiada pelo scroll (GSAP ScrollTrigger): hero (tijolos que se
  montam + parallax de mouse), diferenciais (constelação de partículas) e
  contato (horizonte wireframe animado). Sem WebGL ou com
  `prefers-reduced-motion`, cai num fundo em CSS puro.
- **Soundscape (Howler.js)** — whoosh nas transições de seção e micro-sons
  nas interações, desligado por padrão (botão de som no header, preferência
  salva). Sons sintetizados embutidos em `assets/js/sounds.js` — substituíveis
  por áudios oficiais.
- **Coreografia GSAP** — título do hero entra palavra a palavra, parallax,
  header que se esconde ao rolar para baixo, cards com tilt 3D, botões
  magnéticos e marquee de departamentos.
- Tagline oficial ("Tudo para sua construção, da base ao acabamento") e
  contadores animados (30 anos, 3 unidades…)
- **Departamentos** — 9 cards interativos (clicar em um card já o adiciona ao
  orçamento)
- **Diferenciais** — entrega a domicílio, tintas manipuladas, Catálogo de
  Prêmios, marcas, atendimento, unidades
- **Sobre** — 30 anos de história em Montes Claros
- **Orçamento rápido** — o visitante monta a lista (chips + texto) e envia
  direto pelo WhatsApp com mensagem pré-preenchida
- **Lojas** — Major Prates (matriz), Vila Ipiranga (filial) e Vila Regina
  (depósito), com link "Como chegar" no Google Maps
- **FAQ** em acordeão (entrega, retirada em 30 dias, horários…)
- **Contato/CTA** com WhatsApp, telefones e redes sociais

## Estrutura
```
index.html                    # página única
assets/css/site.css           # design system — cores da marca em :root (topo)
assets/js/site.js             # interações base (menu, reveal, orçamento, FAQ)
assets/js/effects.src.js      # FONTE do motor de efeitos (Three/Howler/GSAP)
assets/js/effects.bundle.js   # bundle gerado (não editar à mão)
assets/js/sounds.js           # soundscape sintetizado (WAV base64)
assets/vendor/                # GSAP 3.15 + ScrollTrigger (sem CDN)
assets/img/logo.webp          # logotipo oficial ConstruMaia
assets/img/favicon.svg        # telhado do logo (azul + âmbar)
```

Para editar os efeitos, altere `effects.src.js` e regere o bundle:

```
npm i three howler esbuild
npx esbuild assets/js/effects.src.js --bundle --minify --format=iife \
  --outfile=assets/js/effects.bundle.js
```

> O bundle é um script clássico: os efeitos funcionam até abrindo o
> `index.html` direto do disco (`file://`), onde módulos ES são bloqueados.

## Dados usados (fonte: webarchive do site oficial atual)
- Central/WhatsApp: **(38) 3215-1566** (`wa.me/553832151566`, confirmado no
  site atual — constante `WHATS_NUMBER` em `assets/js/site.js`)
- Horário: Seg–Sex 08h–18h · Sáb 08h–12h
- Lojas: **Matriz** Av. Dep. Plínio Ribeiro, 490 · Vera Cruz · (38) 3215-1819;
  **João XXIII** Av. João XXIII, 1474 · Edgar Pereira · (38) 3223-2392;
  **Plus** Av. Francisco Gaetani, 388 · Major Prates · (38) 3215-7875
- Missão / Visão / Valores: textos oficiais da seção "Quem Somos"
- Vídeo institucional: youtube.com/watch?v=hcWIwwkCmCg
- Instagram [@construmaia](https://www.instagram.com/construmaia/) ·
  Facebook [/Construmaia](https://www.facebook.com/Construmaia/)
- CNPJ 08.678.892/0001-96

## Identidade visual
Cores extraídas do logotipo oficial — âmbar `#f2a238` ("Constru") e azul
`#1b64b1` ("Maia") — centralizadas no bloco `:root` no topo de
`assets/css/site.css`. O logotipo oficial está em `assets/img/logo.webp`.

## Deploy
O repositório já tem `netlify.toml` e workflow de deploy — ver `DEPLOY.md`.
