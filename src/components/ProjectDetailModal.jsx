import React, { useState } from 'react'
import { X, Sparkles, CheckCircle2, AlertTriangle, Heart, Award, Clock } from 'lucide-react'

export const ProjectDetailModal = ({ project, onClose, onContribute }) => {
  const [activeTab, setActiveTab] = useState('audit') // 'sinopsis' | 'audit' | 'avances'
  const [selectedTier, setSelectedTier] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!project) return null

  const percentage = Math.min(Math.round((project.current_amount / project.funding_goal) * 100), 100)

  const handleSelectTier = (tier) => {
    setSelectedTier(tier)
    setCustomAmount(tier.minimum_amount.toString())
  }

  const handleSubmitContribution = async (e) => {
    e.preventDefault()
    const amountToPay = parseFloat(customAmount)
    if (!amountToPay || amountToPay <= 0) return

    setIsSubmitting(true)
    const result = await onContribute({
      projectId: project.id,
      amount: amountToPay,
      rewardTierId: selectedTier?.id
    })
    setIsSubmitting(false)

    if (result?.success) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1800)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Hero Section */}
        <div className="modal-hero">
          <img
            src={project.image_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80'}
            alt={project.title}
            className="modal-hero-img"
          />
          <div className="modal-hero-overlay">
            <div>
              <span className="category-tag" style={{ position: 'static', marginBottom: '8px', display: 'inline-block' }}>
                {project.category}
              </span>
              <h2 className="modal-hero-title">{project.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                Por {project.creator?.full_name || 'Creador Mink@rt'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="modal-grid">
          {/* Columna Izquierda: Tabs & Contenido */}
          <div>
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                Auditoría IA (MinkaGuard)
              </button>
              <button
                className={`tab-btn ${activeTab === 'sinopsis' ? 'active' : ''}`}
                onClick={() => setActiveTab('sinopsis')}
              >
                Sinopsis & Propuesta
              </button>
              <button
                className={`tab-btn ${activeTab === 'avances' ? 'active' : ''}`}
                onClick={() => setActiveTab('avances')}
              >
                Avances & Bitácora
              </button>
            </div>

            {/* Contenido Pestaña Auditoría IA */}
            {activeTab === 'audit' && (
              <div className="ai-audit-panel">
                <div className="ai-audit-header">
                  <h4 className="ai-audit-title">
                    <Sparkles color="var(--color-primary)" size={20} />
                    Informe MinkaGuard AI
                  </h4>
                  <span className="risk-score-badge high" style={{ position: 'static' }}>
                    Risk Score: {project.risk_score}% Viable
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.6 }}>
                  {project.ai_analysis_report?.summary ||
                    'La Inteligencia Artificial ha evaluado el guion, desglose presupuestario y cronograma de producción entregados por la dirección del proyecto.'}
                </p>

                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5DEC9' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>DEGLOSE DE EVALUACIÓN AUDITABLE:</strong>
                  <ul className="ai-bullet-list">
                    <li>
                      <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Presupuesto coherente:</strong> Asignación de recursos alineada al promedio del sector audiovisual peruano.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Cronograma realista:</strong> Tiempos de rodaje y montaje viables según el número de locaciones.</span>
                    </li>
                    <li>
                      <AlertTriangle size={16} color="#F4A22B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Riesgo detectado:</strong> Recomienda asegurar equipo adicional de post-producción sonora antes del mes 3.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Contenido Pestaña Sinopsis */}
            {activeTab === 'sinopsis' && (
              <div style={{ lineHeight: 1.7, color: 'var(--color-neutral)', fontSize: '0.95rem' }}>
                <h4 style={{ marginBottom: '10px' }}>Sobre la Obra</h4>
                <p style={{ marginBottom: '14px' }}>
                  {project.synopsis ||
                    'Esta producción cultural busca reivindicar el patrimonio artístico e historias locales a través de narrativas contemporáneas y un equipo técnico independiente de primer nivel.'}
                </p>
                <p>
                  Con tu apoyo como mecenas, se financiarán las etapas de grabación, alquiler de equipos técnicos y honorarios del elenco artístico.
                </p>
              </div>
            )}

            {/* Contenido Pestaña Avances */}
            {activeTab === 'avances' && (
              <div style={{ fontSize: '0.9rem' }}>
                <h4 style={{ marginBottom: '12px' }}>Historial de Hitos de Producción</h4>
                <div style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '700' }}>HOY</span>
                    <p style={{ fontWeight: '700' }}>Campaña activa publicada en Mink@rt</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>Evaluación MinkaGuard AI aprobada al {project.risk_score}%.</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Fase Previa</span>
                    <p style={{ fontWeight: '700' }}>Lectura de Guion y Creador Verificado</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Panel de Aportes / Tiers */}
          <div>
            <div style={{ background: '#F9F6F0', borderRadius: '16px', padding: '24px', border: '1px solid var(--color-border)' }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-neutral)' }}>
                  S/ {project.current_amount.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  recaudados de S/ {project.funding_goal.toLocaleString()}
                </span>

                <div className="progress-bar-bg" style={{ marginTop: '10px', height: '12px' }}>
                  <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  <span>{percentage}% del objetivo</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> 18 días restantes
                  </span>
                </div>
              </div>

              {showSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 10px', background: '#D1FAE5', borderRadius: '12px', color: '#065F46' }}>
                  <CheckCircle2 size={40} style={{ margin: '0 auto 8px' }} />
                  <h4 style={{ fontSize: '1.1rem' }}>¡Aporte Realizado!</h4>
                  <p style={{ fontSize: '0.85rem' }}>Muchas gracias por impulsar el arte independiente.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitContribution}>
                  <div className="form-group">
                    <label>INGRESAR MONTO A APORTAR (S/)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Ej. 50"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                    <Heart size={18} />
                    {isSubmitting ? 'Procesando...' : 'Apoyar este Proyecto'}
                  </button>
                </form>
              )}

              {/* Lista de Recompensas (Tiers) */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="var(--color-primary)" />
                  Recompensas Disponibles (Tiers)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {project.reward_tiers && project.reward_tiers.length > 0 ? (
                    project.reward_tiers.map((tier) => (
                      <div
                        key={tier.id}
                        style={{
                          background: selectedTier?.id === tier.id ? '#FFF5F2' : '#FFFFFF',
                          border: selectedTier?.id === tier.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          borderRadius: '12px',
                          padding: '12px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSelectTier(tier)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.875rem' }}>
                          <span>{tier.title}</span>
                          <span style={{ color: 'var(--color-primary)' }}>S/ {tier.minimum_amount}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {tier.description}
                        </p>
                        <button
                          type="button"
                          className="btn-outlined"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '8px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectTier(tier)
                          }}
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Mecenazgo libre disponible a partir de S/ 10.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
