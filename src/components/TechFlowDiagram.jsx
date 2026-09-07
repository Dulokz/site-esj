import React, { useState } from 'react';
import { Building2, Server, Network, Sparkles, Workflow, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TechFlowDiagram() {
  const steps = [
    {
      id: 'empresa',
      icon: Building2,
      label: '1. Sua Empresa',
      sublabel: 'Operação & Rotinas',
      description: 'Mapeamento profundo dos processos, gargalos operacionais e regras de negócio da sua organização.',
      tech: 'Auditoria de Processos'
    },
    {
      id: 'sistemas',
      icon: Server,
      label: '2. Sistemas Legados',
      sublabel: 'ERPs, CRMs e Bancos',
      description: 'Preservamos o investimento existente, conectando os softwares que sua equipe já utiliza no dia a dia.',
      tech: 'Bancos SQL/NoSQL & ERPs'
    },
    {
      id: 'apis',
      icon: Network,
      label: '3. APIs & Conectores',
      sublabel: 'Arquitetura Integrada',
      description: 'Desenvolvimento de middlewares, webhooks, filas seguras e pontes oficiais com plataformas como WhatsApp Business.',
      tech: 'REST / GraphQL / Webhooks'
    },
    {
      id: 'ia',
      icon: Sparkles,
      label: '4. Inteligência Artificial',
      sublabel: 'Decisão & Acurácia',
      description: 'Modelos de linguagem e visão computacional aplicados para triagem, sumarização, OCR e automação inteligente sem hype.',
      tech: 'LLMs & Análise Preditiva'
    },
    {
      id: 'automacao',
      icon: Workflow,
      label: '5. Automação Contínua',
      sublabel: 'Rotinas sem Fricção',
      description: 'Eliminação radical de digitação manual, conciliações demoradas e processos repetitivos entre setores.',
      tech: 'Background Jobs & Workers'
    },
    {
      id: 'resultados',
      icon: CheckCircle2,
      label: '6. Resultados',
      sublabel: 'Escala & Lucro',
      description: 'Operação mais ágil, redução drástica de erros humanos, governança de dados e tempo livre para a liderança.',
      tech: 'Dashboards & Métricas em Tempo Real'
    }
  ];

  const [activeStep, setActiveStep] = useState(steps[2]);

  return (
    <div className="flow-diagram-container">
      {/* Step Nodes Bar */}
      <div className="flow-step-grid">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep.id === step.id;
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`flow-step-node ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStep(step)}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  margin: '0 auto 0.75rem auto',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#60a5fa' : 'var(--text-light)',
                  border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isActive ? '#ffffff' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {step.label.split('. ')[1]}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {step.sublabel}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flow-connector-arrow">
                  <ArrowRight size={18} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Detail panel of selected active step */}
      <div style={{
        marginTop: '2rem',
        padding: '1.75rem 2rem',
        background: 'rgba(10, 14, 23, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="section-badge" style={{ marginBottom: 0, padding: '0.25rem 0.65rem' }}>
              Camada Técnica: {activeStep.label}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              [{activeStep.tech}]
            </span>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
            {activeStep.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Clique nas etapas para inspecionar
          </span>
        </div>
      </div>
    </div>
  );
}
