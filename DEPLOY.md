# Como publicar o site

O deploy **não pode partir do ambiente de desenvolvimento**: a política de rede
dele bloqueia `*.netlify.com` (resposta `Host not in allowlist`, HTTP 403).
Use um dos caminhos abaixo — todos rodam fora desse ambiente.

## Caminho A — Drag & drop (10 segundos, sem configurar nada)
1. Acesse **https://app.netlify.com/drop**
2. Arraste o arquivo `construmaia-site.zip` (enviado no chat)
3. O Netlify devolve a URL pública na hora.

## Caminho B — GitHub Action (automático, republica a cada push)
Já existe o workflow em `.github/workflows/deploy-netlify.yml`. Falta só:

1. **Criar o site uma vez** (para obter o Site ID):
   - Opção rápida: faça o Caminho A uma vez. O site criado terá um **Site ID**
     em *Site settings → General → Site information → Site ID (API ID)*.
   - Ou: Netlify → *Add new site → Deploy manually*.

2. **Cadastrar os secrets** no GitHub:
   - Repo → *Settings → Secrets and variables → Actions → New repository secret*
   - `NETLIFY_AUTH_TOKEN` = seu personal access token do Netlify
   - `NETLIFY_SITE_ID` = o Site ID (API ID) do passo 1

3. **Disparar**: faça qualquer push na branch, ou rode o workflow manualmente
   em *Actions → Deploy to Netlify → Run workflow*.

## Caminho C — Importar via Git no Netlify (sem GitHub Action)
1. Netlify → *Add new site → Import an existing project → GitHub*
2. Selecione o repo `rodolfornn/m-a`, branch
   `claude/construmaia-website-redesign-x21l6u` (site ConstruMaia)
3. Publish directory já vem do `netlify.toml` (`.`). Confirme e *Deploy*.
4. Para usar o domínio próprio (`www.construmaia.com`), depois aponte o DNS
   em *Domain settings → Add custom domain*.

> Segurança: tokens colados no chat ficam expostos. Recomendo revogar/rotacionar
> o token do Netlify em *User settings → Applications* após configurar o deploy.
