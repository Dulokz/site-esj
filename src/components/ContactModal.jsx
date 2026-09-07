import React, { useState } from 'react';
import { X, Send, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    interest: 'software',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission with mailto / feedback
    const subject = encodeURIComponent(`[Contato ESJ] ${formData.name} - ${formData.company}`);
    const body = encodeURIComponent(
      `Nome: ${formData.name}\n` +
      `Empresa: ${formData.company}\n` +
      `E-mail: ${formData.email}\n` +
      `Telefone: ${formData.phone}\n` +
      `Interesse: ${formData.interest}\n\n` +
      `Mensagem:\n${formData.message}`
    );
    
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = `mailto:${companyInfo.email}?subject=${subject}&body=${body}`;
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Fechar modal">
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: '#34d399', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={48} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Solicitação Preparada!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Seu cliente de e-mail foi acionado com os dados estruturados para a equipe da ESJ. Entraremos em contato com brevidade.
            </p>
            <button 
              className="btn btn-secondary" 
              onClick={() => { setSubmitted(false); onClose(); }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <span className="section-badge cyan" style={{ marginBottom: '0.75rem' }}>
                Atendimento Técnico & Comercial
              </span>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Vamos conversar com a ESJ</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Explique seu desafio ou objetivo técnico. Avaliaremos a melhor abordagem de software, automação ou IA para seu negócio.
              </p>
            </div>

            {/* Direct Channel Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <a 
                href={companyInfo.whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ justifyContent: 'center' }}
              >
                <MessageCircle size={16} />
                WhatsApp Oficial
              </a>
              <a 
                href={`mailto:${companyInfo.email}`} 
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center' }}
              >
                <Mail size={16} />
                E-mail Corporativo
              </a>
            </div>

            <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-subtle)' }} />
              <span style={{ position: 'relative', background: 'var(--bg-surface-elevated)', padding: '0 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                ou envie os detalhes
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Seu Nome *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Ex: Carlos Mendes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Empresa</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Grupo Agro / Empresa"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">E-mail Profissional *</label>
                  <input 
                    type="email" 
                    required 
                    className="form-input" 
                    placeholder="nome@empresa.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone / WhatsApp</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Foco do Projeto</label>
                <select 
                  className="form-select"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                >
                  <option value="software">Desenvolvimento de Software Sob Medida / SaaS</option>
                  <option value="whatsapp">Integração WhatsApp Business Platform</option>
                  <option value="automacao">Automação de Processos & Conexão de APIs</option>
                  <option value="ia">Inteligência Artificial Aplicada ao Negócio</option>
                  <option value="agro">Soluções para o Agronegócio & Gestão</option>
                  <option value="consultoria">Consultoria Técnica & Diagnóstico</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Descreva brevemente o desafio</label>
                <textarea 
                  className="form-textarea"
                  placeholder="Quais sistemas precisam se conectar? Onde estão os gargalos manuais?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Send size={16} />
                Enviar Mensagem para Análise
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
