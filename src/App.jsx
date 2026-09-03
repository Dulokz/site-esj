import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import HomePage from './pages/HomePage';
import WhatsAppPage from './pages/WhatsAppPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

export default function App() {
  // Read initial route from window.location.pathname
  const getInitialRoute = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path === '/whatsapp-business') return '/whatsapp-business';
    if (path === '/politica-de-privacidade') return '/politica-de-privacidade';
    if (path === '/termos-de-uso') return '/termos-de-uso';
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Synchronize browser history and document title
  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update dynamic SEO page titles per route
  useEffect(() => {
    switch (currentRoute) {
      case '/whatsapp-business':
        document.title = 'WhatsApp Business Platform | Integrações Oficiais Cloud API - ESJ';
        break;
      case '/politica-de-privacidade':
        document.title = 'Política de Privacidade & LGPD | ESJ Consultoria e Serviços';
        break;
      case '/termos-de-uso':
        document.title = 'Termos de Uso de Software & Serviços | ESJ';
        break;
      default:
        document.title = 'ESJ | Tecnologia, Engenharia de Software, IA e Automação Empresarial';
        break;
    }
  }, [currentRoute]);

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  return (
    <div className="app-layout">
      {/* Shared Navigation Header */}
      <Navbar 
        currentRoute={currentRoute} 
        navigate={navigate} 
        openContactModal={openContactModal} 
      />

      {/* Main Routed Page Content */}
      <main>
        {currentRoute === '/' && (
          <HomePage navigate={navigate} openContactModal={openContactModal} />
        )}
        {currentRoute === '/whatsapp-business' && (
          <WhatsAppPage openContactModal={openContactModal} />
        )}
        {currentRoute === '/politica-de-privacidade' && (
          <PrivacyPage navigate={navigate} />
        )}
        {currentRoute === '/termos-de-uso' && (
          <TermsPage navigate={navigate} />
        )}
      </main>

      {/* Shared Corporate Footer */}
      <Footer navigate={navigate} openContactModal={openContactModal} />

      {/* Global Contact & Diagnostics Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={closeContactModal} 
      />
    </div>
  );
}
