import React from 'react';
import { FileText, CheckCircle, ShieldAlert, Building2, ArrowLeft } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function TermsPage({ navigate }) {
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

        <div className="section-badge cyan">Termos & Condições de Serviços</div>
        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '0.75rem' }}>
          Termos de Uso
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
          Condições gerais aplicáveis ao acesso, licenciamento de software, serviços de consultoria e integrações tecnológicas da ESJ.
        </p>

        <div className="legal-meta-box">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Razão Social Contratada:</span>
            <div style={{ fontWeight: 600, color: '#ffffff' }}>{companyInfo.legalName}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CNPJ:</span>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>{companyInfo.cnpj}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vigência:</span>
            <div style={{ color: '#67e8f9' }}>A partir de Setembro de 2026</div>
          </div>
        </div>

        <div className="legal-content-card">
          <h2>1. Objeto e Âmbito de Aplicação</h2>
          <p>
            O presente documento estabelece as condições gerais aplicáveis à utilização dos serviços, plataformas digitais, softwares proprietários, ferramentas de automação e integrações de sistemas desenvolvidos e fornecidos pela <strong>{companyInfo.legalName}</strong> ("ESJ") a pessoas físicas ou jurídicas ("Contratante" ou "Usuário").
          </p>
          <p>
            Ao contratar nossos serviços, acessar nossas ferramentas ou homologar integrações técnicas, o Usuário declara ter ciência e concordar integralmente com estes Termos de Uso e com a nossa Política de Privacidade.
          </p>

          <h2>2. Natureza das Soluções e Serviços Prestados</h2>
          <p>
            A ESJ atua no mercado de tecnologia prestando serviços especializados que compreendem:
          </p>
          <ul>
            <li>Desenvolvimento de sistemas sob medida, portais web, dashboards e aplicações corporativas;</li>
            <li>Consultoria técnica em transformação digital, mapeamento de processos e engenharia de software;</li>
            <li>Construção e sustentação de pipelines de integração entre sistemas legados, ERPs, CRMs e bancos de dados;</li>
            <li>Implementação de fluxos operacionais conectados à Plataforma Oficial do WhatsApp Business (Cloud API da Meta);</li>
            <li>Aplicações práticas de Inteligência Artificial para automação de tarefas e suporte a decisões de negócio.</li>
          </ul>

          <h2>3. Diretrizes de Uso da Plataforma do WhatsApp Business</h2>
          <p>
            Para clientes que utilizam as soluções de integração com o WhatsApp disponibilizadas pela ESJ:
          </p>
          <ul>
            <li>
              <strong>Conformidade com as Políticas da Meta:</strong> O Contratante obriga-se a utilizar os canais de mensageria em estrita observância às Diretrizes Comerciais e Políticas do WhatsApp Business, abstendo-se do envio de spam, mensagens não autorizadas (sem opt-in prévio e comprovável do destinatário) ou conteúdo ilícito.
            </li>
            <li>
              <strong>Autonomia e Gestão de Contas:</strong> A titularidade da linha telefônica e a conta no Gerenciador de Negócios da Meta pertencem à empresa Contratante. A ESJ fornece o suporte de engenharia e os conectores técnicos autorizados, não respondendo por penalidades impostas pela Meta decorrentes de práticas inadequadas de envio adotadas pelo Contratante.
            </li>
            <li>
              <strong>Sem Garantia de Ausência de Modificações de Terceiros:</strong> A disponibilidade dos serviços depende da estabilidade das APIs públicas ou privadas dos provedores de nuvem e da Meta. A ESJ compromete-se a manter seu gateway atualizado e operacional conforme os mais elevados padrões técnicos.
            </li>
          </ul>

          <h2>4. Propriedade Intelectual</h2>
          <p>
            Exceto quando expressamente disposto em contrato específico de cessão de direitos de código sob medida:
          </p>
          <ul>
            <li>Todos os códigos-fonte de base, bibliotecas, algoritmos proprietários, marcas, logotipos, documentações técnicas e interfaces desenvolvidas pela ESJ permanecem sob propriedade intelectual exclusiva da {companyInfo.legalName}.</li>
            <li>É concedida ao Contratante uma licença de uso não exclusiva, intransferível e revogável exclusivamente para a finalidade contratada, sendo vedada a engenharia reversa, descompilação ou sublicenciamento sem anuência prévia e por escrito.</li>
          </ul>

          <h2>5. Obrigações e Responsabilidades do Contratante</h2>
          <p>
            O Contratante compromete-se a:
          </p>
          <ul>
            <li>Fornecer dados cadastrais verídicos, completos e atualizados;</li>
            <li>Garantir a legitimidade da base de dados de seus próprios clientes que vierem a ser processados através de nossas integrações, assegurando o cumprimento das bases legais exigidas pela LGPD;</li>
            <li>Zelar pela confidencialidade de credenciais de acesso, chaves de API e tokens atribuídos aos seus colaboradores.</li>
          </ul>

          <h2>6. Limitação de Responsabilidade</h2>
          <p>
            A ESJ empenha seus melhores esforços e metodologias ágeis de engenharia para assegurar a estabilidade, segurança e disponibilidade de suas plataformas. Todavia, a empresa não se responsabiliza por:
          </p>
          <ul>
            <li>Interrupções provocadas por falhas de conectividade da internet global ou indisponibilidade de serviços de terceiros (ex.: instabilidades na Meta Cloud API ou concessionárias de telecomunicação);</li>
            <li>Uso indevido das ferramentas por operadores não capacitados do Contratante;</li>
            <li>Perdas indiretas, lucros cessantes ou danos hipotéticos não decorrentes de dolo comprovado da ESJ.</li>
          </ul>

          <h2>7. Modificações dos Termos</h2>
          <p>
            A ESJ reserva-se o direito de atualizar estes Termos periodicamente para refletir aprimoramentos técnicos ou exigências regulatórias. Modificações substanciais serão comunicadas através do site oficial. O uso continuado das soluções após a publicação de alterações implica a aceitação dos novos termos.
          </p>

          <h2>8. Legislação Aplicável e Foro</h2>
          <p>
            Estes Termos de Uso são regidos e interpretados em conformidade com as leis da República Federativa do Brasil. Para dirimir quaisquer litígios oriundos deste instrumento, fica eleito o Foro da Comarca da sede da {companyInfo.legalName}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
          </p>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Dúvidas sobre estes termos? Contate nossa equipe jurídica e administrativa pelo e-mail: <a href={`mailto:${companyInfo.email}`} style={{ color: '#93c5fd' }}>{companyInfo.email}</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
