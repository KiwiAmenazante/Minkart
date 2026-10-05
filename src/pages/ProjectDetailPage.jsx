import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Sparkles, CheckCircle2, AlertTriangle, Heart, Award, Clock,
  ArrowLeft, Lock, LogIn, Edit3, ShieldCheck, PlusCircle, MessageSquarePlus, Image as ImageIcon, Send, Trophy, Crown, Medal, User, FileText, ExternalLink, ChevronLeft, ChevronRight, UploadCloud, Loader2
} from 'lucide-react'
import { getProjectById, getProjectUpdates, createProjectUpdate, getProjectTopDonors, uploadUpdateMedia } from '../services/minkaService'
import { PaymentGatewayModal } from '../components/PaymentGatewayModal'
import { UserAvatar } from '../components/UserAvatar'

const CATEGORY_IMAGES = {
  cine: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
  cómic: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1200&auto=format&fit=crop&q=80',
  teatro: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200&auto=format&fit=crop&q=80',
  webseries: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&auto=format&fit=crop&q=80',
  animación: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
}

export const ProjectDetailPage = ({ currentUser, onOpenAuth, onContribute }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [updates, setUpdates] = useState([])
  const [projectDonors, setProjectDonors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('audit')
  const [selectedTier, setSelectedTier] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Estado para el carrusel de imágenes
  const [activeImgIndex, setActiveImgIndex] = useState(0)

  // Estado para crear avance (solo creador)
  const [showNewUpdateForm, setShowNewUpdateForm] = useState(false)
  const [newUpdateTitle, setNewUpdateTitle] = useState('')
  const [newUpdateContent, setNewUpdateContent] = useState('')
  const [newUpdateMedia, setNewUpdateMedia] = useState('')
  const [isUploadingUpdateMedia, setIsUploadingUpdateMedia] = useState(false)
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)

  const handleUpdateMediaFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingUpdateMedia(true)
    const res = await uploadUpdateMedia(file)
    setIsUploadingUpdateMedia(false)
    if (res.success && res.url) {
      setNewUpdateMedia(res.url)
    } else {
      alert(res.error || 'Error al subir foto de avance.')
    }
  }

  const loadProjectData = async () => {
    setIsLoading(true)
    const [projRes, updatesRes, donorsRes] = await Promise.all([
      getProjectById(id),
      getProjectUpdates(id),
      getProjectTopDonors(id)
    ])
    setProject(projRes.data)
    setUpdates(updatesRes.data || [])
    setProjectDonors(donorsRes.data || [])
    setIsLoading(false)
  }

  useEffect(() => { loadProjectData() }, [id])

  if (isLoading) {
    return (
      <main className="app-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Cargando proyecto cultural...</p>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="app-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Proyecto no encontrado</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>El proyecto con ID "{id}" no existe o fue retirado.</p>
        <button className="btn-primary mt-3" onClick={() => navigate('/')}>Volver a la Cartelera</button>
      </main>
    )
  }

  const percentage = Math.min(Math.round((project.current_amount / project.funding_goal) * 100), 100)
  const isOwner = currentUser && (currentUser.id === project.creator_id || currentUser.id === project.creator?.id)
  const canDonate = currentUser && !isOwner
  const bannerImg = project.image_url || CATEGORY_IMAGES[project.category?.toLowerCase()] || CATEGORY_IMAGES.cine

  const handleSelectTier = (tier) => {
    setSelectedTier(tier)
    setCustomAmount(String(tier.minimum_amount))
  }

  const handleOpenPayment = (e) => {
    e.preventDefault()
    if (!currentUser) { onOpenAuth(); return }
    if (isOwner) return
    const amt = parseFloat(customAmount)
    if (!amt || amt <= 0) { alert('Ingresa un monto válido para aportar.'); return }
    setIsPaymentModalOpen(true)
  }

  const handleConfirmPayment = async () => {
    const res = await onContribute({
      projectId: project.id,
      amount: parseFloat(customAmount),
      rewardTierId: selectedTier?.id
    })
    if (res?.success) {
      setProject(prev => ({ ...prev, current_amount: prev.current_amount + parseFloat(customAmount) }))
      // Recargar lista de mecenas del proyecto
      const donorsRes = await getProjectTopDonors(project.id)
      setProjectDonors(donorsRes.data || [])
    }
    return res
  }

  const handleCreateUpdate = async (e) => {
    e.preventDefault()
    if (!newUpdateTitle.trim() || !newUpdateContent.trim()) {
      alert('Por favor completa el título y el contenido del avance.')
      return
    }
    setIsSubmittingUpdate(true)
    const res = await createProjectUpdate({
      projectId: project.id,
      title: newUpdateTitle.trim(),
      content: newUpdateContent.trim(),
      mediaUrl: newUpdateMedia.trim() || null
    })
    setIsSubmittingUpdate(false)
    if (res?.success) {
      setUpdates(prev => [res.data, ...prev])
      setNewUpdateTitle('')
      setNewUpdateContent('')
      setNewUpdateMedia('')
      setShowNewUpdateForm(false)
    }
  }

  const galleryList = Array.isArray(project.gallery_images) ? project.gallery_images : []
  const allImages = Array.from(new Set([bannerImg, ...galleryList])).filter(Boolean)
  const currentHeroImg = allImages[activeImgIndex] || bannerImg

  const handlePrevImg = (e) => {
    e.stopPropagation()
    setActiveImgIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }
  const handleNextImg = (e) => {
    e.stopPropagation()
    setActiveImgIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <main className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        {/* Botón editar visible solo para el creador */}
        {isOwner && (
          <button className="btn-primary" onClick={() => navigate(`/editar-proyecto/${project.id}`)} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <Edit3 size={16} /> Editar este Proyecto
          </button>
        )}
      </div>

      {/* Hero Banner con Carrusel de Imágenes */}
      <div className="modal-hero" style={{ borderRadius: '20px', overflow: 'hidden', height: '340px', position: 'relative' }}>
        <img src={currentHeroImg} alt={project.title} className="modal-hero-img" style={{ transition: 'all 0.3s ease' }} />
        
        {/* Flechas de navegación del Carrusel */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImg}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={handleNextImg}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="modal-hero-overlay">
          <div>
            <span className="category-tag" style={{ position: 'static', marginBottom: '8px', display: 'inline-block' }}>{project.category}</span>
            <h1 className="modal-hero-title" style={{ fontSize: '2.2rem' }}>{project.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <UserAvatar name={project.creator?.full_name} avatarUrl={project.creator?.avatar_url} size={28} fontSize="0.75rem" />
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: 0 }}>Por {project.creator?.full_name || 'Creador Mink@rt'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Miniaturas de la Galería si hay más de 1 imagen */}
      {allImages.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImgIndex(idx)}
              style={{
                border: activeImgIndex === idx ? '3px solid var(--color-primary)' : '2px solid transparent',
                borderRadius: '10px',
                overflow: 'hidden',
                width: '80px',
                height: '55px',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
                opacity: activeImgIndex === idx ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      <div className="modal-grid" style={{ padding: '32px 0 0' }}>
        {/* Columna Izquierda */}
        <div>
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>Auditoría IA</button>
            <button className={`tab-btn ${activeTab === 'sinopsis' ? 'active' : ''}`} onClick={() => setActiveTab('sinopsis')}>Sinopsis</button>
            <button className={`tab-btn ${activeTab === 'avances' ? 'active' : ''}`} onClick={() => setActiveTab('avances')}>
              Avances ({updates.length})
            </button>
            <button className={`tab-btn ${activeTab === 'mecenas' ? 'active' : ''}`} onClick={() => setActiveTab('mecenas')}>
              Mecenas ({projectDonors.length})
            </button>
          </div>

          {activeTab === 'audit' && (
            <div className="ai-audit-panel">
              <div className="ai-audit-header">
                <h4 className="ai-audit-title">
                  <Sparkles color="var(--color-primary)" size={20} />
                  Informe MinkaGuard AI
                </h4>
                <span className="risk-score-badge high" style={{ position: 'static' }}>
                  Score: {project.risk_score}%
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.6 }}>
                {project.ai_analysis_report?.summary || 'Evaluación realizada sobre guion, presupuesto, cronograma e historial de avances.'}
              </p>

              {/* Documentos de respaldo adjuntos */}
              {Array.isArray(project.documents) && project.documents.length > 0 && (
                <div style={{ marginBottom: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#0EA5E9" /> DOCUMENTOS ADJUNTOS VERIFICADOS ({project.documents.length}):
                  </strong>
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {project.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#FFFFFF',
                          border: '1px solid #94A3B8',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#0F172A',
                          textDecoration: 'none'
                        }}
                      >
                        <FileText size={14} color="#0EA5E9" />
                        {doc.name || `Documento #${i + 1}`}
                        <ExternalLink size={12} color="#64748B" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5DEC9' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>DESGLOSE AUDITABLE:</strong>
                <ul className="ai-bullet-list" style={{ marginTop: '10px' }}>
                  {(project.ai_analysis_report?.strengths || []).map((s, i) => (
                    <li key={i}><CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} /><span>{s}</span></li>
                  ))}
                  {(project.ai_analysis_report?.warnings || []).map((w, i) => (
                    <li key={i}><AlertTriangle size={15} color="#F4A22B" style={{ flexShrink: 0, marginTop: '2px' }} /><span>{w}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'sinopsis' && (
            <div style={{ lineHeight: 1.7, color: 'var(--color-neutral)', fontSize: '0.95rem' }}>
              <h3 style={{ marginBottom: '12px' }}>Sobre la Obra Cultural</h3>
              <p>{project.synopsis || 'Esta producción busca revalorizar la cultura e historias peruanas mediante narrativas independientes.'}</p>
            </div>
          )}

          {activeTab === 'avances' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Bitácora de Producción</h3>
                {isOwner && (
                  <button
                    className="btn-primary"
                    onClick={() => setShowNewUpdateForm(!showNewUpdateForm)}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    <PlusCircle size={15} />
                    {showNewUpdateForm ? 'Cancelar' : 'Publicar Avance'}
                  </button>
                )}
              </div>

              {/* Formulario para publicar avance (solo creador) */}
              {isOwner && showNewUpdateForm && (
                <form
                  onSubmit={handleCreateUpdate}
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid var(--color-primary)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                    <MessageSquarePlus size={18} /> Nuevo Hito / Avance del Proyecto
                  </h4>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>TÍTULO DEL AVANCE *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. ¡Finalizamos el rodaje de la escena 4!"
                      value={newUpdateTitle}
                      onChange={(e) => setNewUpdateTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>DETALLE O NOTICIA PARA LOS MECENAS *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Comparte los logros, avances con el equipo, agradecimientos..."
                      value={newUpdateContent}
                      onChange={(e) => setNewUpdateContent(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>URL DE FOTO O MEDIA (OPCIONAL)</label>
                    <input
                      type="url"
                      placeholder="https://... (enlace a foto o captura)"
                      value={newUpdateMedia}
                      onChange={(e) => setNewUpdateMedia(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={isSubmittingUpdate} style={{ padding: '10px' }}>
                    <Send size={16} /> {isSubmittingUpdate ? 'Publicando...' : 'Publicar Avance para los Mecenas'}
                  </button>
                </form>
              )}

              {/* Lista dinámica de avances */}
              {updates.length === 0 ? (
                <div style={{ background: '#FAF8F5', borderRadius: '14px', padding: '24px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Aún no se han publicado avances en esta producción.
                  </p>
                  {isOwner && (
                    <button className="btn-secondary mt-3" onClick={() => setShowNewUpdateForm(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      Sé el primero en compartir un avance
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {updates.map((update, idx) => (
                    <div
                      key={update.id || idx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: 'var(--shadow-soft)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-neutral)', margin: 0 }}>
                          {update.title}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                          {new Date(update.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {update.content}
                      </p>
                      {update.media_url && (
                        <div style={{ marginTop: '14px', borderRadius: '10px', overflow: 'hidden', maxHeight: '300px' }}>
                          <img
                            src={update.media_url}
                            alt={update.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mecenas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={20} color="var(--color-primary)" />
                  Ranking de Mecenas de este Proyecto
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{projectDonors.length} Mecenas</span>
              </div>

              {projectDonors.length === 0 ? (
                <div style={{ background: '#FAF8F5', borderRadius: '14px', padding: '32px 20px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                  <Heart size={36} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
                  <h4>Aún no hay mecenas en este proyecto</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                    ¡Sé el primer mecenas en apoyar esta obra y encabeza el podio de honor!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projectDonors.map((donor, idx) => {
                    const isFirst = idx === 0
                    const isSecond = idx === 1
                    const isThird = idx === 2
                    return (
                      <div
                        key={donor.user_id || idx}
                        style={{
                          background: isFirst ? '#FFFBEB' : '#FFFFFF',
                          border: isFirst ? '2px solid #FCD34D' : '1px solid var(--color-border)',
                          borderRadius: '14px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          boxShadow: isFirst ? '0 4px 12px rgba(245, 158, 11, 0.1)' : 'var(--shadow-soft)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isFirst ? '#FEF3C7' : isSecond ? '#F1F5F9' : isThird ? '#FFEDD5' : '#F5EBE6',
                            color: isFirst ? '#B45309' : isSecond ? '#475569' : isThird ? '#C2410C' : 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}>
                            {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${idx + 1}`}
                          </span>

                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--color-border)' }}>
                            {donor.profile?.avatar_url ? (
                              <img src={donor.profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: '#F5EBE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={18} color="var(--color-primary)" />
                              </div>
                            )}
                          </div>

                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--color-neutral)', display: 'block' }}>
                              {donor.profile?.full_name || 'Mecenas Anónimo'}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Tier: <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{donor.last_tier}</span>
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--color-primary)', fontWeight: '800', display: 'block' }}>
                            S/ {donor.total_donated?.toLocaleString()}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            {donor.contributions_count} {donor.contributions_count === 1 ? 'aporte' : 'aportes'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Panel de Aportes */}
        <div>
          <div style={{ background: '#F9F6F0', borderRadius: '20px', padding: '24px', border: '1px solid var(--color-border)' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-neutral)' }}>S/ {project.current_amount.toLocaleString()}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'block' }}>recaudados de S/ {project.funding_goal.toLocaleString()}</span>
              <div className="progress-bar-bg" style={{ marginTop: '12px', height: '12px' }}>
                <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span>{percentage}% del objetivo</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Campaña Activa</span>
              </div>
            </div>

            {/* Creador viendo su propio proyecto */}
            {isOwner ? (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                <ShieldCheck size={28} color="#2563EB" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '0.95rem', color: '#1E40AF' }}>Este es tu Proyecto</h4>
                <p style={{ fontSize: '0.8rem', color: '#3B82F6', margin: '6px 0 14px' }}>No puedes realizar donaciones a tu propia campaña.</p>
                <button className="btn-secondary w-full" onClick={() => navigate(`/editar-proyecto/${project.id}`)}>
                  <Edit3 size={16} /> Editar Campaña & Tiers
                </button>
              </div>
            ) : !currentUser ? (
              <div style={{ background: '#FFF5F2', border: '1px solid var(--color-primary)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                <Lock size={28} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '0.95rem', color: 'var(--color-secondary)' }}>Inicia sesión para donar</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '6px 0 14px' }}>Para realizar un aporte debes tener una cuenta de mecenas.</p>
                <button className="btn-primary w-full" onClick={onOpenAuth}><LogIn size={16} /> Iniciar Sesión</button>
              </div>
            ) : (
              <form onSubmit={handleOpenPayment}>
                <div className="form-group">
                  <label>MONTO A APORTAR (S/)</label>
                  <input type="number" required min="1" placeholder="Ej. 50" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
                </div>
                {selectedTier && (
                  <div style={{ background: '#FFF5F2', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '12px', fontWeight: '700' }}>
                    Tier seleccionado: {selectedTier.title}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full">
                  <Heart size={18} /> Apoyar este Proyecto
                </button>
              </form>
            )}

            {/* Reward Tiers */}
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="var(--color-primary)" />
                Niveles de Recompensa
              </h4>

              {project.reward_tiers && project.reward_tiers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {project.reward_tiers.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => canDonate && handleSelectTier(tier)}
                      style={{
                        background: selectedTier?.id === tier.id ? '#FFF5F2' : '#FFFFFF',
                        border: selectedTier?.id === tier.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: '12px', padding: '12px',
                        cursor: canDonate ? 'pointer' : 'default',
                        opacity: isOwner ? 0.85 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.875rem' }}>
                        <span>{tier.title}</span>
                        <span style={{ color: 'var(--color-primary)' }}>S/ {tier.minimum_amount}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{tier.description}</p>
                      {canDonate && (
                        <button
                          type="button"
                          className="btn-outlined"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '8px' }}
                          onClick={(e) => { e.stopPropagation(); handleSelectTier(tier) }}
                        >
                          Seleccionar Tier
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Mecenazgo libre a partir de S/ 10. No se configuraron tiers para esta campaña.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isPaymentModalOpen && (
        <PaymentGatewayModal
          project={project}
          rewardTier={selectedTier}
          amount={customAmount}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </main>
  )
}
