import React, { useState } from 'react';
import { Smartphone, Cloud, ShieldAlert, Cpu, Database, ArrowRight, ArrowDown, Lock, CheckCircle2 } from 'lucide-react';

export default function WhatsAppFlow() {
  const [selectedNode, setSelectedNode] = useState('gateway');

  const nodes = [
    {
      id: 'cliente',
      title: 'Cliente no WhatsApp',
      subtitle: 'Usuário Final / Produtor / Paciente',
      icon: Smartphone,
      color: '#34d399',
      badge: 'Origem / Destino',
      tech: 'Mensagens criptografadas de ponta a ponta pelo WhatsApp',
      details: 'O cliente inicia uma conversa, responde a um alerta programado ou solicita um serviço pelo aplicativo habitual do WhatsApp em seu celular.'
    },
    {
      id: 'platform',
      title: 'WhatsApp Business Platform',
      subtitle: 'Meta Cloud API Oficial',
      icon: Cloud,
      color: '#38bdf8',
      badge: 'Camada Meta',
      tech: 'APIs oficiais com SLA corporativo e alta disponibilidade',
      details: 'Tráfego oficial da Meta via Webhooks seguros (HTTPS/TLS). Sem emulações ou métodos não autorizados, garantindo estabilidade e integridade da linha telefônica.'
    },
    {
      id: 'gateway',
      title: 'Infraestrutura ESJ',
      subtitle: 'Gateway Seguro & Orquestração',
      icon: Lock,
      color: '#60a5fa',
      badge: 'Núcleo ESJ',
      tech: 'Autenticação de tokens, validação de assinaturas e filas isoladas',
      details: 'A infraestrutura da ESJ recebe os eventos, valida a integridade das requisições com chave de segurança, aplica regras de negócio e roteia as mensagens sem reter dados além da finalidade contratada.'
    },
    {
      id: 'sistemas',
      title: 'Sistemas da Sua Empresa',
      subtitle: 'CRM / ERP / Automação / IA',
      icon: Database,
      color: '#a78bfa',
      badge: 'Seu Ecossistema',
      tech: 'Integração bidirecional com bancos e softwares legados',
      details: 'As informações alimentam seu CRM, registram pedidos no ERP, acionam fluxos automatizados, disparam IA corporativa ou notificam atendentes humanos para assumir o suporte.'
    }
  ];

  const currentNode = nodes.find(n => n.id === selectedNode) || nodes[2];

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '2.5rem 2rem',
      position: 'relative'
    }}>
      {/* Visual Flow diagram */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        alignItems: 'stretch',
        position: 'relative'
      }} className="wa-flow-grid">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              style={{
                background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.65)',
                border: `1px solid ${isSelected ? node.color : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 1.25rem',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                boxShadow: isSelected ? `0 0 30px ${node.color}25` : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${node.color}18`,
                    border: `1px solid ${node.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: node.color
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)'
                  }}>
                    0{index + 1}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>
                  {node.title}
                </h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {node.subtitle}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: node.color, fontFamily: 'var(--font-mono)' }}>
                  {isSelected ? '● Selecionado' : '○ Clique para inspecionar'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Detail Box */}
      <div style={{
        marginTop: '2rem',
        padding: '1.75rem 2rem',
        background: 'rgba(10, 14, 23, 0.75)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '0.75rem',
          borderRadius: '12px',
          background: `${currentNode.color}15`,
          color: currentNode.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle2 size={24} />
        </div>

        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              {currentNode.title}
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '0.2rem 0.6rem', borderRadius: '4px', background: `${currentNode.color}20`, color: currentNode.color }}>
              {currentNode.badge}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            {currentNode.details}
          </p>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Protocolo / Segurança: {currentNode.tech}
          </div>
        </div>
      </div>
    </div>
  );
}
