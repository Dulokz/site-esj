# Plataforma ESJ

React + Vite e funções Node na Vercel, com login administrativo, PostgreSQL,
Embedded Signup oficial da Meta, gestão de ativos e envio de template de teste.

```sh
npm ci
npm test
npm run lint
npm run build
npm run dev
```

**A homologação real depende de configuração externa.** Não foram cadastrados
IDs, criados ativos, enviados templates ou efetuado deploy. Não há modo fake na
aplicação. Testes usam PostgreSQL embutido e fixtures Meta apenas em `tests/`.

Consulte [docs/meta-app-review.md](docs/meta-app-review.md) para o checklist de
configuração Meta/Vercel, limitações e roteiro das duas permissões. Copie
`.env.example` para `.env.local` privado; configure PostgreSQL com
`sslmode=verify-full`, origem HTTPS e as credenciais reais no servidor.

```sh
npm run db:migrate
npm run admin:create
```

O provisionamento utiliza as variáveis locais `PROVISION_*`; não cria admin ou
senha padrão. Retire essas variáveis do ambiente após uso. Nunca colocar segredo
em `VITE_*`, frontend, logs, localStorage ou repositório.

`npm run dev` inclui as rotas backend e lê `.env.local`. HTTP local permite revisar
as páginas, mas as operações administrativas exigem origem HTTPS e cookie Secure.
Use um ambiente HTTPS para homologar. `npm run preview` é somente estático.

`npm run db:cleanup` executa a retenção documentada; não há agendamento externo
criado. A migração e a publicação não são executadas automaticamente pelo build.

## Servidor Node.js / Hostinger

Ap�s `npm run build`, execute `npm start`. O servidor `server.js` atende `dist/`
e as APIs na mesma origem, escuta em `0.0.0.0` e respeita `PORT` (padr�o 3000).
Use Node.js 24 na hospedagem. N�o use `vite preview` como backend.

Consulte [docs/hostinger.md](docs/hostinger.md) para publicar e configurar o banco.
