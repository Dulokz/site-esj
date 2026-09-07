# ESJ — implementação e homologação do onboarding WhatsApp

## Estado de entrega

Há código de produção para autenticação, persistência PostgreSQL, Embedded Signup,
validação Graph, registro/assinatura, gestão de ativos, envio de template,
webhook e desconexão local. **Não houve homologação com credenciais reais, banco
externo ou ativos Meta neste ambiente. A integração NÃO está declarada concluída
para App Review.** Testes usam PostgreSQL embutido e respostas Meta controladas;
nenhum modo de simulação existe na aplicação publicada.

Para atingir os critérios finais faltam os valores do checklist abaixo, publicar
em HTTPS, aplicar a migração, provisionar o administrador e executar o roteiro real.
Não foram criadas contas externas, efetuados envios, configurado o app ou feito deploy.

## Análise e arquitetura implementada

Base preservada: React + Vite, navegação History API, identidade visual ESJ e
funções Node Vercel em `api/`. Não existiam autenticação ou banco. Agora:

- `db/001-platform.sql`: tenants, users, sessions, signup_attempts,
  whatsapp_connections, credentials, rate_limits, audit_events, message_requests,
  webhook_events. UUIDs locais não são identificadores Meta.
- `lib/platform/auth.js`, `security.js`: senha scrypt com salt aleatório,
  sessões opacas de 32 bytes (somente hash no banco), expiração absoluta de 8 horas,
  cookie `__Host-esj_session`, HttpOnly/Secure/SameSite=Lax/Path=/, sem Domain.
  Todo acesso de integração exige admin e junção de sessão/usuário/tenant.
- `lib/platform/store.js`: rate limit PostgreSQL com UPSERT atômico;
  signup com hash SHA-256, 10 minutos e UPDATE condicionado de uso único.
  A sessão é validada antes do consumo. Tenant nunca vem do browser.
- `lib/platform/credentials.js`: CredentialStore AES-256-GCM; nonce aleatório
  de 12 bytes, autenticação adicional de tenant/id/provedor/versão. Apenas a
  referência fica na conexão; token e PIN ficam cifrados em tabela separada.
- `lib/platform/whatsapp.js`: transações, isolamento por tenant, validação Graph,
  registro/assinatura, consulta administrativa, idempotência de envio e auditoria.
- `lib/meta/graph*.js`: troca de código e Graph com timeout, erros sanitizados,
  Bearer no header. Introspecção usa Graph Batch POST, mantendo `input_token`
  no corpo em vez da URL HTTP. Conferir suporte ao batch na homologação.
- `src/lib/meta/embedded-signup.js`: carregamento sob demanda do SDK oficial,
  retorno de código e eventos de sessão unidos antes do callback, sem tokens
  em localStorage, HTML, URL ou estado de UI.
- `api/meta/whatsapp/webhook.js`: challenge e HMAC sobre bytes originais,
  deduplicação durável e roteamento por WABA + número. Não grava texto, mídia,
  contato, telefone destinatário ou payload bruto de mensagens.

Produção usa `pg` com PostgreSQL externo. `@electric-sql/pglite` é dependência
exclusiva de testes, não é storage da plataforma. Cada transação usa o mesmo
client `pg`; locks por tenant serializam alterações e envios com desconexão.
Um WABA ativo é atribuído a um único tenant local; cada número tem unicidade global.
Após desconexão, a reserva do número no tenant continua: reassociação a outra
empresa exige migração administrativa verificada, não um `tenantId` no request.

## Checklist exato de configuração externa

Preencher somente no servidor: Vercel → projeto ESJ → Settings → Environment
Variables, no ambiente correto. Segredos NÃO devem ser enviados neste chat ou
copiados para documentação/código. No desenvolvimento, `.env.local` é ignorado.
Os nomes das seções Meta podem variar conforme os produtos/casos de uso do app;
se a seção citada não aparecer, confirmar o app/caso de uso antes de prosseguir.

| Variável | Onde obter / ação manual | Valor a copiar |
| --- | --- | --- |
| `META_APP_ID` | Meta for Developers → My Apps → app ESJ → App settings / Basic | App ID desse app, não Business ID ou WABA ID |
| `META_APP_SECRET` | Mesmo app → App settings / Basic → App secret → Show | Segredo do app, somente no servidor |
| `META_CONFIG_ID` | App ESJ → Facebook Login for Business → Configurations, ou Embedded Signup Builder do caso de uso WhatsApp | ID da configuração de Embedded Signup criada para esse app |
| `META_EMBEDDED_SIGNUP_EXTRAS` | Código oficial de lançamento gerado/indicado para essa configuração no Builder/documentação Meta | Apenas o objeto JSON `extras`, preservando a versão/feature oficial; não copiar App Secret |
| `META_GRAPH_API_VERSION` | Versão suportada indicada no dashboard/documentação do app e no exemplo SDK atual | Valor no formato `vN.N`; não foi escolhida uma versão fictícia |
| `APP_ORIGIN` | Domínio HTTPS canônico onde este backend/frontend serão publicados | `https://eduardosj.com.br` se esse for o domínio do ambiente, sem barra final |
| `META_WEBHOOK_VERIFY_TOKEN` | Gerar um segredo aleatório; app → WhatsApp → Configuration → Webhook → Edit | Mesmo segredo no campo Verify token da Meta e no ambiente do servidor |
| `META_TOKEN_ENCRYPTION_KEY` | Gerar localmente com gerenciador de segredos / CSPRNG | Exatamente 32 bytes aleatórios codificados em base64; guardar backup seguro |
| `DATABASE_URL` | Neon → projeto → Connect, ou Supabase → projeto → Connect → pooler; PostgreSQL equivalente também serve | URL PostgreSQL de backend com TLS e verificação de certificado |

O parser de `extras` aceita `feature`, `featureType`, `version`, `sessionInfoVersion`
e `setup` vazio. Não invente valores de launch nem copie o exemplo dos testes.
Se o snippet oficial atual tiver estrutura diferente, adaptar o parser e o listener
com base nesse snippet antes de habilitar. Isso é especialmente relevante na
transição de versões do Embedded Signup.

**Redirect URI (revisado em 07/09/2026):** neste fluxo, `FB.login` retorna
`authResponse.code`, e o frontend combina esse código com os ativos recebidos por
`WA_EMBEDDED_SIGNUP` e envia JSON por POST para `/api/meta/whatsapp/callback`.
O lançamento não informa `redirect_uri`. A etapa 1 da documentação oficial de
[onboarding para Tech Providers](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider)
lista apenas `client_id`, `client_secret` e `code` para a troca. Portanto a troca
omite `redirect_uri`; `META_REDIRECT_URI` foi removida do contrato e do template.
Uma variável antiga no ambiente é ignorada. Não há URL de retorno a preencher
nessa variável, nem callback OAuth GET: a rota da ESJ continua somente POST JSON.
A documentação exemplifica GET ao endpoint Graph `/oauth/access_token`; o código
mantém o POST servidor a servidor existente, com os parâmetros no corpo, sem
segredos na URL. Esse transporte ainda requer homologação com a API real.

Isso não elimina as configurações do painel: a documentação de
[implementação do SDK](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation/)
exige cadastrar o domínio HTTPS que hospeda o fluxo em **Allowed domains** e
**Valid OAuth redirect URIs**, e habilitar **Login with the JavaScript SDK** nas
configurações de Facebook Login for Business. Para produção no domínio ESJ,
confirmar `https://eduardosj.com.br` como domínio de lançamento. O nome do campo
no painel não torna o endpoint POST da ESJ um destino de redirect OAuth.
`APP_ORIGIN` continua obrigatório, como origem HTTPS canônica sem barra final,
para a validação de origem das requisições ao backend.

**Painel Meta, além das variáveis:**

1. Confirmar que o app pertence ao portfólio ESJ correto e que o acesso como Tech
   Provider está habilitado. Verificação empresarial não significa App Review aprovado.
2. Habilitar o caso de uso/produto WhatsApp e Facebook Login for Business necessário
   ao Embedded Signup. Configurar domínio, URL do site e origens permitidas do SDK.
3. Configurar as duas permissões exigidas: `whatsapp_business_management` e
   `whatsapp_business_messaging`. O backend exige ambas e exige que o WABA apareça
   no escopo granular autorizado. Não é solicitado `business_management` adicional.
4. Configurar Callback URL do webhook como
   `https://eduardosj.com.br/api/meta/whatsapp/webhook`, Verify token correspondente
   e assinatura do campo `messages`. Depois o onboarding assina o app no WABA.
5. Cadastrar URLs de privacidade, termos e instruções de exclusão abaixo.
   A página de exclusão é de instruções; não é callback `signed_request`.
6. No modo de desenvolvimento, usar somente contas/ativos permitidos pela Meta,
   com papéis de teste adequados. Para clientes externos, cumprir acesso avançado,
   revisão e modo de publicação exigidos para o app.
7. No WhatsApp Manager do cliente, verificar número, pagamentos, limites e template
   aprovado, conforme exigido pela Meta. A demonstração não ignora esses requisitos.

## Provisionar plataforma

1. Criar banco de homologação PostgreSQL. Não apontar testes/migração inicial para
   banco desconhecido. Em Vercel, preferir URL pooled do provedor; certificado TLS
   deve ser validado. Não usar `rejectUnauthorized:false` ou SSL mode inseguro.
2. Copiar `.env.example` para `.env.local` privado e configurar valores reais.
3. `npm ci` e `npm run db:migrate`. Migração idempotente transacional; usa
   `CREATE TABLE IF NOT EXISTS` e não apaga tabelas existentes.
4. Definir localmente `PROVISION_TENANT_NAME`, `PROVISION_TENANT_SLUG`,
   `PROVISION_EMAIL`, `PROVISION_PASSWORD` (14–256 caracteres, única e aleatória).
   Executar `npm run admin:create`. O script cria tenant ou reutiliza seu slug e
   cria admin; e-mail duplicado falha. Não existe cadastro público ou admin padrão.
5. Remover as variáveis de provisionamento do arquivo privado após criar a conta.
   Entregar acesso ao administrador/revisor por canal seguro. Nunca salvar senha
   em README, vídeo, ticket público ou repositório. Não reutilizar senha Meta.
6. Publicar um preview HTTPS Vercel com as mesmas variáveis, migração aplicada e
   URLs Meta autorizadas. A navegação SPA exclui `/api/` do rewrite.
7. `npm run dev` lê `.env.local`; **HTTP local não habilita operações autenticadas**:
   Origin deve ser HTTPS e o cookie sempre é Secure. Para integração real, usar
   homologação HTTPS. O preview estático Vite não serve as funções.

## Fluxo e garantias

1. Login ESJ cria sessão opaca no banco. Usuário, role e tenant são derivados dela.
2. Preparar conexão chama POST `signup/start`, verifica Origin, sessão/admin e
   rate limit, invalida tentativa anterior da sessão e emite state de 32 bytes.
3. Carrega SDK. O clique seguinte em “Continuar com a Meta” chama `FB.login`
   sincronicamente, evitando popup bloqueado por awaits de rede.
4. Listener aceita apenas origens exatas `https://www.facebook.com` e
   `https://web.facebook.com`; exige popup cuja janela superior tenha opener
   igual à janela ESJ e vincula os eventos seguintes à mesma WindowProxy.
   Ignora payloads desconhecidos, fonte inesperada e dados inválidos. Não segue
   sufixos de domínio. Esse contrato de janela deve ser verificado no browser
   real: caso Meta altere a hierarquia de janelas, o fluxo falha fechado por timeout.
5. Une código e FINISH em qualquer ordem; cancelamento/erro/timeout encerram
   o listener. O state é da ESJ, não se presume eco automático pela Meta.
6. Callback exige sessão, Origin, state, expiração, uso único e exatamente code
   ou error. Consumo é confirmado antes de chamadas externas: replay é rejeitado.
7. Troca code no servidor. Debug valida app, validade, expiração e permissões;
   escopo granular valida WABA. Graph confirma proprietário `owner_business_info`
   e relação WABA → phone. IDs de browser são apenas hints.
8. Persiste credencial cifrada e conexão pending na mesma transação antes de
   registro externo. PIN de registro é cifrado e preservado em novas tentativas.
   Troca de credencial apaga a anterior na mesma transação, sem órfãos.
9. Assina app no WABA e, no fluxo padrão se necessário, registra o número. Verifica
   novamente Graph e só grava connected quando número reporta CONNECTED. Falha
   parcial preserva credencial cifrada e estado error/pending para “Validar novamente”.
10. Coexistência somente se oferecida pela Meta e evento oficial correspondente.
    Não força migração ou registro de um fluxo marcado como coexistência; mantém
    pending até Graph confirmar CONNECTED. O hint jamais dispensa validação.
11. Status vem do banco por tenant, com data de última validação. Não é verificação
    contínua da Meta: revogação é detectada em validação/gestão/envio e marca
    reauthorization_required. A integração não promete detecção instantânea.

## Endpoints

| Método | Caminho | Acesso |
| --- | --- | --- |
| POST | `/api/auth/login` | Origin HTTPS, credenciais ESJ, limite por IP/e-mail |
| GET / POST | `/api/auth/session` / `/api/auth/logout` | Sessão admin |
| POST | `/api/meta/whatsapp/signup/start` | Admin, Origin, 5/min |
| POST | `/api/meta/whatsapp/callback` | Admin, Origin, state, 10/min |
| GET | `/api/meta/whatsapp/status` | Admin, somente tenant da sessão |
| POST | `/api/meta/whatsapp/refresh` | Admin, Origin, validação/registro, 5/min |
| POST | `/api/meta/whatsapp/management` | Admin, Origin, Graph, 10/min |
| POST | `/api/meta/whatsapp/messages` | Admin, Origin, template e idempotência, 3/min |
| POST | `/api/meta/whatsapp/disconnect` | Admin, Origin, transação e auditoria |
| GET / POST | `/api/meta/whatsapp/webhook` | Verify token / HMAC Meta; sem sessão ESJ |

JSON administrativo limitado a 8 KiB; webhook bruto a 1 MiB. Respostas sem cache.
Body de callback: state, code OU error, IDs opcionais e signup_mode opcional;
sucesso exige WABA e número para validação. Nenhum erro upstream é refletido.

## Mensageria e idempotência

Selecionar conexão connected, consultar ativos e escolher template APPROVED
composto apenas de texto, sem variáveis, botões ou mídia. Informar destinatário
E.164 e confirmar autorização. O backend consulta o template novamente e usa
o token/número da conexão do tenant. Não implementa texto livre ou burla da
janela de atendimento. Envios reais podem ter custo.

O requestId é UUID e fica gravado antes do envio. Ledger registra HMAC do pedido,
status e ID de mensagem, sem destinatário ou texto. Repetição do mesmo ID já
enviado retorna o resultado, sem reenvio. Payload diferente é rejeitado. Se a
resposta for perdida, fica unknown/sending e não há retry automático. Isso
evita duplicidade; não promete exatamente-uma-vez entre banco e Meta.
“Aceita pela Meta” não é “entregue”. Os webhooks armazenam metadados deduplicados
de recebimento/status; ainda não há inbox, workflow de negócio ou tela de entrega.

## Desconexão, credenciais e manutenção

Desconectar exige confirmação na interface. Transação invalida tentativas pendentes,
marca not_connected, remove referência e credencial, registra auditoria. Não chama
revogação global de permissões Meta nem remove assinatura do WABA compartilhado
por outros números. Revogação deve ser feita nas integrações empresariais da Meta.
Webhooks de conexões desconectadas são ignorados. Exclusão de dados permanece
solicitação por e-mail; limpeza administrativa deve seguir o contrato aplicável.

Chave de criptografia fica somente no ambiente. Perder a chave impede recuperar
tokens; substituí-la sem recriptografar registros os inutiliza. A abstração permite
KMS/Vault futuro, mas rotação automática multi-chave ainda não foi implementada.
Antes de rotacionar, fazer backup, recriptografar registros com manutenção e testar.

Executar `npm run db:cleanup` por operação agendada da infraestrutura: remove
sessões/limites expirados, tentativas expiradas há 1 dia, metadados webhook após
30 dias e auditoria após 180 dias. Nenhuma automação externa foi criada. O ledger
de idempotência é mantido para impedir reenvios por IDs antigos; definir política
de anonimização/retenção no contrato. Backups seguem política do provedor.

Contas são provisionadas administrativamente. Não há autoatendimento de cadastro,
recuperação de senha ou MFA nesta versão. Reset administrativo deve atualizar
hash scrypt e invalidar sessões do usuário em transação por operador autorizado.

## URLs para App Review (após publicação)

- Site: https://eduardosj.com.br/
- Produto: https://eduardosj.com.br/whatsapp-business
- Login/onboarding/admin: https://eduardosj.com.br/integracoes/whatsapp/conectar
- Privacidade: https://eduardosj.com.br/politica-de-privacidade
- Termos: https://eduardosj.com.br/termos-de-uso
- Exclusão: https://eduardosj.com.br/exclusao-de-dados

## Roteiro reprodutível e vídeo

1. Criar tenant exclusivo para homologação/revisor com `admin:create`.
   Fornecer URL e credenciais pelo campo privado da revisão Meta, nunca neste arquivo.
2. Entrar na ESJ, mostrar nome da empresa e status vindo do backend.
3. Preparar conexão → Continuar com a Meta. Gravar login Meta, portfólio,
   WABA, número, permissões e conclusão. Não mostrar senhas, PIN, token ou código.
4. Mostrar retorno e estado connected. Recarregar a página para comprovar persistência.
5. **whatsapp_business_management:** selecionar o número, clicar “Consultar WABA,
   números e templates”; mostrar resultado real com WABA, lista e templates.
6. **whatsapp_business_messaging:** escolher template simples aprovado, destinatário
   controlado e autorizado, confirmar autorização, enviar. Mostrar aceitação e o
   recebimento real no dispositivo destinatário, sem expor contatos de terceiros.
7. Mostrar exclusão de dados, desconexão e nova autorização; explicar a diferença
   entre desconexão ESJ e revogação Meta. Gravar cancelamento e reautorização se solicitado.
8. Conferir que as duas permissões solicitadas correspondem aos recursos demonstrados.

Não há usuário, senha, WABA, número ou template de produção predefinidos. Não usar
as fixtures dos testes na configuração real. Homologar também expiração, replay,
troca de tenant, revogação, perda de rede, webhook duplicado e falha parcial.

## Validação e limitações conhecidas

Executar `npm ci`, `npm test`, `npm run lint`, `npm run build`. Os testes usam
PostgreSQL PGlite para SQL/transações e fixtures exclusivamente nos testes para
Graph; validam state, isolamento, papel admin, criptografia, Origin, callback,
desconexão, assinatura, ativos inválidos e idempotência. Não substituem testes de
carga/locks no PostgreSQL externo nem a API real. Vercel functions têm duração
configurada em 120 s; conferir suporte no plano. Cada chamada Graph limita 15 s.
Consultas de ativos paginam até 10 páginas e falham explicitamente além disso.

Documentação Meta consultada em 07/09/2026: as páginas de implementação e
onboarding para Tech Providers foram acessadas pelo navegador, após HTTP 429
na consulta inicial. O contrato sem redirect_uri foi confirmado nessas páginas.
A coleção oficial Meta no Postman confirmou introspecção/escopos e mensageria;
os detalhes de versão/configuração do app, batch e owner_business_info
precisam ser confirmados com o app real antes da ativação. Não há fallback que
ignore validações se um campo estiver indisponível. O telefone institucional
original aparenta ser provisório; confirmar cadastro e funcionamento do e-mail.

Referências primárias:

- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider
- https://developers.meta.com/resources/videos/unified-onboarding-whatsapp/
- https://www.postman.com/meta/whatsapp-business-platform/request/i1mz7w8/debug-token
- https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api
- https://node-postgres.com/features/transactions
