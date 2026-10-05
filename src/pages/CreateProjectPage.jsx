import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, UploadCloud, CheckCircle, Loader2, ShieldCheck, ArrowLeft, Plus, Trash2, Award, Wand2, Check, Image as ImageIcon, FileImage, FileText, X } from 'lucide-react'
import { analyzeProjectWithGemini, recommendTiersWithGemini, isGeminiConfigured } from '../services/geminiService'
import { uploadProjectBanner, uploadProjectDocument, uploadGalleryImage } from '../services/minkaService'
import { Cpu } from 'lucide-react'

export const CreateProjectPage = ({ currentUser, onCreateProject }) => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '', category: 'Cine', funding_goal: '', synopsis: '', image_url: ''
  })
  const [rewardTiers, setRewardTiers] = useState([
    { title: 'Mecenas Simpatizante', minimum_amount: '30', description: 'Mención especial en créditos finales y póster digital HD.' },
    { title: 'Mecenas Co-creador', minimum_amount: '100', description: 'Acceso anticipado al estreno virtual y bitácora de producción.' }
  ])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadedDocs, setUploadedDocs] = useState([]) // Array de objetos { name, url, size, type }
  const [galleryImages, setGalleryImages] = useState([]) // Array de URLs de galería
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [isUploadingDocs, setIsUploadingDocs] = useState(false)
  const [imageFileName, setImageFileName] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalyzed, setAiAnalyzed] = useState(false)
  const [isRealAiResult, setIsRealAiResult] = useState(false)
  const [assignedRiskScore, setAssignedRiskScore] = useState(88)
  const [aiReport, setAiReport] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)

  // Estado para recomendación de Tiers con IA
  const [isRecommendingTiers, setIsRecommendingTiers] = useState(false)
  const [suggestedTiers, setSuggestedTiers] = useState(null)
  const [tierSuccessMsg, setTierSuccessMsg] = useState('')

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleTierChange = (i, field, val) => {
    const updated = [...rewardTiers]; updated[i][field] = val; setRewardTiers(updated)
  }
  const handleAddTier = () => setRewardTiers(t => [...t, { title: '', minimum_amount: '50', description: '' }])
  const handleRemoveTier = (i) => setRewardTiers(t => t.filter((_, idx) => idx !== i))

  // Manejo de subida directa de archivo de imagen principal (Banner)
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

  // Manejo de subida de fotos adicionales para la Galería / Carrusel
  const handleGalleryFilesChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setIsUploadingGallery(true)
    const newUrls = []
    for (const file of files) {
      const res = await uploadGalleryImage(file)
      if (res.success && res.url) {
        newUrls.push(res.url)
      }
    }
    setIsUploadingGallery(false)
    if (newUrls.length > 0) {
      setGalleryImages(prev => [...prev, ...newUrls])
    }
  }

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  // Manejo de subida directa de archivos de documentos (PDF, DOC)
  const handleDocumentFilesChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setIsUploadingDocs(true)
    const newDocs = []
    const newNames = []
    for (const file of files) {
      const res = await uploadProjectDocument(file)
      if (res.success) {
        const docObj = {
          name: res.name || file.name,
          url: res.url,
          size: res.size,
          type: res.type
        }
        newDocs.push(docObj)
        newNames.push(docObj.name)
      }
    }
    setIsUploadingDocs(false)
    if (newDocs.length > 0) {
      setUploadedDocs(prev => [...prev, ...newDocs])
      setUploadedFiles(prev => [...prev, ...newNames])
    }
  }

  const handleRemoveDoc = (index) => {
    setUploadedDocs(prev => prev.filter((_, i) => i !== index))
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // IA recomienda Tiers basada en la sinopsis, temática y documentos
  const handleRecommendTiers = async () => {
    if (!formData.title || !formData.funding_goal) {
      alert('Por favor ingresa primero el Título de la obra y la Meta de recaudación.')
      return
    }
    setIsRecommendingTiers(true)
    const res = await recommendTiersWithGemini({
      title: formData.title,
      category: formData.category,
      funding_goal: formData.funding_goal,
      synopsis: formData.synopsis,
      documents: uploadedDocs,
      fileNames: uploadedFiles
    })
    setIsRecommendingTiers(false)
    if (res.tiers && res.tiers.length > 0) {
      setSuggestedTiers(res.tiers)
    }
  }

  // Aplicar tiers recomendados
  const handleApplySuggestedTiers = () => {
    if (!suggestedTiers) return
    setRewardTiers(suggestedTiers.map(t => ({
      title: t.title,
      minimum_amount: String(t.minimum_amount),
      description: t.description
    })))
    setSuggestedTiers(null)
    setTierSuccessMsg('¡Tiers sugeridos por MinkaGuard AI aplicados con éxito!')
    setTimeout(() => setTierSuccessMsg(''), 4000)
  }

  const handleAIAnalysis = async () => {
    if (!formData.title || !formData.funding_goal) { alert('Completa Título y Meta de Recaudación primero.'); return }
    setIsAnalyzing(true)
    const result = await analyzeProjectWithGemini({
      title: formData.title, category: formData.category,
      funding_goal: formData.funding_goal, synopsis: formData.synopsis,
      fileNames: uploadedFiles,
      documents: uploadedDocs
    })
    setAssignedRiskScore(result.risk_score)
    setAiReport(result.ai_analysis_report)
    setIsRealAiResult(result.isRealAi)
    setIsAnalyzing(false)
    setAiAnalyzed(true)
  }

  const handleFinalPublish = async (e) => {
    e.preventDefault()
    if (!aiAnalyzed) return
    setIsPublishing(true)
    const res = await onCreateProject({
      ...formData,
      reward_tiers: rewardTiers.filter(t => t.title && t.minimum_amount),
      documents: uploadedDocs,
      gallery_images: galleryImages,
      risk_score: assignedRiskScore,
      ai_analysis_report: aiReport
    })
    setIsPublishing(false)
    if (res?.success) navigate(res.data?.id ? `/proyecto/${res.data.id}` : '/')
  }

  return (
    <main className="app-container" style={{ maxWidth: '800px' }}>
      <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Cancelar y Volver
      </button>

      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles color="var(--color-primary)" size={28} />
            Publica tu Proyecto Cultural
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            MinkaGuard AI auditará tu propuesta y generará un Risk Score para los mecenas.
          </p>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: '700', color: isGeminiConfigured ? '#10B981' : '#F4A22B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={14} />
            {isGeminiConfigured ? 'Google Gemini API Conectada' : 'Modo Simulado — añade VITE_GEMINI_API_KEY en .env.local'}
          </div>
        </div>

        {/* Paso 1: Datos Básicos */}
        <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '14px' }}>Paso 1: Información General</h3>

        <div className="form-group">
          <label>TÍTULO DE LA OBRA *</label>
          <input type="text" name="title" required placeholder="Ej. El Resplandor de la Montaña" value={formData.title} onChange={handleChange} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>CATEGORÍA *</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {['Cine', 'Teatro', 'Cómic', 'Webseries', 'Animación'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>META DE RECAUDACIÓN (S/) *</label>
            <input type="number" name="funding_goal" required placeholder="Ej. 12000" value={formData.funding_goal} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>SINOPSIS / PROPUESTA TEMÁTICA</label>
          <textarea name="synopsis" rows={3} placeholder="Argumento de la obra, propósito y uso de los fondos..." value={formData.synopsis} onChange={handleChange} />
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
              <p style={{ fontWeight: '700' }}>Procesando imagen...</p>
            </div>
          ) : (
            <div>
              <FileImage className="drag-drop-icon" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-neutral)' }}>
                {imageFileName ? `Archivo: ${imageFileName}` : 'Selecciona o arrastra una imagen de portada'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Formatos permitidos: JPG, PNG, WEBP (Se guardará directamente en Supabase Storage o local)
              </p>
            </div>
          )}
        </label>

        {formData.image_url && (
          <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', height: '180px', border: '1px solid var(--color-border)' }}>
            <img src={formData.image_url} alt="Vista previa del banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Galería / Carrusel de Imágenes Adicionales */}
        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', marginTop: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ImageIcon size={16} color="var(--color-primary)" /> Imágenes Adicionales para el Carrusel del Proyecto (Bucket project-gallery)
        </h4>
        <label className="drag-drop-zone" style={{ display: 'block', marginBottom: '16px', cursor: isUploadingGallery ? 'wait' : 'pointer', textAlign: 'center', padding: '16px' }}>
          <input type="file" multiple accept="image/*" disabled={isUploadingGallery} style={{ display: 'none' }} onChange={handleGalleryFilesChange} />
          {isUploadingGallery ? (
            <div>
              <Loader2 className="spinner-icon" size={24} style={{ margin: '0 auto 4px' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>Subiendo foto(s) a la galería...</p>
            </div>
          ) : (
            <div>
              <Plus size={24} style={{ margin: '0 auto 4px', color: 'var(--color-primary)' }} />
              <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--color-neutral)' }}>
                Agregar Fotos a la Galería / Carrusel
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Fotos de tras bambalinas, bocetos, maquetas o grabaciones
              </p>
            </div>
          )}
        </label>

        {galleryImages.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {galleryImages.map((imgUrl, i) => (
              <div key={i} style={{ position: 'relative', width: '90px', height: '65px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img src={imgUrl} alt={`Galería ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(i)}
                  style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#FFF', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Paso 2: Reward Tiers */}
        <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '24px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Award size={18} color="var(--color-primary)" /> Niveles de Recompensa (reward_tiers)
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

        {/* Modal / Caja de Sugerencias de Tiers con IA */}
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
              MinkaGuard AI diseñó estos 3 niveles inspirados en la temática de tu propuesta para la categoría <strong>{formData.category}</strong>:
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
                <input type="text" value={tier.description} onChange={(e) => handleTierChange(index, 'description', e.target.value)} placeholder="Ej. Acceso a premier + póster autografiado" />
              </div>
            </div>
          ))}
        </div>

        {/* Paso 3: Subida de Archivos & IA */}
        <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '24px 0' }} />
        <h3 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '14px' }}>
          Paso 3: Subida de Documentos & Auditoría MinkaGuard AI
        </h3>

        <label className="drag-drop-zone" style={{ display: 'block', marginBottom: '16px', opacity: isUploadingDocs ? 0.7 : 1, cursor: isUploadingDocs ? 'wait' : 'pointer' }}>
          <input type="file" multiple accept=".pdf,.doc,.docx" disabled={isUploadingDocs} style={{ display: 'none' }} onChange={handleDocumentFilesChange} />
          {isUploadingDocs ? (
            <Loader2 className="spinner-icon" style={{ margin: '0 auto', width: '32px', height: '32px', color: 'var(--color-primary)' }} />
          ) : (
            <UploadCloud className="drag-drop-icon" style={{ margin: '0 auto' }} />
          )}
          <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-neutral)', marginTop: '8px' }}>
            {isUploadingDocs ? 'Subiendo y persustiendo documentos en Supabase...' : 'Sube tu Guion, Presupuesto o Dossier (PDF/DOC)'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Los documentos se guardarán en Supabase Storage y serán auditados por Gemini AI
          </p>
        </label>

        {uploadedDocs.length > 0 && (
          <div style={{ marginBottom: '20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="#166534" />
              Documentos persistidos ({uploadedDocs.length}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {uploadedDocs.map((doc, idx) => (
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

        {!aiAnalyzed && (
          <button type="button" className="btn-primary w-full" onClick={handleAIAnalysis} disabled={isAnalyzing} style={{ padding: '14px' }}>
            {isAnalyzing ? <Loader2 className="spinner-icon" size={20} /> : <Sparkles size={20} />}
            {isAnalyzing ? 'Analizando con Gemini AI...' : 'Analizar Viabilidad con IA'}
          </button>
        )}

        {aiAnalyzed && (
          <div style={{ marginTop: '24px', background: '#FFFBF4', border: '2px solid var(--color-tertiary)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '800', color: 'var(--color-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck color="#10B981" size={22} />
                {isRealAiResult ? 'Resultado Gemini 3.8 AI' : 'Resultado MinkaGuard AI'}
              </span>
              <span className="risk-score-badge high" style={{ position: 'static' }}>Risk Score: {assignedRiskScore}%</span>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>RISK SCORE ASIGNADO (SOLO LECTURA)</label>
              <input type="text" readOnly value={`${assignedRiskScore}% — Viabilidad Verificada para Mecenas`} style={{ background: '#EFE9DD', fontWeight: '700', color: 'var(--color-secondary)' }} />
            </div>

            {aiReport?.summary && (
              <p style={{ fontSize: '0.875rem', fontStyle: 'italic', background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px' }}>
                "{aiReport.summary}"
              </p>
            )}

            <form onSubmit={handleFinalPublish}>
              <button type="submit" className="btn-primary w-full" disabled={isPublishing} style={{ padding: '14px' }}>
                <CheckCircle size={20} />
                {isPublishing ? 'Publicando en Supabase...' : 'Publicar Proyecto Oficialmente'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
