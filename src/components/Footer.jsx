import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Heart, ShieldCheck, Code2, Globe, Mail } from 'lucide-react'

export const Footer = () => {
  return (
    <footer style={{ background: '#11061A', color: '#FFFFFF', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '48px', paddingBottom: '32px', marginTop: 'auto' }}>
      <div className="app-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#FFF" />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: 0, fontWeight: '800' }}>
                Mink<span style={{ color: 'var(--color-primary)' }}>@rt</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '280px' }}>
              Plataforma peruana de financiamiento colectivo impulsada por <strong>MinkaGuard AI</strong>. Transparencia, trazabilidad y cultura sin fronteras.
            </p>
          </div>

          {/* Navegación rápida */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--color-tertiary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Navegación
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Inicio</Link></li>
              <li><Link to="/cartelera" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Cartelera Cultural</Link></li>
              <li><Link to="/ranking" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Top Mecenas (Salón de Honor)</Link></li>
              <li><Link to="/crear-proyecto" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Publicar Campaña</Link></li>
            </ul>
          </div>

          {/* MinkaGuard AI & Garantías */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--color-tertiary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              MinkaGuard AI
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#10B981" /> Auditoría de Guion y Presupuesto
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#10B981" /> Trazabilidad de Hitos y Avances
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#10B981" /> Google Gemini 3.8 AI Integration
              </li>
            </ul>
          </div>

          {/* Contacto & Perú */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--color-tertiary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Comunidad
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              Hecho con <Heart size={14} color="#EF4444" style={{ display: 'inline', margin: '0 2px' }} /> para la comunidad artística y cultural del Perú.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.8)', padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <Code2 size={18} />
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.8)', padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <Globe size={18} />
              </a>
              <a href="mailto:contacto@minkart.pe" style={{ color: 'rgba(255,255,255,0.8)', padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          <span>© {new Date().getFullYear()} Mink@rt — Crowdfunding Cultural e IA. Todos los derechos reservados.</span>
          <span>Perú 🇵🇪</span>
        </div>
      </div>
    </footer>
  )
}
