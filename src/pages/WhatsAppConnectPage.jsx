import { useEffect,useRef,useState } from 'react';
import { ArrowRight,LockKeyhole,MessageCircle,Info } from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus';
import { apiRequest,loadMetaSDK,launchMetaSignup,metaSignupDiagnostic } from '../lib/meta/embedded-signup';
import { errorMessage } from '../lib/meta/errors';
import WhatsAppAdmin from '../components/WhatsAppAdmin';
import { companyInfo } from '../data/companyInfo';
const steps=['Entrar com sua conta Meta','Selecionar o portfólio empresarial','Selecionar ou criar uma conta do WhatsApp Business','Selecionar o número','Autorizar a ESJ','Concluir integração'];
export default function WhatsAppConnectPage(){
  const [session,setSession]=useState(null),[data,setData]=useState(null),[busy,setBusy]=useState(true),[message,setMessage]=useState('Verificando sua sessão…'),[prepared,setPrepared]=useState(null),[signupMode,setSignupMode]=useState('coexistence');
  const flow=useRef(null);
  const [flowActive,setFlowActive]=useState(false);
  async function refresh(){
    const account=await apiRequest('/api/auth/session');setSession(account);
    const status=await apiRequest('/api/meta/whatsapp/status');setData(status);return status;
  }
  useEffect(()=>{
    let alive=true;
    (async()=>{try{
      const account=await apiRequest('/api/auth/session');
      if(!alive)return;setSession(account);
      const status=await apiRequest('/api/meta/whatsapp/status');
      if(!alive)return;setData(status);setMessage(status.canConnect?'Sua empresa pode iniciar uma autorização pela Meta.':errorMessage({code:'configuration_required'}));
    }catch(error){if(alive)setMessage(errorMessage(error));}finally{if(alive)setBusy(false);}})();
    return()=>{alive=false;flow.current?.abort();};
  },[]);
  async function login(event){
    event.preventDefault();setBusy(true);
    const form=new FormData(event.currentTarget);
    try{await apiRequest('/api/auth/login',{email:form.get('email'),password:form.get('password')});const status=await refresh();setMessage(status.canConnect?'Acesso confirmado. Prepare sua conexão com a Meta.':errorMessage({code:'configuration_required'}));}
    catch(error){setMessage(errorMessage(error));}finally{setBusy(false);}
  }
  async function prepare(){
    setBusy(true);setPrepared(null);
    try{const config=await apiRequest('/api/meta/whatsapp/signup/start',{signupMode});await loadMetaSDK(config);setPrepared({...config,preparedAt:Date.now()});setMessage('Tudo pronto. Clique em “Continuar com a Meta” para abrir a autorização oficial.');}
    catch(error){setMessage(errorMessage(error));}finally{setBusy(false);}
  }
  async function connect(){
    if(!prepared || Date.now()-prepared.preparedAt>8*60*1000){setPrepared(null);setMessage('Prepare uma nova conexão: esta tentativa expirou.');return;}
    setBusy(true);setFlowActive(true);flow.current=new AbortController();
    try{
      // Call before any await to preserve the browser user gesture for the Meta popup.
      const result=await launchMetaSignup(prepared,flow.current.signal);
      setMessage('Validando autorização e ativos no servidor…');
      metaSignupDiagnostic('callback_post_attempt',{payload:{statePresent:Boolean(result.state),codePresent:Boolean(result.code),wabaIdPresent:Boolean(result.waba_id),phoneNumberIdPresent:Boolean(result.phone_number_id),signupMode:result.signup_mode}});
      try {
        await apiRequest('/api/meta/whatsapp/callback',result,undefined,({status,ok})=>metaSignupDiagnostic('callback_http_response',{status,ok}));
      } catch(error) {
        metaSignupDiagnostic('callback_post_error',{error:typeof error?.code==='string'?error.code:'request_failed',status:Number.isInteger(error?.status)?error.status:null});
        throw error;
      }
      const status=await refresh();
      setMessage(status.status==='connected'?'Conexão validada e salva para sua empresa.':'A autorização foi salva. O número ainda aguarda conclusão; use “Validar novamente”.');
    }catch(error){
      setMessage(errorMessage(error));
      if(['signup_cancelled','signup_timeout','meta_signup_failed','sdk_unavailable'].includes(error.code)){
        metaSignupDiagnostic('callback_cancel_post_attempt',{statePresent:Boolean(prepared.state)});
        try{await apiRequest('/api/meta/whatsapp/callback',{state:prepared.state,error:'cancelled'},undefined,({status,ok})=>metaSignupDiagnostic('callback_cancel_http_response',{status,ok}));}catch(cancelError){metaSignupDiagnostic('callback_cancel_post_error',{error:typeof cancelError?.code==='string'?cancelError.code:'request_failed',status:Number.isInteger(cancelError?.status)?cancelError.status:null});}
      }
      try{await refresh();}catch{/* Keep the original sanitized error. */}
    }finally{flow.current=null;setFlowActive(false);setPrepared(null);setBusy(false);}
  }
  async function logout(){setBusy(true);try{await apiRequest('/api/auth/logout',{});setSession(null);setData(null);setPrepared(null);setMessage('Sessão encerrada.');}catch(error){setMessage(errorMessage(error));}finally{setBusy(false);}}
  return <div className="legal-page-wrapper onboarding-page"><div className="container">
    <a className="onboarding-back" href="/whatsapp-business">← WhatsApp Business</a>
    <div className="onboarding-heading"><span className="section-badge emerald"><MessageCircle size={15}/> Integração oficial</span><h1>Conecte sua empresa ao WhatsApp Business</h1><p>Autorize a ESJ pela Meta para integrar o WhatsApp da sua empresa aos seus sistemas e processos. Sua empresa mantém a titularidade da conta e do número.</p></div>
    <div className="onboarding-grid"><section className="onboarding-panel"><h2>Como será a conexão</h2><p>Depois de entrar na ESJ, você realizará estas etapas no ambiente da Meta.</p><ol className="onboarding-steps">{steps.map((step,index)=><li key={step}><span aria-hidden="true">{index+1}</span><div>{step}</div></li>)}</ol></section>
    <section className="onboarding-panel onboarding-action"><div className="card-icon-wrapper emerald"><LockKeyhole size={26}/></div><h2>{session?session.tenant.name:'Entre na plataforma ESJ'}</h2>
      {session?<><p className="onboarding-small">{session.user.email} · Administrador</p>{data&&<ConnectionStatus status={data.status}/>}
        <p>Use uma conta Meta com permissão para administrar o portfólio empresarial e o WhatsApp que deseja integrar.</p>
        <fieldset className="signup-mode-options" disabled={busy||Boolean(prepared)}><legend>Como deseja conectar este número?</legend>
          <label className={signupMode==='coexistence'?'selected':''}><input type="radio" name="signup-mode" value="coexistence" checked={signupMode==='coexistence'} onChange={()=>setSignupMode('coexistence')}/><span><strong>Usar meu WhatsApp Business atual</strong><em>Recomendado</em><small>Quando elegível pela Meta, o mesmo número continua no WhatsApp Business App e também é conectado à API oficial.</small></span></label>
          <label className={signupMode==='cloud_api'?'selected':''}><input type="radio" name="signup-mode" value="cloud_api" checked={signupMode==='cloud_api'} onChange={()=>setSignupMode('cloud_api')}/><span><strong>Usar um número dedicado à Cloud API</strong><small>Para um número novo ou dedicado à plataforma.</small></span></label>
        </fieldset>
        {!prepared?<button className="btn btn-secondary" disabled={busy||!data?.canConnect} onClick={prepare}>{busy?'Preparando…':'Preparar conexão'}</button>:<button className="btn btn-whatsapp" disabled={busy} onClick={connect}>{busy?'Autorização em andamento…':'Continuar com a Meta'}<ArrowRight size={18}/></button>}
        {flowActive&&<button className="btn btn-secondary btn-sm" onClick={()=>flow.current?.abort()}>Cancelar tentativa</button>}
        <button className="btn btn-secondary btn-sm" disabled={busy} onClick={logout}>Sair da plataforma</button>
      </>:<form onSubmit={login}><label className="form-label" htmlFor="login-email">E-mail administrativo</label><input id="login-email" name="email" type="email" autoComplete="username" required maxLength={254} className="form-input"/><label className="form-label" htmlFor="login-password">Senha da plataforma ESJ</label><input id="login-password" name="password" type="password" autoComplete="current-password" required maxLength={256} className="form-input"/><button className="btn btn-whatsapp" disabled={busy}>{busy?'Verificando…':'Entrar na ESJ'}</button><p className="onboarding-small">Use o acesso fornecido pela ESJ. A senha da Meta será solicitada somente no ambiente da Meta.</p></form>}
      <div className="onboarding-notice" role="status"><Info size={20}/><p>{message}</p></div>
      <p className="onboarding-small">A coexistência com o WhatsApp Business App depende da disponibilidade e elegibilidade definidas pela Meta.</p><p className="onboarding-small">Consulte a <a href="/politica-de-privacidade">Política de Privacidade</a>, os <a href="/termos-de-uso">Termos de Uso</a> e as instruções de <a href="/exclusao-de-dados">exclusão de dados</a>.</p><a href={`mailto:${companyInfo.email}`}>Falar com a ESJ →</a>
    </section></div>
    {session&&data&&<WhatsAppAdmin connections={data.connections} refresh={refresh}/>}
  </div></div>;
}
