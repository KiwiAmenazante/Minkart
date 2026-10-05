import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Sparkles, UploadCloud, CheckCircle, Loader2, ShieldCheck, ArrowLeft, Plus, Trash2, Award,
  Image as ImageIcon, Wand2, Check, FileImage, FileText, RefreshCw, X
} from 'lucide-react'
import { analyzeProjectWithGemini, recommendTiersWithGemini, isGeminiConfigured } from '../services/geminiService'
import { getProjectById, updateProject, getProjectUpdates, uploadProjectBanner, uploadProjectDocument } from '../services/minkaService'

export const EditProjectPage = ({ currentUser, onRefresh }) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ title: '', category: 'Cine', funding_goal: '', synopsis: '', image_url: '' })
  const [rewardTiers, setRewardTiers] = useState([])
  const [existingUpdates, setExistingUpdates] = useState([])
  const [existingDocs, setExistingDocs] = useState([]) // Array de objetos { name, url, size, type }
  const [isUploadingDocs, setIsUploadingDocs] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Imagen
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageFileName, setImageFileName] = useState('')

  // Re-evaluación IA
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalyzed, setAiAnalyzed] = useState(false)
  const [assignedRiskScore, setAssignedRiskScore] = useState(null)
  const [aiReport, setAiReport] = useState(null)

  // Recomendación de Tiers con IA
  const [isRecommendingTiers, setIsRecommendingTiers] = useState(false)
  const [suggestedTiers, setSuggestedTiers] = useState(null)
  const [tierSuccessMsg, setTierSuccessMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [projRes, updatesRes] = await Promise.all([
        getProjectById(id),
        getProjectUpdates(id)
      ])
      const data = projRes.data
      if (!data) { navigate('/'); return }
      if (currentUser && data.creator_id !== currentUser.id && data.creator?.id !== currentUser.id) {
        navigate(`/proyecto/${id}`)
        return
      }
      setFormData({
        title: data.title || '',
        category: data.category || 'Cine',
        funding_goal: data.funding_goal || '',
        synopsis: data.synopsis || '',
        image_url: data.image_url || ''
      })
      setRewardTiers(data.reward_tiers?.map(t => ({ ...t })) || [])
      setExistingUpdates(updatesRes.data || [])
      setExistingDocs(Array.isArray(data.documents) ? data.documents : [])
      setAssignedRiskScore(data.risk_score || null)
      setAiReport(data.ai_analysis_report || null)
      setIsLoading(false)
    }
    load()
  }, [id, currentUser])

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleTierChange = (index, field, value) => {
    const updated = [...rewardTiers]
    updated[index][field] = value
    setRewardTiers(updated)
  }
  const handleAddTier = () => setRewardTiers(t => [...t, { title: '', minimum_amount: '50', description: '' }])
  const handleRemoveTier = (i) => setRewardTiers(t => t.filter((_, idx) => idx !== i))

  // Subida de imagen
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFileName(file.name)
    setIsUploadingImage(true)
    const res = await uploadProjectBanner(file)
    setIsUploadingImage(false)
    if (res.success && res.url) {
      setFormData(prev => ({ ...prev, image_url: res.url }))
    } else {
      alert(res.error || 'Error al procesar la imagen.')
    }
  }

  // Carga de nuevos documentos para reevaluación
  const handleNewDocsChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setIsUploadingDocs(true)
    const newDocs = []
    for (const file of files) {
      const res = await uploadProjectDocument(file)
      if (res.success) {
        newDocs.push({
          name: res.name || file.name,
          url: res.url,
          size: res.size,
          type: res.type
        })
      }
    }
    setIsUploadingDocs(false)
    if (newDocs.length > 0) {
      setExistingDocs(prev => [...prev, ...newDocs])
    }
  }

  const handleRemoveDoc = (index) => {
    setExistingDocs(prev => prev.filter((_, i) => i !== index))
  }

  // Recomendación de Tiers con IA
  const handleRecommendTiers = async () => {
    if (!formData.title || !formData.funding_goal) {
      alert('Ingresa el Título y Meta de recaudación para sugerir los mejores tiers.')
      return
    }
    setIsRecommendingTiers(true)
    const res = await recommendTiersWithGemini({
      title: formData.title,
      category: formData.category,
      funding_goal: formData.funding_goal,
      synopsis: formData.synopsis,
      documents: existingDocs,
      updates: existingUpdates
    })
    setIsRecommendingTiers(false)
    if (res.tiers && res.tiers.length > 0) {
      setSuggestedTiers(res.tiers)
    }
  }

  const handleApplySuggestedTiers = () => {
    if (!suggestedTiers) return
    setRewardTiers(suggestedTiers.map(t => ({
      title: t.title,
      minimum_amount: String(t.minimum_amount),
      description: t.description
    })))
    setSuggestedTiers(null)
    setTierSuccessMsg('¡Tiers sugeridos aplicados con éxito!')
    setTimeout(() => setTierSuccessMsg(''), 3500)
  }

  // Re-evaluación IA tomando en cuenta los nuevos documentos y los avances de producción
  const handleReanalyze = async () => {
    setIsAnalyzing(true)
    const result = await analyzeProjectWithGemini({
      title: formData.title,
      category: formData.category,
      funding_goal: formData.funding_goal,
      synopsis: formData.synopsis,
      documents: existingDocs,
      updates: existingUpdates
    })
    setAssignedRiskScore(result.risk_score)
    setAiReport(result.ai_analysis_report)
    setIsAnalyzing(false)
    setAiAnalyzed(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    await updateProject(id, {
      ...formData,
      funding_goal: parseFloat(formData.funding_goal),
      documents: existingDocs,
      ...(assignedRiskScore !== null && { risk_score: assignedRiskScore }),
      ...(aiReport && { ai_analysis_report: aiReport })
    }, rewardTiers)
    setIsSaving(false)
    setSaveSuccess(true)
    if (onRefresh) onRefresh()
    setTimeout(() => { setSaveSuccess(false); navigate(`/proyecto/${id}`) }, 1500)
  }

  if (isLoading) return (
    <main className="app-container" style={{ textAlign: 'center', padding: '80px' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>Cargando datos del proyecto...</p>
    </main>
  )

  return (
    <main className="app-container" style={{ maxWidth: '800px' }}>
      <button className="btn-secondary" onClick={() => navigate(`/proyecto/${id}`)} style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Volver al Proyecto
      </button>

      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="var(--color-primary)" size={26} />
          Editar Campaña Cultural
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
          Actualiza los datos, tiers de recompensa o re-evalúa la viabilidad considerando tus avances de producción.
        </p>

        {saveSuccess && (
          <div style={{ background: '#D1FAE5', borderRadius: '12px', padding: '12px 16px', color: '#065F46', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Proyecto actualizado correctamente.
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Información General */}
          <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '14px' }}>Información General</h3>

          <div className="form-group">
            <label>TÍTULO DE LA OBRA *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>CATEGORÍA</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {['Cine', 'Teatro', 'Cómic', 'Webseries', 'Animación'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>META DE RECAUDACIÓN (S/)</label>
              <input type="number" name="funding_goal" required value={formData.funding_goal} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>SINOPSIS / PROPUESTA TEMÁTICA</label>
            <textarea name="synopsis" rows={3} value={formData.synopsis} onChange={handleChange} />
          </div>

          {/* Imagen del Banner con Subida Directa */}
          <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '24px 0' }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="var(--color-primary)" /> Imagen de Portada / Banner
          </h3>

          <label className="drag-drop-zone" style={{ display: 'block', marginBottom: '16px', cursor: 'pointer', textAlign: 'center' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFileChange} />
            {isUploadingImage ? (
              <div style={{ padding: '10px' }}>
                <Loader2 className="spinner-icon" size={32} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontWeight: '700' }}>Actualizando imagen...</p>
              </div>
            ) : (
              <div>
                <FileImage className="drag-drop-icon" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-neutral)' }}>
                  {imageFileName ? `Nueva imagen seleccionada: ${imageFileName}` : 'Haz clic o arrastra para cambiar la imagen de portada'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Formatos permitidos: JPG, PNG, WEBP (Se guardará directamente en Supabase Storage o local)
                </p>
              </div>
            )}
          </label>

          {formData.image_url && (
            <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', height: '180px', border: '1px solid var(--color-border)' }}>
              <img
                src={formData.image_url}
                alt="Vista previa del banner"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          )}

          {/* Reward Tiers */}
          <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '24px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Award size={18} color="var(--color-primary)" /> Niveles de Recompensa
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-outlined"
                onClick={handleRecommendTiers}
                disabled={isRecommendingTiers}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                {isRecommendingTiers ? <Loader2 className="spinner-icon" size={14} /> : <Wand2 size={14} />}
                {isRecommendingTiers ? 'Diseñando tiers...' : 'Sugerir con IA'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleAddTier} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Añadir Tier
              </button>
            </div>
          </div>

          {tierSuccessMsg && (
            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> {tierSuccessMsg}
            </div>
          )}

          {/* Sugerencias de Tiers con IA */}
          {suggestedTiers && (
            <div style={{
              background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF3EC 100%)',
              border: '2px solid var(--color-primary)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles size={18} />
                  Recomendación MinkaGuard AI para "{formData.title || 'tu obra'}"
                </h4>
                <button
                  type="button"
                  onClick={() => setSuggestedTiers(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Descartar
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral)', marginBottom: '14px' }}>
                MinkaGuard AI calculó estos 3 niveles basados en la sinopsis y temática de tu proyecto para la categoría <strong>{formData.category}</strong>:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {suggestedTiers.map((st, sidx) => (
                  <div key={sidx} style={{ background: '#FFFFFF', borderRadius: '10px', padding: '12px', border: '1px solid #FED7AA' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.85rem' }}>
                      <span>{st.title}</span>
                      <span style={{ color: 'var(--color-primary)' }}>S/ {st.minimum_amount}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{st.description}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleApplySuggestedTiers}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%' }}
                >
                  <Check size={16} /> Aceptar y Aplicar estos Tiers
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSuggestedTiers(null)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {rewardTiers.map((tier, index) => (
              <div key={index} style={{ background: '#F9F6F0', borderRadius: '14px', padding: '16px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-primary)' }}>Nivel #{index + 1}</span>
                  {rewardTiers.length > 1 && (
                    <button type="button" onClick={() => handleRemoveTier(index)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label>TÍTULO</label>
                    <input type="text" value={tier.title} onChange={(e) => handleTierChange(index, 'title', e.target.value)} placeholder="Ej. Mecenas Co-creador" />
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label>MONTO MÍN. (S/)</label>
                    <input type="number" value={tier.minimum_amount} onChange={(e) => handleTierChange(index, 'minimum_amount', e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>DESCRIPCIÓN DE BENEFICIOS</label>
                  <input type="text" value={tier.description} onChange={(e) => handleTierChange(index, 'description', e.target.value)} placeholder="Ej. Póster firmado + mención en créditos" />
                </div>
              </div>
            ))}
          </div>

          {/* Re-análisis IA con Nuevos Documentos y Avances */}
          <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '24px 0' }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '14px' }}>
            Re-evaluar Viabilidad con MinkaGuard AI
          </h3>

          <div style={{ background: '#FAF8F5', borderRadius: '14px', padding: '16px', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral)', marginBottom: '8px' }}>
              <strong>Avances registrados en producción:</strong> {existingUpdates.length} hitos publicados.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              MinkaGuard AI evaluará el cumplimiento de tus avances reportados junto a cualquier documento actualizado que adjuntes a continuación.
            </p>
          </div>

          <label className="drag-drop-zone" style={{ display: 'block', marginBottom: '16px', opacity: isUploadingDocs ? 0.7 : 1, cursor: isUploadingDocs ? 'wait' : 'pointer', textAlign: 'center' }}>
            <input type="file" multiple accept=".pdf,.doc,.docx" disabled={isUploadingDocs} style={{ display: 'none' }} onChange={handleNewDocsChange} />
            {isUploadingDocs ? (
              <Loader2 className="spinner-icon" style={{ margin: '0 auto', width: '28px', height: '28px', color: 'var(--color-primary)' }} />
            ) : (
              <UploadCloud className="drag-drop-icon" style={{ margin: '0 auto 8px' }} />
            )}
            <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-neutral)', marginTop: '4px' }}>
              {isUploadingDocs ? 'Subiendo documento a Supabase Storage...' : 'Subir Nuevos Documentos de Respaldo (PDF)'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Nuevas versiones de guion, contratos de locación, cronogramas ajustados o comprobantes
            </p>
          </label>

          {existingDocs.length > 0 && (
            <div style={{ marginBottom: '20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="#166534" />
                Documentos vinculados al proyecto ({existingDocs.length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {existingDocs.map((doc, idx) => (
                  <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #86EFAC', borderRadius: '8px', padding: '6px 10px', fontSize: '0.8rem', fontWeight: '600', color: '#14532D' }}>
                    <FileText size={14} color="#15803D" />
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#15803D', textDecoration: 'underline' }}>
                      {doc.name}
                    </a>
                    <button type="button" onClick={() => handleRemoveDoc(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#EF4444' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignedRiskScore !== null && (
            <div style={{ background: '#FFFBF4', border: '1px solid var(--color-tertiary)', borderRadius: '12px', padding: '14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral)' }}>
                <strong>Evaluación actual:</strong> {aiReport?.summary || 'Análisis previo disponible'}
              </span>
              <span className="risk-score-badge high" style={{ position: 'static' }}>
                <ShieldCheck size={14} /> {assignedRiskScore}%
              </span>
            </div>
          )}

          <button
            type="button"
            className="btn-outlined w-full"
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            style={{ marginBottom: '24px', padding: '12px' }}
          >
            {isAnalyzing ? <Loader2 className="spinner-icon" size={18} /> : <RefreshCw size={18} />}
            {isAnalyzing ? 'Auditando avances y nuevos documentos...' : 'Re-evaluar Viabilidad (Avances + Documentos)'}
          </button>

          {aiAnalyzed && (
            <div style={{ background: '#D1FAE5', borderRadius: '12px', padding: '12px 16px', color: '#065F46', marginBottom: '20px', fontSize: '0.875rem' }}>
              <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Nuevo Risk Score Recalculado: <strong>{assignedRiskScore}%</strong> — {aiReport?.summary}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={isSaving} style={{ padding: '14px', fontSize: '1rem' }}>
            <CheckCircle size={20} />
            {isSaving ? 'Guardando cambios...' : 'Guardar Cambios del Proyecto'}
          </button>
        </form>
      </div>
    </main>
  )
}
