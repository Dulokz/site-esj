import React from 'react';
import { Shield, Lock, FileCheck, Building2, Mail, ArrowLeft } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function PrivacyPage({ navigate }) {
  return (
    <div className="legal-page-wrapper">
      <div className="container" style={{ maxWidth: '960px' }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={15} />
          Voltar ao Início
        </button>

        <div className="section-badge cyan">Conformidade Legal & LGPD</div>
        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '0.75rem' }}>
          Política de Privacidade
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
          Diretrizes de transparência, tratamento e segurança de dados pessoais e operacionais praticadas pela ESJ.
        </p>

        <div className="legal-meta-box">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Controladora dos Dados:</span>
            <div style={{ fontWeight: 600, color: '#ffffff' }}>{companyInfo.legalName}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CNPJ:</span>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>{companyInfo.cnpj}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Última Atualização:</span>
            <div style={{ color: '#67e8f9' }}>Setembro de 2026</div>
          </div>
        </div>

        <div className="legal-content-card">
          <h2>1. Introdução e Compromisso</h2>
          <p>
            A <strong>{companyInfo.legalName}</strong> ("ESJ", "nós" ou "empresa") respeita a privacidade de seus clientes, usuários e parceiros comerciais. Esta Política de Privacidade estabelece como coletamos, utilizamos, armazenamos, processamos e protegemos os dados no contexto de nossas atividades de desenvolvimento de software, consultoria tecnológica, automação empresarial e prestação de serviços de integração com APIs corporativas, incluindo a <strong>Plataforma do WhatsApp Business (Cloud API da Meta)</strong>.
          </p>
          <p>
            Nossas operações são pautadas pela Lei Geral de Proteção de Dados Pessoais do Brasil (Lei nº 13.709/2018 - LGPD), fundamentando-se nos princípios de finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência e segurança.
          </p>

          <h2>2. Papel da ESJ: Controladora e Operadora</h2>
          <p>
            No fornecimento de suas soluções, a ESJ atua sob duas figuras distintas conforme a LGPD:
          </p>
          <ul>
            <li>
              <strong>Como Controladora:</strong> em relação aos dados cadastrais e de faturamento dos representantes de empresas clientes contratantes (ex.: nome, e-mail comercial, telefone corporativo, cargo e dados fiscais necessários à execução do contrato comercial).
            </li>
            <li>
              <strong>Como Operadora:</strong> em relação aos dados transmitidos, trafegados ou orquestrados por meio de nossos softwares, conectores, middlewares e integrações contratadas pelo cliente. Nesses casos, o tratamento de dados ocorre estritamente em nome e segundo as orientações lícitas da empresa contratante (que atua como Controladora).
            </li>
          </ul>

          <h2>3. Tratamento de Dados na Plataforma do WhatsApp Business</h2>
          <p>
            No desenvolvimento e suporte a fluxos de integração que utilizam a API oficial do WhatsApp Business:
          </p>
          <ul>
            <li>
              <strong>Finalidade Exclusiva:</strong> A ESJ utiliza as informações e eventos de mensagens estritamente para viabilizar a entrega técnica dos serviços contratados pela empresa cliente (envio de notificações transacionais, recebimento de chamados, automações pré-configuradas e roteamento para atendentes).
            </li>
            <li>
              <strong>Proibição de Venda e Criação de Perfis:</strong> Os dados de mensagens e números telefônicos <strong>não são vendidos, alugados ou cedidos a terceiros</strong>, nem são utilizados pela ESJ para publicidade própria, rastreamento comportamental ou criação de perfis comerciais.
            </li>
            <li>
              <strong>Permissões e Consentimento:</strong> O acesso às ferramentas de comunicação ocorre unicamente conforme as permissões delegadas e autorizadas formalmente pela empresa cliente proprietária da conta do WhatsApp Business.
            </li>
            <li>
              <strong>Retenção Mínima:</strong> Registros técnicos e logs de mensageria são retidos pelo período estritamente necessário para garantia de estabilidade operacional, depuração de erros e cumprimento de obrigações legais de rastreabilidade, sendo descartados de forma segura após o período de vigência.
            </li>
          </ul>

          <h2>4. Coleta de Informações em Nossas Plataformas e Site</h2>
          <p>
            Ao navegar pelo site <code>eduardosj.com.br</code> ou solicitar contato, poderemos coletar:
          </p>
          <ul>
            <li>Dados fornecidos ativamente no formulário de contato (nome, empresa, e-mail, telefone e descrição do projeto);</li>
            <li>Registros de conexão e navegação estritamente necessários para segurança da infraestrutura (endereço IP, timestamp e tipo de navegador), conforme preconiza o Marco Civil da Internet (Lei nº 12.965/2014);</li>
            <li>Cookies estritamente necessários para desempenho e funcionamento da aplicação, sem o uso de rastreadores invasivos de terceiros.</li>
          </ul>

          <h2>5. Segurança e Medidas Técnicas de Proteção</h2>
          <p>
            Implementamos salvaguardas técnicas e organizacionais compatíveis com os padrões do setor para proteger as informações processadas contra acessos não autorizados, interceptações, perdas ou adulterações:
          </p>
          <ul>
            <li>Criptografia de ponta a ponta durante o trânsito com protocolo seguro HTTPS/TLS;</li>
            <li>Autenticação de API via tokens criptográficos e validação de assinaturas em tempo real em todos os webhooks recebidos;</li>
            <li>Controle de acesso granular baseado no princípio do menor privilégio (least privilege);</li>
            <li>Monitoramento contínuo de logs de auditoria contra tentativas de intrusão ou atividades anômalas.</li>
          </ul>

          <h2>6. Compartilhamento Restrito com Terceiros</h2>
          <p>
            A ESJ não compartilha dados de clientes ou de usuários finais, exceto:
          </p>
          <ul>
            <li>Com provedores essenciais de infraestrutura em nuvem e provedores oficiais de API (como servidores de hospedagem seguros e a Meta Platforms Inc. no caso de uso da Cloud API oficial), sob acordos rigorosos de confidencialidade;</li>
            <li>Mediante ordem judicial formal ou requisição legal emanada de autoridade pública competente.</li>
          </ul>

          <h2>7. Direitos do Titular de Dados</h2>
          <p>
            Em conformidade com o artigo 18 da LGPD, os titulares de dados pessoais podem a qualquer momento solicitar:
          </p>
          <ul>
            <li>Confirmação da existência de tratamento;</li>
            <li>Acesso aos dados pessoais;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
            <li>Revogação do consentimento, quando aplicável.</li>
          </ul>
          <p>
            Para dados nos quais a ESJ atua como Operadora (ex.: mensagens de clientes finais do nosso contratante), as solicitações deverão ser direcionadas primariamente à empresa contratante (Controladora), prestando a ESJ o suporte técnico cabível.
          </p>

          <h2>8. Canal de Comunicação do Encarregado de Dados (DPO)</h2>
          <p>
            Para esclarecer dúvidas sobre esta Política de Privacidade ou exercer direitos previstos na LGPD, entre em contato direto com o nosso responsável pelo tratamento de dados através do e-mail:
          </p>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem 1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
            <div style={{ fontWeight: 600, color: '#ffffff' }}>Encarregado de Proteção de Dados (DPO / Privacidade)</div>
            <div style={{ color: '#93c5fd', marginTop: '0.25rem' }}>E-mail: <a href={`mailto:${companyInfo.email}`} style={{ color: '#38bdf8' }}>{companyInfo.email}</a></div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{companyInfo.legalName} • {companyInfo.address.formatted}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
