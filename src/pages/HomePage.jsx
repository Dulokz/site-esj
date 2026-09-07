import React, { useState } from 'react';
import { 
  Cpu, 
  Code2, 
  Workflow, 
  Sprout, 
  LineChart, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Bot, 
  MessageSquare, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import TechFlowDiagram from '../components/TechFlowDiagram';
import { companyInfo } from '../data/companyInfo';

export default function HomePage({ navigate, openContactModal }) {
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');

  const products = [
    {
      id: 'agrogestao',
      category: 'agro',
      title: 'AgroGestão & Inteligência Rural',
      status: 'Em Produção',
      badgeColor: '#10b981',
      description: 'Plataforma dedicada à gestão patrimonial, controle operacional, custos de safra e inteligência fiscal para produtores e agroindústrias.',
      tags: ['Gestão Agrícola', 'Livro Caixa Digital', 'Indicadores de Safra']
    },
    {
      id: 'integracoes',
      category: 'integracao',
      title: 'ESJ Connect — Barramento Empresarial',
      status: 'Solução Ativa',
      badgeColor: '#3b82f6',
      description: 'Módulos conectores de APIs e webhooks que unificam ERPs legados, faturadores e plataformas em nuvem sem substituição de softwares.',
      tags: ['Conectores REST', 'Webhooks', 'Filas Assíncronas']
    },
    {
      id: 'whatsapp',
      category: 'whatsapp',
      title: 'WhatsApp Business Platform Suite',
      status: 'Cloud API',
      badgeColor: '#06b6d4',
      description: 'Arquitetura de mensageria oficial para notificações transacionais, acompanhamento de ordens de serviço e atendimento estruturado.',
      tags: ['Cloud API Meta', 'Atendimento Híbrido', 'Disparos Ativos']
    },
    {
      id: 'financeiro',
      category: 'gestao',
      title: 'Módulo de Gestão Financeira & DRE',
      status: 'Módulo Corporativo',
      badgeColor: '#6366f1',
      description: 'Automação de conciliação bancária, fluxo de caixa projetado e geração automatizada de relatórios contábeis e gerenciais.',
      tags: ['DRE em Tempo Real', 'Conciliação OFX/API', 'Contas a Pagar/Receber']
    },
    {
      id: 'clinicas',
      category: 'software',
      title: 'ClinicFlow — Gestão de Clínicas',
      status: 'Especializado',
      badgeColor: '#ec4899',
      description: 'Sistema web para prontuários eletrônicos, confirmação automática de consultas via WhatsApp oficial e faturamento ágil.',
      tags: ['Prontuário Eletrônico', 'Confirmação Ativa', 'Agenda Multiprofissional']
    },
    {
      id: 'adminauto',
      category: 'automacao',
      title: 'AdminAuto — Automação Administrativa',
      status: 'Operacional',
      badgeColor: '#f59e0b',
      description: 'Robôs e rotinas de extração de dados de notas fiscais, leitura inteligente de documentos via OCR e arquivamento em nuvem.',
      tags: ['OCR com IA', 'Processamento de XMLs', 'Zero Trabalho Manual']
    }
  ];

  const filteredProducts = selectedProductFilter === 'all' 
    ? products 
    : products.filter(p => p.category === selectedProductFilter);

  return (
    <div>
      {/* ================= HERO SECTION ================= */}
      <section className="hero-wrapper">
        <div className="tech-grid-pattern" />
        <div className="hero-glow-sphere" />

        <div className="container hero-content">
          <div className="section-badge" style={{ animation: 'fadeIn 0.6s ease' }}>
            <Cpu size={14} />
            <span>Engenharia de Software • IA Prática • Integrações Críticas</span>
          </div>

          <h1 className="hero-headline">
            Tecnologia aplicada a <br />
            <span className="gradient-tech">problemas reais.</span>
          </h1>

          <p className="hero-subheadline">
            Desenvolvemos sistemas, automações, inteligência artificial e soluções digitais para transformar processos, conectar operações e criar novas possibilidades para empresas.
          </p>

          <div className="hero-actions">
            <a 
              href="#solucoes" 
              className="btn btn-primary btn-lg"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('solucoes')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Conheça nossas soluções
              <ArrowRight size={18} />
            </a>

            <button 
              onClick={openContactModal}
              className="btn btn-secondary btn-lg"
            >
              Fale com a ESJ
            </button>
          </div>

          {/* Metrics / Trust Indicators */}
          <div className="hero-metrics">
            <div className="metric-item">
              <div className="metric-value">
                100%
              </div>
              <div className="metric-label">Soluções Sob Medida</div>
            </div>

            <div className="metric-item">
              <div className="metric-value">
                Cloud API
              </div>
              <div className="metric-label">WhatsApp Oficial</div>
            </div>

            <div className="metric-item">
              <div className="metric-value">
                Segurança
              </div>
              <div className="metric-label">Conformidade LGPD</div>
            </div>

            <div className="metric-item">
              <div className="metric-value">
                Agro & Tech
              </div>
              <div className="metric-label">Gestão de Alta Precisão</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= O QUE FAZEMOS (PILARES ESJ) ================= */}
      <section className="section" id="solucoes" style={{ background: 'rgba(10, 14, 23, 0.5)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge cyan">Nossos Pilares</span>
            <h2 className="section-title">O que fazemos</h2>
            <p className="section-subtitle">
              A ESJ não atua como mera fábrica de telas ou revendedora de pacotes engessados. Projetamos a infraestrutura que viabiliza o crescimento da sua operação.
            </p>
          </div>

          <div className="grid-3">
            {/* Pilar 1: IA */}
            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper cyan">
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem' }}>Inteligência Artificial</h3>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Soluções utilizando IA para automação de tarefas intelectuais, análise semântica de dados, atendimento com contexto corporativo, produtividade e transformação de processos sem alucinações.
              </p>
            </div>

            {/* Pilar 2: Desenvolvimento de Software */}
            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper">
                <Code2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem' }}>Desenvolvimento de Software</h3>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Sistemas web modernos, plataformas SaaS, ferramentas internas, dashboards em tempo real e portais desenvolvidos sob medida para as particularidades do seu negócio.
              </p>
            </div>

            {/* Pilar 3: Automações e Integrações */}
            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper emerald">
                <Workflow size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem' }}>Automações e Integrações</h3>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Integração confiável entre sistemas legados, APIs, Plataforma do WhatsApp Business, webhooks em tempo real e orquestração de rotinas para eliminar o trabalho braçal.
              </p>
            </div>

            {/* Pilar 4: Agronegócio */}
            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper emerald">
                <Sprout size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem' }}>Soluções para o Agronegócio</h3>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Tecnologia aplicada à gestão rural estratégica, planejamento patrimonial, controle de custos de produção, inteligência fiscal e facilidade na prestação de contas.
              </p>
            </div>

            {/* Pilar 5: Consultoria e Transformação */}
            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper">
                <LineChart size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem' }}>Consultoria & Transformação Digital</h3>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Mapeamento cirúrgico de processos, eliminação de gargalos e construção de soluções tecnológicas específicas para os desafios estruturais das empresas.
              </p>
            </div>

            {/* Pilar 6: WhatsApp Business Especializado */}
            <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.25)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 22, 36, 0.75) 100%)' }}>
              <div className="card-top-line" style={{ background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }} />
              <div className="card-icon-wrapper emerald">
                <MessageSquare size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem' }}>WhatsApp Business Platform</h3>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                Desenvolvemos arquiteturas oficiais de mensageria conectadas à Cloud API da Meta para notificações críticas, CRM e fluxos transacionais.
              </p>
              <button 
                onClick={() => navigate('/whatsapp-business')}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              >
                Ver Página Oficial da Solução
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TECNOLOGIA QUE SE ADAPTA AO NEGÓCIO ================= */}
      <section className="section" id="arquitetura">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Engenharia Sob Medida</span>
            <h2 className="section-title">Tecnologia que se adapta ao negócio</h2>
            <p className="section-subtitle" style={{ maxWidth: '820px' }}>
              Nem todo problema precisa de mais um sistema. Às vezes, precisa que os sistemas existentes conversem entre si. Em outros casos, o processo inteiro precisa ser repensado. A ESJ desenvolve soluções sob medida combinando software, automação, APIs e inteligência artificial.
            </p>
          </div>

          <TechFlowDiagram />
        </div>
      </section>

      {/* ================= PRODUTOS E PROJETOS ================= */}
      <section className="section" id="produtos" style={{ background: 'rgba(10, 14, 23, 0.6)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge cyan">Ecossistema de Soluções</span>
            <h2 className="section-title">Produtos e Projetos</h2>
            <p className="section-subtitle">
              Módulos proprietários e estruturas desenvolvidas pela ESJ prontas para acelerar a transformação tecnológica da sua empresa.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', label: 'Todos os Projetos' },
              { id: 'agro', label: 'Agronegócio' },
              { id: 'integracao', label: 'Integrações & APIs' },
              { id: 'whatsapp', label: 'WhatsApp Business' },
              { id: 'gestao', label: 'Gestão & Finanças' },
              { id: 'software', label: 'Sistemas Especiais' },
              { id: 'automacao', label: 'Automação Admin' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedProductFilter(tab.id)}
                style={{
                  background: selectedProductFilter === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedProductFilter === tab.id ? '#93c5fd' : 'var(--text-secondary)',
                  border: `1px solid ${selectedProductFilter === tab.id ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 1.15rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      background: `${product.badgeColor}18`,
                      color: product.badgeColor,
                      border: `1px solid ${product.badgeColor}35`
                    }}>
                      {product.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                    {product.title}
                  </h3>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.65' }}>
                    {product.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    {product.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text-muted)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SEÇÃO AGRO ================= */}
      <section className="section" id="agro" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(16, 22, 36, 0.8) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div className="grid-2" style={{ alignItems: 'center' }}>
              <div>
                <span className="section-badge emerald">Agronegócio & Gestão Estratégica</span>
                <h2 style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', marginBottom: '1.25rem', lineHeight: '1.2' }}>
                  Tecnologia também se <br />
                  <span style={{ color: '#34d399' }}>planta no campo.</span>
                </h2>
                <p style={{ fontSize: '1.08rem', color: 'var(--text-light)', marginBottom: '1.75rem', lineHeight: '1.75' }}>
                  Soluções desenvolvidas para produtores rurais e empresas ligadas ao agronegócio, combinando gestão, dados, automação e inteligência fiscal.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={18} color="#10b981" />
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      Controle gerencial e financeiro adaptado à realidade da lavoura
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={18} color="#10b981" />
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      Conformidade com o Livro Caixa Digital do Produtor Rural (LCDPR)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={18} color="#10b981" />
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      Apuração de resultados por safra, talhão e centro de custos
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={openContactModal}
                    className="btn btn-whatsapp"
                  >
                    Falar sobre Soluções Agro
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Agro Visual Terminal / Metric Card */}
              <div style={{
                background: 'rgba(11, 15, 23, 0.9)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6ee7b7' }}>
                      ESJ Agro Analytics • Live Engine
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    v2.4
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Auditoria de Notas Fiscais Rurais
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      100% Conciliado via OCR / XML
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Gestão de Patrimônio e Máquinas
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#67e8f9', fontFamily: 'var(--font-mono)' }}>
                      Depreciação & Manutenção Ativa
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Comunicação com o Produtor
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                      WhatsApp Platform Oficial
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEÇÃO SOBRE IA ================= */}
      <section className="section" style={{ background: 'rgba(10, 14, 23, 0.5)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge cyan">Pragmatismo Tecnológico</span>
            <h2 className="section-title">IA útil. Não IA por moda.</h2>
            <p className="section-subtitle">
              Aplicamos inteligência artificial onde ela realmente reduz trabalho, melhora decisões, automatiza processos e aumenta a capacidade das equipes.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper cyan">
                <Bot size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Triagem e Atendimento com Contexto</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Assistentes inteligentes que consultam sua base de conhecimento restrita para responder dúvidas operacionais sem inventar informações.
              </p>
            </div>

            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper">
                <FileSpreadsheet size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Extração e Leitura de Documentos</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Processamento semântico de contratos, faturas e certidões, convertendo PDFs complexos em dados estruturados diretamente nos seus sistemas.
              </p>
            </div>

            <div className="card">
              <div className="card-top-line" />
              <div className="card-icon-wrapper emerald">
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Copilotos de Produtividade Interna</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Ferramentas especializadas para seus colaboradores redigirem pareceres, consolidarem relatórios financeiros e analisarem métricas em segundos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEÇÃO FINAL (CTA DE CONVERSÃO) ================= */}
      <section className="section" style={{ position: 'relative' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 22, 36, 0.9) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <span className="section-badge" style={{ marginBottom: '1.25rem' }}>
                Inicie a Transformação
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.85rem)', marginBottom: '1.5rem', lineHeight: '1.25' }}>
                Existe um processo na sua empresa que ainda parece mais complicado do que deveria?
              </h2>
              <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                Não importa se o seu desafio envolve sistemas antigos, automação de ponta ou uma nova plataforma: a equipe de engenharia da ESJ está pronta para analisar o cenário.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={openContactModal}
                  className="btn btn-primary btn-lg"
                >
                  Vamos conversar
                  <ArrowRight size={18} />
                </button>
                <a 
                  href={companyInfo.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                >
                  <MessageSquare size={18} />
                  Falar pelo WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
