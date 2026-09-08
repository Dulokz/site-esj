import { useState } from 'react';
import { apiRequest } from '../lib/meta/embedded-signup';
import { errorMessage } from '../lib/meta/errors';
import ConnectionStatus from './ConnectionStatus';
export default function WhatsAppAdmin({connections,refresh}){
  const [selected,setSelected]=useState(''),[assets,setAssets]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[request,setRequest]=useState(null),[confirmDisconnect,setConfirmDisconnect]=useState(false);
  const row=connections.find(item=>item.id===selected);
  async function action(path){
    setBusy(true);setMessage('Consultando…');
    try{const result=await apiRequest(`/api/meta/whatsapp/${path}`,{connectionId:selected});if(path==='management'){setAssets(result);setMessage('Ativos consultados diretamente na Meta.');}else{setAssets(null);setMessage(path==='disconnect'?'Conexão local removida. Para revogar a autorização na Meta, acesse as integrações empresariais da sua conta Meta.':'Validação concluída. Confira o estado atualizado.');}await refresh();}
    catch(error){setMessage(errorMessage(error));try{await refresh();}catch{/* Keep original error. */}}
    finally{setBusy(false);setConfirmDisconnect(false);}
  }
  async function send(event){
    event.preventDefault();setBusy(true);
    const form=new FormData(event.currentTarget);
    const template=assets.templates.find(item=>item.id===form.get('template'));
    const payload=request || {connectionId:selected,requestId:crypto.randomUUID(),recipient:form.get('recipient'),recipientAuthorized:form.get('authorized')==='on',templateName:template.name,language:template.language};
    setRequest(payload);
    try{await apiRequest('/api/meta/whatsapp/messages',payload);setMessage('Mensagem aceita pela Meta. A aceitação não confirma entrega ou leitura.');}
    catch(error){setMessage(errorMessage(error));}
    finally{setBusy(false);}
  }
  return <section className="onboarding-panel whatsapp-admin" aria-labelledby="admin-title"><h2 id="admin-title">WhatsApp da sua empresa</h2><p>Consulte os ativos autorizados e envie um template de teste pelo número conectado.</p>
    {!connections.length?<p>Nenhuma conexão salva para esta empresa.</p>:<><label className="form-label" htmlFor="connection-select">Conexão</label><select id="connection-select" className="form-select" value={selected} disabled={busy} onChange={event=>{setSelected(event.target.value);setAssets(null);setRequest(null);setMessage('');setConfirmDisconnect(false);}}><option value="">Selecione um número</option>{connections.map(item=><option key={item.id} value={item.id}>{item.displayPhoneNumber}</option>)}</select>
    {row&&<><ConnectionStatus status={row.status}/><section className="connection-diagnostics" aria-label="Diagnóstico da conexão"><h3>Diagnóstico da conexão</h3><dl><dt>Modo</dt><dd>{row.signupMode}</dd><dt>WABA</dt><dd>{row.wabaId}</dd><dt>Phone Number</dt><dd>{row.displayPhoneNumber} ({row.phoneNumberId})</dd><dt>Status</dt><dd>{row.status}</dd><dt>is_on_biz_app</dt><dd>{row.isOnBizApp === null ? 'não consultado' : row.isOnBizApp ? 'true' : 'false'}</dd><dt>platform_type</dt><dd>{row.platformType || 'não consultado'}</dd><dt>Webhook messages</dt><dd>{row.webhookMessagesReceived ? 'sim' : 'não'}</dd><dt>Webhook smb_message_echo</dt><dd>{row.webhookSmbMessageEchoReceived ? 'sim' : 'não'}</dd></dl></section><div className="admin-actions"><button className="btn btn-secondary" disabled={busy||row.status!=='connected'} onClick={()=>action('management')}>Consultar WABA, números e templates</button><button className="btn btn-secondary" disabled={busy||!['connected','pending','error'].includes(row.status)} onClick={()=>action('refresh')}>Validar novamente</button><button className="btn btn-secondary" disabled={busy||row.status==='not_connected'} onClick={()=>setConfirmDisconnect(true)}>Desconectar</button></div>
    {confirmDisconnect&&<div className="onboarding-notice"><div><p>Desconectar remove a credencial da ESJ e interrompe as operações locais deste número. Isso não revoga automaticamente as permissões concedidas na Meta.</p><button className="btn btn-secondary" disabled={busy} onClick={()=>action('disconnect')}>Confirmar desconexão local</button><button className="btn btn-secondary" onClick={()=>setConfirmDisconnect(false)}>Manter conexão</button></div></div>}
    {row.status==='reauthorization_required'&&<p>Use uma nova autorização com a Meta acima para reconectar este número.</p>}
    {assets&&<><h3>{assets.waba.name || 'Conta WhatsApp Business'}</h3><p>WABA: {assets.waba.id}</p><ul>{assets.numbers.map(number=><li key={number.id}>{number.displayPhoneNumber} · {number.verifiedName} · {number.status}</li>)}</ul><div className="admin-table"><table><thead><tr><th>Template</th><th>Idioma</th><th>Status</th></tr></thead><tbody>{assets.templates.map(template=><tr key={template.id}><td>{template.name}</td><td>{template.language}</td><td>{template.status}</td></tr>)}</tbody></table></div>
    <h3>Enviar template de teste</h3><p>Esta ação envia uma mensagem real e pode gerar cobrança da Meta. Esta versão suporta templates aprovados de texto, sem variáveis, mídia ou botões.</p>
    <form onSubmit={send}><fieldset disabled={busy||!!request}><label className="form-label" htmlFor="template-select">Template aprovado</label><select id="template-select" name="template" className="form-select" required><option value="">Selecione</option>{assets.templates.filter(template=>template.canTest).map(template=><option key={template.id} value={template.id}>{template.name} · {template.language}</option>)}</select><label className="form-label" htmlFor="recipient">Destinatário de teste (código do país e número)</label><input id="recipient" type="tel" name="recipient" placeholder="+55…" pattern="\+[1-9][0-9]{7,14}" required className="form-input"/><label className="admin-consent"><input name="authorized" type="checkbox" required/> Confirmo que este destinatário autorizou receber esta mensagem de teste.</label><button className="btn btn-whatsapp" disabled={!assets.templates.some(template=>template.canTest)}>Enviar mensagem real de teste</button></fieldset></form>
    {request&&<p>Este teste foi registrado e não será reenviado automaticamente. Para outro teste, selecione novamente a conexão após conferir o resultado anterior.</p>}
    </>}
    </>}
    </>}
    <p role="status">{message}</p>
  </section>;
}
