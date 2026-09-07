# Publicação da ESJ na Hostinger

O projeto inclui um servidor Node.js independente, sem depender do runtime da
Vercel. A adaptação foi testada localmente; o deploy no hPanel ainda não foi feito.

## Configuração da aplicação

No hPanel, crie uma aplicação Node.js vinculada ao repositório `Dulokz/site-esj`.
Use a raiz do repositório, Node.js 24, instalação `npm ci`, build `npm run build`,
entrada `server.js` e inicialização `npm start` quando houver esse campo.
Selecione o tipo **Other**, com saída de build `dist`. A detecção como Vite
estático não basta: confirme que o processo `server.js` está sendo executado.
O pacote de execução precisa incluir `server.js`, `lib/`, `api/`, `dist/` e
as dependências de produção; não publique apenas a pasta `dist`.

A Hostinger define a porta do serviço por `PORT`; o servidor escuta em todas as
interfaces. O HTTPS é terminado pela hospedagem. Frontend e API devem estar na
mesma origem; não é necessário habilitar CORS entre domínios.

Antes de alterar o domínio do site existente, valide a aplicação no endereço
HTTPS disponibilizado pela hospedagem e preserve a publicação atual para rollback.

## Ambiente e banco

Cadastre no painel as variáveis do `.env.example`, com `APP_ORIGIN` igual à
origem HTTPS efetiva (com ou sem www conforme o domínio usado, sem barra final).
Não copie `.env.local` para `dist` nem use prefixo `VITE_` nos segredos.
`META_REDIRECT_URI` não é utilizada. O Config ID e o App ID devem pertencer ao
mesmo app Meta. O arquivo local não configura automaticamente a Hostinger.

Este projeto exige PostgreSQL com `sslmode=verify-full`. Um banco MySQL não é
compatível. Configure uma instância PostgreSQL acessível pelo servidor; informe
sua conexão em `DATABASE_URL`. Execute `npm run db:migrate` e depois
`npm run admin:create` em um ambiente seguro com acesso ao mesmo banco.
Para provisionar o administrador, preencha temporariamente `PROVISION_*` e
retire esses valores após o comando. O build não executa migrações nem cria contas.
Gere as chaves de criptografia e de verificação do webhook uma única vez e
preserve-as; não substitua uma chave que já protege credenciais existentes.

## Verificação após publicar

- A página `/integracoes/whatsapp/conectar` deve abrir diretamente e após recarregar.
- `/api/unknown` deve retornar 404 JSON, nunca o HTML da página.
- GET `/api/meta/whatsapp/callback` deve retornar 405, com `Allow: POST`.
- Faça login com o administrador provisionado e valide sessão/banco.
- Configure o webhook na Meta como `APP_ORIGIN/api/meta/whatsapp/webhook`, usando
  o mesmo `META_WEBHOOK_VERIFY_TOKEN`, e valide o desafio pelo painel Meta.
- Configure o domínio de lançamento no Facebook Login for Business conforme
  [meta-app-review.md](meta-app-review.md), depois teste uma conexão real.

`npm test` usa fixtures e não comprova conectividade com Meta, PostgreSQL externo
ou Hostinger. O agendamento de `npm run db:cleanup` continua sendo configuração
operacional separada.

Fonte consultada em 07/09/2026: [guia oficial da Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).
