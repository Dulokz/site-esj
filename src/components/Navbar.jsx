import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function Navbar({ currentRoute, navigate, openContactModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, route, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (currentRoute !== route) {
      navigate(route);
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <a 
          href="/" 
          onClick={(e) => handleLinkClick(e, '/', null)}
          className="brand-logo"
          id="brand-logo-link"
        >
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20V9H9V11H18V14H9V17H20V20H4V6Z" fill="#38BDF8" />
              <circle cx="19" cy="18.5" r="1.5" fill="#34D399" />
            </svg>
          </div>
          <span>ESJ</span>
          <span className="brand-tag">TECNOLOGIA</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav>
          <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <li>
              <a 
                href="/" 
                className={`nav-link ${currentRoute === '/' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/', null)}
              >
                Início
              </a>
            </li>
            <li>
              <a 
                href="/#solucoes" 
                className="nav-link"
                onClick={(e) => handleLinkClick(e, '/', 'solucoes')}
              >
                Soluções
              </a>
            </li>
            <li>
              <a 
                href="/#arquitetura" 
                className="nav-link"
                onClick={(e) => handleLinkClick(e, '/', 'arquitetura')}
              >
                Arquitetura
              </a>
            </li>
            <li>
              <a 
                href="/#produtos" 
                className="nav-link"
                onClick={(e) => handleLinkClick(e, '/', 'produtos')}
              >
                Produtos
              </a>
            </li>
            <li>
              <a 
                href="/#agro" 
                className="nav-link"
                onClick={(e) => handleLinkClick(e, '/', 'agro')}
              >
                Agronegócio
              </a>
            </li>
            <li>
              <a 
                href="/whatsapp-business" 
                className={`nav-link ${currentRoute === '/whatsapp-business' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/whatsapp-business', null)}
              >
                <span className="nav-badge-pill">Cloud API</span>
                WhatsApp Platform
              </a>
            </li>
            
            {/* Mobile CTA inside dropdown */}
            <li className="mobile-only" style={{ display: mobileMenuOpen ? 'block' : 'none', width: '100%', paddingTop: '1rem' }}>
              <button 
                onClick={() => { setMobileMenuOpen(false); openContactModal(); }}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Fale com a ESJ
                <ArrowRight size={16} />
              </button>
            </li>
          </ul>
        </nav>

        {/* Action Button */}
        <div className="nav-cta">
          <button 
            onClick={openContactModal}
            className="btn btn-primary btn-sm"
            id="nav-contact-btn"
          >
            Fale com a ESJ
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button 
          className="mobile-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menu de navegação"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
