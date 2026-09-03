import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Workflow, 
  Database, 
  Network, 
  Users, 
  ShieldCheck, 
  Lock, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  UserCheck, 
  Globe, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  Briefcase,
  Sprout,
  Store,
  Layers,
  FileCheck
} from 'lucide-react';
import WhatsAppFlow from '../components/WhatsAppFlow';
import { companyInfo } from '../data/companyInfo';

export default function WhatsAppPage({ openContactModal }) {
  const [activeUseCaseTab, setActiveUseCaseTab] = useState('clinicas');

  const useCases = {
    clinicas: {
      title: 'Clínicas & Consultórios de Saúde',
      icon: Stethoscope,
      accent: '#ec4899',
      description: 'Humanização do atendimento aliada à redução da taxa de absenteísmo (não comparecimento) através de fluxos validados.',
      items: [
        'Confirmação ativa de consultas com botão interativo (Sim / Remarcar)',
        'Envio de orientações pré-exames e preparos de procedimentos',
        'Atendimento receptivo para esclarecimento de dúvidas e convênios',
        'Pesquisas de satisfação e pós-atendimento com registro direto em prontuário'
      ]
    },
    escritorios: {
      title: 'Escritórios & Prestadores de Serviços',
      icon: Briefcase,
      accent: '#6366f1',
      description: 'Transparência no relacionamento e agilidade no envio de relatórios e documentos regulatórios.',
      items: [
        'Acompanhamento de status de processos e fases de projetos em andamento',
        'Disparo programado de guias tributárias, faturas e certidões',
        'Canal centralizado de atendimento com triagem por setor (Financeiro, Jurídico, Suporte)',
        'Notificações de prazos e vencimentos críticos com confirmação de leitura'
      ]
    },
    agro: {
      title: 'Agronegócio & Cooperativas',
      icon: Sprout,
      accent: '#10b981',
      description: 'Comunicação ágil e confiável entre a administração e produtores em campo, superando barreiras de e-mail.',
      items: [
        'Avisos de recebimento e pesagem de grãos nos armazéns e silos',
        'Comunicação de cotações diárias, boletins meteorológicos e prazos de fixação',
        'Envio de romaneios, notas fiscais e relatórios de aplicação de insumos',
        'Atendimento técnico para chamados agronômicos e suporte operacional'
      ]
    },
    empresas: {
      title: 'Empresas em Geral & Varejo B2B',
      icon: Store,
      accent: '#3b82f6',
      description: 'Integração de ponta a ponta com softwares de gestão para acelerar o ciclo de vendas e suporte ao cliente.',
      items: [
        'Integração direta com CRMs corporativos (HubSpot, Pipedrive, Salesforce ou sistemas próprios)',
        'Régua de cobrança preventiva com emissão instantânea de Pix Copia e Cola',
        'Notificações de envio de mercadorias e código de rastreamento logístico',
        'Automação de perguntas frequentes sem perder a transição fluida para atendentes humanos'
      ]
    }
  };

  const currentCase = useCases[activeUseCaseTab];
  const CaseIcon = currentCase.icon;

  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      {/* ================= HERO ESPECÍFICO ================= */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '4rem' }}>
        <div className="tech-grid-pattern" />
        
        {/* Subtle glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.05), transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '880px' }}>
          <div className="section-badge emerald" style={{ marginBottom: '1.25rem' }}>
            <MessageSquare size={14} />
            <span>Soluções com a API Oficial do WhatsApp Business</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Integre o WhatsApp aos <br />
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 40%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              sistemas da sua empresa.
            </span>
          </h1>

          <p style={{ fontSize: '1.18rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2.5rem' }}>
            A ESJ desenvolve soluções de integração utilizando a Plataforma do WhatsApp Business para conectar atendimento, sistemas, automações e processos empresariais.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button 
              onClick={openContactModal}
              className="btn btn-whatsapp btn-lg"
              id="wa-hero-cta"
            >
              Fale sobre uma integração
              <ArrowRight size={18} />
            </button>
            <a 
              href="#como-funciona" 
              className="btn btn-secondary btn-lg"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Entenda a Arquitetura
            </a>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-light)',
            backdropFilter: 'blur(10px)',
            maxWidth: '100%',
            textAlign: 'left'
          }}>
            <ShieldCheck size={20} color="#34d399" style={{ flexShrink: 0 }} />
            <span>
              Arquitetura de integração técnica em conformidade com as diretrizes da <strong>WhatsApp Business Platform (Cloud API Oficial)</strong> e a <strong>LGPD</strong>.
            </span>
          </div>
        </div>
      </section>

      {/* ================= O QUE A INTEGRAÇÃO PERMITE ================= */}
      <section className="section" style={{ background: 'rgba(10, 14, 23, 0.5)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge cyan">Capacidades Técnicas</span>
            <h2 className="section-title">O que a integração permite</h2>
            <p className="section-subtitle">
              Recursos de alta confiabilidade para transformar o canal mais utilizado do Brasil em um ativo integrado aos seus processos.
            </p>
          </div>

          <div className="grid-3">
            {/* Card 1 */}
            <div className="card">
              <div className="card-top-line" style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)' }} />
              <div className="card-icon-wrapper cyan">
                <Send size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Envio e Recebimento de Mensagens</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Integração de mensagens do WhatsApp com sistemas empresariais. Envio de notificações transacionais em larga escala e recepção de demandas organizadas.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card">
              <div className="card-top-line" style={{ background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }} />
              <div className="card-icon-wrapper emerald">
                <Workflow size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Automação de Processos</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Notificações, confirmações, lembretes e fluxos automatizados orientados a eventos, eliminando atrasos e tarefas manuais de cobrança ou agendamento.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card">
              <div className="card-top-line" style={{ background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)' }} />
              <div className="card-icon-wrapper">
                <Database size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Integração com CRM e Sistemas</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Conectar conversas a clientes, atendimentos, pedidos, agendas ou processos internos, mantendo o histórico corporativo unificado.
              </p>
            </div>

            {/* Card 4 */}
            <div className="card">
              <div className="card-top-line" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
              <div className="card-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
                <Network size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Webhooks e APIs em Tempo Real</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Integrações bidirecionais em milissegundos entre o WhatsApp e os softwares do cliente com validação rigorosa de assinatura criptográfica.
              </p>
            </div>

            {/* Card 5 */}
            <div className="card">
              <div className="card-top-line" style={{ background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }} />
              <div className="card-icon-wrapper" style={{ background: 'rgba(167, 139, 250, 0.1)', borderColor: 'rgba(167, 139, 250, 0.3)', color: '#c084fc' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Atendimento Humano + Automação</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Permitir que a tecnologia auxilie o atendimento sem eliminar a participação humana: triagem inteligente com transição imediata para analistas reais.
              </p>
            </div>

            {/* Card 6: Garantia de Infraestrutura */}
            <div className="card" style={{ background: 'rgba(20, 29, 47, 0.7)' }}>
              <div className="card-top-line" />
              <div className="card-icon-wrapper">
                <FileCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Estabilidade & Cloud Oficial</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Uso exclusivo das rotas Cloud API oficiais, eliminando riscos de banimento de linhas, instabilidade de servidores locais ou bloqueios de número.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMO FUNCIONA (FLUXOGRAMA AUDITÁVEL) ================= */}
      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Arquitetura de Dados</span>
            <h2 className="section-title">Como funciona</h2>
            <p className="section-subtitle">
              Fluxo transparente e seguro desde o envio pelo cliente até o processamento no seu sistema empresarial.
            </p>
          </div>

          <WhatsAppFlow />
        </div>
      </section>

      {/* ================= CASOS DE USO ================= */}
      <section className="section" style={{ background: 'rgba(10, 14, 23, 0.6)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge cyan">Aplicações Reais</span>
            <h2 className="section-title">Casos de Uso Setoriais</h2>
            <p className="section-subtitle">
              Como diferentes segmentos de mercado aplicam as integrações da ESJ para gerar valor imediato.
            </p>
          </div>

          {/* Use Case Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'clinicas', label: 'Clínicas & Saúde', icon: Stethoscope },
              { id: 'escritorios', label: 'Escritórios & Serviços', icon: Briefcase },
              { id: 'agro', label: 'Agronegócio', icon: Sprout },
              { id: 'empresas', label: 'Empresas em Geral', icon: Store }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isCurrent = activeUseCaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveUseCaseTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isCurrent ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    background: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: isCurrent ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <TabIcon size={18} color={isCurrent ? '#60a5fa' : 'currentColor'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Card */}
          <div className="card" style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${currentCase.accent}15`,
                border: `1px solid ${currentCase.accent}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentCase.accent
              }}>
                <CaseIcon size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', color: '#ffffff' }}>{currentCase.title}</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{currentCase.description}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
              {currentCase.items.map((item, i) => (
                <div 
                  key={i} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    background: 'rgba(10, 14, 23, 0.5)',
                    padding: '1.2rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <CheckCircle2 size={18} color={currentCase.accent} style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <span style={{ fontSize: '0.94rem', color: 'var(--text-light)', lineHeight: '1.6' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROTEÇÃO E USO DE DADOS (CRÍTICA PARA META) ================= */}
      <section className="section" id="privacidade-seguranca" style={{ position: 'relative' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 22, 36, 0.95) 0%, rgba(10, 14, 23, 0.98) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            maxWidth: '1050px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa'
              }}>
                <Lock size={24} />
              </div>
              <div>
                <span className="section-badge" style={{ marginBottom: 0 }}>Governança & Segurança da Informação</span>
                <h2 style={{ fontSize: '1.85rem', color: '#ffffff', marginTop: '0.25rem' }}>Privacidade e Segurança</h2>
              </div>
            </div>

            {/* Strict wording as required */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '1.05rem', color: 'var(--text-light)', lineHeight: '1.8' }}>
              <p>
                A <strong>ESJ CONSULTORIA E SERVIÇOS LTDA</strong> utiliza os dados recebidos pelas integrações exclusivamente para fornecer os serviços contratados pelas empresas clientes.
              </p>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid #3b82f6',
                padding: '1.25rem 1.5rem',
                borderRadius: '0 8px 8px 0',
                color: '#ffffff'
              }}>
                Os dados <strong>não são vendidos a terceiros</strong> nem utilizados para criação de perfis publicitários de qualquer natureza.
              </div>

              <p>
                O acesso às informações ocorre apenas conforme as permissões expressamente concedidas pela empresa responsável pela conta conectada, respeitando os princípios de necessidade e finalidade previstos na Lei Geral de Proteção de Dados (LGPD).
              </p>

              <p>
                A plataforma utiliza mecanismos de autenticação de tokens, criptografia HTTPS/TLS em trânsito, controle rigoroso de acesso e as melhores práticas de segurança da informação para proteger integralmente as informações processadas em cada pipeline de integração.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SOBRE A EMPRESA (AUDIT READY FOR META) ================= */}
      <section className="section" style={{ background: 'rgba(10, 14, 23, 0.5)' }}>
        <div className="container" style={{ maxWidth: '1050px' }}>
          <div className="section-header">
            <span className="section-badge">Identificação Institucional</span>
            <h2 className="section-title">Sobre a Empresa</h2>
            <p className="section-subtitle">
              Estrutura societária, atuação no desenvolvimento de soluções tecnológicas e canais cadastrais oficiais.
            </p>
          </div>

          <div className="card" style={{ padding: '3rem' }}>
            <p style={{ fontSize: '1.08rem', color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '2rem' }}>
              A <strong>{companyInfo.legalName}</strong> atua no desenvolvimento de soluções tecnológicas, consultoria técnica, engenharia de software sob medida, automação empresarial e integração de sistemas legados com a Plataforma do WhatsApp Business.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', color: 'var(--accent-blue)' }}>
                  <Building2 size={18} />
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Razão Social</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>
                  {companyInfo.legalName}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', color: 'var(--accent-cyan)' }}>
                  <FileCheck size={18} />
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>CNPJ</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {companyInfo.cnpj}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', color: 'var(--accent-emerald)' }}>
                  <Mail size={18} />
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>E-mail Institucional</span>
                </div>
                <div style={{ fontSize: '1rem', color: '#ffffff' }}>
                  <a href={`mailto:${companyInfo.email}`} style={{ color: '#93c5fd' }}>{companyInfo.email}</a>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', color: '#a78bfa' }}>
                  <MapPin size={18} />
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Endereço Empresarial</span>
                </div>
                <div style={{ fontSize: '1rem', color: '#ffffff' }}>
                  {companyInfo.address.formatted}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', color: '#fbbf24' }}>
                  <UserCheck size={18} />
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Responsável Técnico</span>
                </div>
                <div style={{ fontSize: '1rem', color: '#ffffff' }}>
                  {companyInfo.technicalLead}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', color: '#38bdf8' }}>
                  <Globe size={18} />
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Domínio Oficial</span>
                </div>
                <div style={{ fontSize: '1rem', color: '#ffffff' }}>
                  <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#67e8f9' }}>
                    {companyInfo.website.replace('https://', '')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ESPECÍFICO ================= */}
      <section className="section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 22, 36, 0.9) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', marginBottom: '1rem', color: '#ffffff' }}>
              Pronto para integrar o WhatsApp à inteligência da sua empresa?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 2.5rem auto' }}>
              Converse com nossa equipe para estruturar o fluxo de dados, aprovação de números e conexão com seus softwares.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={openContactModal}
                className="btn btn-whatsapp btn-lg"
              >
                Solicitar Diagnóstico de Integração
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
