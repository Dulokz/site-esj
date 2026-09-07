import { companyInfo } from '../data/companyInfo';

export default function DataDeletionPage({ navigate }) {
  return <div className="legal-page-wrapper"><div className="container" style={{ maxWidth: 960 }}>
    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>Voltar ao início</button>
    <h1 style={{ marginTop: '2rem' }}>Exclusão de Dados</h1>
    <div className="legal-content-card">
      <h2>Como solicitar</h2>
      <p>Usuários e empresas clientes podem solicitar informações, correção ou exclusão de dados tratados pela {companyInfo.legalName}, inclusive em integrações autorizadas com a WhatsApp Business Platform.</p>
      <p>Envie um e-mail com o assunto “Solicitação de exclusão de dados” para <a href={`mailto:${companyInfo.email}?subject=Solicita%C3%A7%C3%A3o%20de%20exclus%C3%A3o%20de%20dados`}>{companyInfo.email}</a>.</p>
      <ol><li>Informe seu nome, a empresa relacionada e um contato para resposta.</li><li>Descreva quais dados ou integração deseja excluir. Se necessário, identifique o número empresarial envolvido.</li><li>Aguarde o retorno da ESJ para validar sua identidade e autoridade sobre os dados e informar o andamento da solicitação.</li></ol>
      <p>Não envie senhas, tokens de acesso, documentos sensíveis ou conteúdo de conversas no primeiro contato.</p>
      <h2>Dados de clientes de outras empresas</h2>
      <p>Quando a ESJ atua como operadora, a empresa que atende você é responsável pelas decisões sobre seus dados. Você pode solicitar a exclusão diretamente a ela; a ESJ prestará o suporte técnico aplicável.</p>
      <h2>O que acontece após a solicitação</h2>
      <p>Após a validação, avaliaremos a exclusão ou anonimização conforme a LGPD e o contrato aplicável. Informaremos eventuais dados que precisem ser mantidos para cumprimento de obrigações legais ou exercício regular de direitos. Cópias de segurança seguem seu ciclo de retenção e descarte aplicável.</p>
      <p>Revogar uma autorização na Meta interrompe o acesso autorizado, mas não substitui o pedido de exclusão de dados já tratados. A exclusão na ESJ não apaga automaticamente dados mantidos pela Meta ou pela empresa cliente.</p>
      <a href="/politica-de-privacidade">Consultar a Política de Privacidade</a>
    </div>
  </div></div>;
}
