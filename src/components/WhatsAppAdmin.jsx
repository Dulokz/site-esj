import { useState } from 'react';
import { apiRequest } from '../lib/meta/embedded-signup';
import { errorMessage } from '../lib/meta/errors';
import ConnectionStatus from './ConnectionStatus';

const maskPhone = (value) => value ? `${value.slice(0, 3)}••••${value.slice(-3)}` : 'não informado';
const dateTime = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle:'short', timeStyle:'medium' }).format(new Date(value)) : '—';

export default function WhatsAppAdmin({ connections, refresh, tenantName }) {
  const [selected, setSelected] = useState('');
  const [assets, setAssets] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [result, setResult] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const row = connections.find((item) => item.id === selected);

  async function action(path) {
    setBusy(true); setNotice('Consultando…');
    try {
      const response = await apiRequest(`/api/meta/whatsapp/${path}`, { connectionId:selected });
      if (path === 'management') { setAssets(response); setNotice('Ativos consultados diretamente na Meta.'); }
      else { setAssets(null); setNotice(path === 'disconnect' ? 'Conexão local removida.' : 'Validação concluída. Confira o estado atualizado.'); }
      await refresh();
    } catch (error) { setNotice(errorMessage(error)); try { await refresh(); } catch { /* Preserve original error. */ } }
    finally { setBusy(false); setConfirmDisconnect(false); }
  }

  function prepareSend(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const template = assets.templates.find((item) => item.id === form.get('template'));
    if (!template) return;
    setDraft({ connectionId:selected, requestId:crypto.randomUUID(), recipient:String(form.get('recipient')), templateName:template.name, language:template.language, recipientAuthorized:true });
    setResult(null); setNotice('Confira os dados abaixo antes de autorizar o envio real.');
  }

  async function sendConfirmed() {
    if (!draft) return;
    setBusy(true);
    try {
      const response = await apiRequest('/api/meta/whatsapp/messages', draft);
      setResult({ ...draft, ...response }); setNotice(response.duplicate ? 'O pedido anterior já havia sido aceito; nenhuma nova mensagem foi enviada.' : 'A Meta aceitou o envio. A entrega depende do status recebido por webhook.');
      setDraft(null);
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function updateStatus() {
    if (!result) return;
    setBusy(true);
    try { const response = await apiRequest('/api/meta/whatsapp/messages/status', { connectionId:result.connectionId, requestId:result.requestId }); setResult({ ...result, ...response }); setNotice(response.deliveryStatus ? 'Status atualizado com um evento recebido da Meta.' : 'Ainda não há evento de entrega ou leitura recebido pela ESJ.'); }
    catch (error) { setNotice(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return <section className="onboarding-panel whatsapp-admin" aria-labelledby="admin-title">
    <span className="section-badge emerald">Ferramentas de integração</span>
    <h2 id="admin-title">Teste da WhatsApp Business Platform</h2>
    <p>Consulte os ativos oficiais autorizados e envie manualmente um template aprovado pelo número conectado.</p>
    {!connections.length ? <p>Nenhuma conexão salva para esta empresa.</p> : <>
      <label className="form-label" htmlFor="connection-select">Conexão WhatsApp</label>
      <select id="connection-select" className="form-select" value={selected} disabled={busy} onChange={(event) => { setSelected(event.target.value); setAssets(null); setDraft(null); setResult(null); setNotice(''); setConfirmDisconnect(false); }}>
        <option value="">Selecione um número</option>{connections.map((item) => <option key={item.id} value={item.id}>{item.displayPhoneNumber}</option>)}
      </select>
      {row && <>
        <ConnectionStatus status={row.status}/>
        <section className="connection-diagnostics" aria-label="Dados da conexão selecionada">
          <h3>Conexão oficial</h3><dl>
            <dt>Empresa</dt><dd>{tenantName || 'Empresa autenticada'}</dd><dt>Nome da conexão</dt><dd>{row.displayPhoneNumber}</dd>
            <dt>WABA</dt><dd>{row.wabaId}</dd><dt>Número conectado</dt><dd>{row.displayPhoneNumber}</dd>
            <dt>Phone Number ID</dt><dd>{row.phoneNumberId}</dd><dt>Status</dt><dd>{row.status}</dd><dt>Modo</dt><dd>{row.signupMode}</dd>
          </dl>
        </section>
        <div className="admin-actions">
          <button className="btn btn-secondary" disabled={busy || row.status !== 'connected'} onClick={() => action('management')}>Consultar WABA, números e templates</button>
          <button className="btn btn-secondary" disabled={busy || !['connected','pending','error'].includes(row.status)} onClick={() => action('refresh')}>Validar novamente</button>
          <button className="btn btn-secondary" disabled={busy || row.status === 'not_connected'} onClick={() => setConfirmDisconnect(true)}>Desconectar</button>
        </div>
        {confirmDisconnect && <div className="onboarding-notice"><div><p>Desconectar remove a credencial da ESJ e interrompe operações locais. Isto não revoga permissões na Meta.</p><button className="btn btn-secondary" disabled={busy} onClick={() => action('disconnect')}>Confirmar desconexão local</button> <button className="btn btn-secondary" onClick={() => setConfirmDisconnect(false)}>Manter conexão</button></div></div>}
        {assets && <>
          <h3>{assets.waba.name || 'Conta WhatsApp Business'}</h3><p>WABA: {assets.waba.id}</p>
          <div className="admin-table"><table><thead><tr><th>Número</th><th>Nome verificado</th><th>Status</th></tr></thead><tbody>{assets.numbers.map((number) => <tr key={number.id}><td>{number.displayPhoneNumber}</td><td>{number.verifiedName || '—'}</td><td>{number.status}</td></tr>)}</tbody></table></div>
          <div className="admin-table"><table><thead><tr><th>Template</th><th>Idioma</th><th>Status</th><th>Disponível para teste</th></tr></thead><tbody>{assets.templates.map((template) => <tr key={template.id}><td>{template.name}</td><td>{template.language}</td><td>{template.status}</td><td>{template.canTest ? 'Sim' : 'Não'}</td></tr>)}</tbody></table></div>
          <h3>Enviar mensagem de teste</h3><p>Envios são reais e podem gerar cobrança. Esta tela aceita apenas templates aprovados de texto sem variáveis, mídia ou botões.</p>
          <form onSubmit={prepareSend}><fieldset disabled={busy || Boolean(draft) || Boolean(result)}>
            <label className="form-label" htmlFor="template-select">Template aprovado</label><select id="template-select" name="template" className="form-select" required defaultValue=""><option value="">Selecione</option>{assets.templates.filter((template) => template.canTest).map((template) => <option key={template.id} value={template.id}>{template.name} · {template.language}</option>)}</select>
            <label className="form-label" htmlFor="recipient">Destinatário de teste</label><input id="recipient" type="tel" name="recipient" placeholder="+5511999999999" pattern="\+[1-9][0-9]{7,14}" required className="form-input"/><p className="onboarding-small">Use o formato internacional. O número é usado somente para este envio solicitado pelo administrador e não é gravado no histórico da ESJ.</p>
            <label className="admin-consent"><input name="authorized" type="checkbox" required/> Confirmo que este destinatário autorizou receber a mensagem de teste.</label><button className="btn btn-whatsapp" disabled={!assets.templates.some((template) => template.canTest)}>Revisar envio de teste</button>
          </fieldset></form>
        </>}
      </>}
    </>}
    {draft && row && <section className="onboarding-notice" aria-live="polite"><div><h3>Confirmar envio real</h3><dl><dt>Conexão</dt><dd>{row.displayPhoneNumber}</dd><dt>Remetente</dt><dd>{row.displayPhoneNumber}</dd><dt>Destinatário</dt><dd>{maskPhone(draft.recipient)}</dd><dt>Template</dt><dd>{draft.templateName} · {draft.language}</dd></dl><p>Ao confirmar, a ESJ fará uma única chamada à API oficial da Meta.</p><button className="btn btn-whatsapp" disabled={busy} onClick={sendConfirmed}>Enviar mensagem de teste</button> <button className="btn btn-secondary" disabled={busy} onClick={() => setDraft(null)}>Cancelar</button></div></section>}
    {result && <section className="connection-diagnostics" aria-live="polite"><h3>Resultado do envio</h3><dl><dt>Resultado</dt><dd>{result.accepted ? 'Aceito pela Meta' : 'Não confirmado'}</dd><dt>Horário</dt><dd>{dateTime(result.acceptedAt)}</dd><dt>Template</dt><dd>{result.templateName} · {result.language}</dd><dt>Destinatário</dt><dd>{maskPhone(result.recipient)}</dd><dt>Message ID</dt><dd>{result.messageId || 'não disponível'}</dd><dt>Status de entrega</dt><dd>{result.deliveryStatus || 'aguardando evento da Meta'}</dd>{result.deliveryUpdatedAt && <><dt>Atualizado em</dt><dd>{dateTime(result.deliveryUpdatedAt)}</dd></>}</dl><button className="btn btn-secondary" disabled={busy} onClick={updateStatus}>Atualizar status</button></section>}
    <p role="status">{notice}</p>
  </section>;
}
