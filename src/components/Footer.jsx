import React from 'react';
import { Mail, Phone, MapPin, Shield, FileText, ArrowUpRight, Cpu, Building2, UserCheck } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function Footer({ navigate, openContactModal }) {
  const handleNav = (e, path, sectionId) => {
    e.preventDefault();
    navigate(path);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer" id="contato">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Institutional & Identity */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '1.25rem' }}>
              <div className="brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20V9H9V11H18V14H9V17H20V20H4V6Z" fill="#38BDF8" />
                  <circle cx="19" cy="18.5" r="1.5" fill="#34D399" />
                </svg>
              </div>
              <span>ESJ</span>
              <span className="brand-tag">TECNOLOGIA</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              Desenvolvemos sistemas web, automações de processos, inteligência artificial e integrações seguras com a Plataforma do WhatsApp Business para empresas que buscam eficiência e escala técnica.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <span className="footer-legal-tag" style={{ display: 'inline-block', width: 'fit-content' }}>
                {companyInfo.legalName}
              </span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CNPJ: {companyInfo.cnpj}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-col-title">Navegação</h4>
            <ul className="footer-links">
              <li>
                <a href="/" onClick={(e) => handleNav(e, '/', null)} className="footer-link">
                  Início
                </a>
              </li>
              <li>
                <a href="/#solucoes" onClick={(e) => handleNav(e, '/', 'solucoes')} className="footer-link">
                  Soluções & IA
                </a>
              </li>
              <li>
                <a href="/#arquitetura" onClick={(e) => handleNav(e, '/', 'arquitetura')} className="footer-link">
                  Arquitetura de Integração
                </a>
              </li>
              <li>
                <a href="/#produtos" onClick={(e) => handleNav(e, '/', 'produtos')} className="footer-link">
                  Produtos & Projetos
                </a>
              </li>
              <li>
                <a href="/#agro" onClick={(e) => handleNav(e, '/', 'agro')} className="footer-link">
                  Agronegócio
                </a>
              </li>
              <li>
                <a href="/whatsapp-business" onClick={(e) => handleNav(e, '/whatsapp-business', null)} className="footer-link" style={{ color: '#34d399', fontWeight: 600 }}>
                  WhatsApp Business Platform
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Compliance & Legal */}
          <div>
            <h4 className="footer-col-title">Privacidade & Termos</h4>
            <ul className="footer-links">
              <li>
                <a href="/politica-de-privacidade" onClick={(e) => handleNav(e, '/politica-de-privacidade', null)} className="footer-link">
                  <Shield size={14} />
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="/termos-de-uso" onClick={(e) => handleNav(e, '/termos-de-uso', null)} className="footer-link">
                  <FileText size={14} />
                  Termos de Uso
                </a>
              </li>
              <li>
                <button 
                  onClick={openContactModal}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  className="footer-link"
                >
                  <Mail size={14} />
                  Contato Direto
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Transparent Cadastral Contact Info (Audit Ready for Meta) */}
          <div>
            <h4 className="footer-col-title">Dados Empresariais</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                <Building2 size={16} style={{ marginTop: '0.2rem', color: 'var(--accent-blue)', flexShrink: 0 }} />
                <span>
                  <strong>Razão Social:</strong><br />
                  {companyInfo.legalName}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                <Mail size={16} style={{ marginTop: '0.2rem', color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <span>
                  <strong>E-mail Institucional:</strong><br />
                  <a href={`mailto:${companyInfo.email}`} style={{ color: '#93c5fd' }}>{companyInfo.email}</a>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} style={{ marginTop: '0.2rem', color: 'var(--accent-emerald)', flexShrink: 0 }} />
                <span>
                  <strong>Sede:</strong> {companyInfo.address.formatted}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                <UserCheck size={16} style={{ marginTop: '0.2rem', color: '#a78bfa', flexShrink: 0 }} />
                <span>
                  <strong>Responsável:</strong> {companyInfo.technicalLead}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {companyInfo.legalName}. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Engenharia de Software • Cloud APIs • Automação Empresarial
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
