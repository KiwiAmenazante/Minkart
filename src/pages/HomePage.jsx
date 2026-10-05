import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight, Film, BookOpen, Video, Tv, CheckCircle, TrendingUp, Users, Cpu, FileText } from 'lucide-react'
import { ProjectCard } from '../components/ProjectCard'

export const HomePage = ({ projects = [], onOpenAuth, currentUser }) => {
  const navigate = useNavigate()

  const featuredProjects = projects.slice(0, 3)
  const totalFunding = projects.reduce((sum, p) => sum + Number(p.current_amount || 0), 0)

  return (
    <div style={{ background: '#FAF8F5' }}>
      {/* Hero Principal */}
      <section style={{
        background: 'linear-gradient(135deg, #1D062B 0%, #311147 60%, #150520 100%)',
        color: '#FFFFFF',
        padding: '70px 20px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow de fondo decorativo */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(235,94,85,0.2) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div className="app-container" style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 18px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--color-tertiary)',
            marginBottom: '24px'
          }}>
            <Sparkles size={16} /> Impulsado por Google Gemini 3.8 AI & Supabase
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: '900',
            lineHeight: 1.15,
            marginBottom: '20px',
            letterSpacing: '-1px',
            color: '#FFFFFF',
            textShadow: '0 2px 18px rgba(0,0,0,0.35)'
          }}>
            El Futuro del Crowdfunding Cultural en el <span style={{
              background: 'linear-gradient(90deg, #FF6B6B, #FECA57)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none'
            }}>Perú</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.92)',
            maxWidth: '750px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Mink@rt conecta a creadores independientes de cine, teatro, cómics y animación con mecenas. Todo respaldado por el motor de auditoría <strong style={{ color: '#FFFFFF' }}>MinkaGuard AI</strong>.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/cartelera')}
              style={{ padding: '16px 32px', fontSize: '1rem', borderRadius: '40px' }}
            >
              Explorar Cartelera <ArrowRight size={20} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                if (!currentUser) onOpenAuth()
                else navigate('/crear-proyecto')
              }}
              style={{ padding: '16px 32px', fontSize: '1rem', borderRadius: '40px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)', color: '#FFFFFF' }}
            >
              Publicar mi Proyecto
            </button>
          </div>
        </div>
      </section>

      {/* Ticker de Métricas */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '24px 20px' }}>
        <div className="app-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', textAlign: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-primary)' }}>
              S/ {totalFunding.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Recaudados para el Arte</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-secondary)' }}>
              {projects.length} Obra(s)
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>En Campaña Activa</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '900', color: '#10B981' }}>
              92%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Viabilidad Promedio IA</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-tertiary)' }}>
              100%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Trazabilidad & Hitos</span>
          </div>
        </div>
      </section>

      {/* Sección MinkaGuard AI */}
      <section style={{ padding: '60px 20px' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="category-tag" style={{ position: 'static', display: 'inline-block', marginBottom: '10px' }}>
              TECNOLOGÍA REVOLUCIONARIA
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-neutral)' }}>
              ¿Cómo funciona MinkaGuard AI?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '8px auto 0' }}>
              Garantizamos la transparencia eliminando la incertidumbre para los mecenas culturales.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FileText color="#D97706" size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>1. Auditoría de Documentos</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Gemini AI analiza guiones, desgloses de costos y cronogramas persistidos en Supabase Storage para calcular un <strong>Risk Score</strong> objetivo.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Cpu color="#10B981" size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>2. Recompensas Inteligentes</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                La IA sugiere automáticamente niveles de recompensa (Reward Tiers) personalizados según la temática y trama de la obra.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck color="#9333EA" size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>3. Bitácora & Hitos</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Los creadores publican avances con fotos en tiempo real. MinkaGuard AI actualiza la fiabilidad a medida que se entregan los hitos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section style={{ padding: '40px 20px 70px', background: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Proyectos Destacados</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Obras culturales peruanas listas para ser financiadas</p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/cartelera')}>
              Ver Cartelera Completa <ArrowRight size={16} />
            </button>
          </div>

          {featuredProjects.length > 0 ? (
            <div className="projects-grid">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando proyectos en cartelera...</p>
          )}
        </div>
      </section>
    </div>
  )
}
