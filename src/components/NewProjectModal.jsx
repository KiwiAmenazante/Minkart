import React, { useState } from 'react'
import { X, Sparkles, UploadCloud, CheckCircle, Loader2, ShieldCheck, Cpu } from 'lucide-react'
import { analyzeProjectWithGemini, isGeminiConfigured } from '../services/geminiService'

export const NewProjectModal = ({ onClose, onCreateProject, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cine',
    funding_goal: '',
    synopsis: '',
    creator_name: currentUser?.user_metadata?.full_name || 'Creador Independiente',
    reward_title: 'Mecenas Co-Creador',
    reward_amount: '50',
    reward_desc: 'Mención especial en créditos finales + Póster impreso en alta definición.'
  })

  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalyzed, setAiAnalyzed] = useState(false)
  const [isRealAiResult, setIsRealAiResult] = useState(false)
  const [assignedRiskScore, setAssignedRiskScore] = useState(88)
  const [aiReport, setAiReport] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSimulatedFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(files.map((f) => f.name))
    } else {
      setUploadedFiles(['Guion_Principal_Minkart.pdf', 'Presupuesto_Desglosado.pdf'])
    }
  }

  // Lógica de Análisis IA según la especificación Pantalla 4 de minka.md
  const handleAIAnalysis = async () => {
    if (!formData.title || !formData.funding_goal) {
      alert('Por favor completa primero el Título y la Meta de Recaudación.')
      return
    }

    setIsAnalyzing(true)

    // TODO: Insertar aquí la llamada a la API de Gemini usando la API Key del usuario. Pasar los PDFs a texto y solicitar el JSON con el Risk Score.
    const result = await analyzeProjectWithGemini({
      title: formData.title,
      category: formData.category,
      funding_goal: formData.funding_goal,
      synopsis: formData.synopsis,
      fileNames: uploadedFiles
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
    await onCreateProject({
      ...formData,
      risk_score: assignedRiskScore,
      ai_analysis_report: aiReport
    })
    setIsPublishing(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card sm" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid var(--color-border)', background: 'linear-gradient(180deg, #FFF8F5 0%, #FFFFFF 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-neutral)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles color="var(--color-primary)" size={24} />
              Publica tu Proyecto y Valídalo con IA
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            MinkaGuard AI (Google Gemini 2.5 Flash) auditará tus documentos para generar un Risk Score transparente.
          </p>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: '700', color: isGeminiConfigured ? '#10B981' : '#F4A22B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={14} />
            {isGeminiConfigured ? 'Google Gemini API Conectada' : 'Modo Simulado (Añade VITE_GEMINI_API_KEY en .env.local)'}
          </div>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Paso 1: Datos Básicos */}
          <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-secondary)' }}>
            Paso 1: Información General del Proyecto
          </h4>

          <div className="form-group">
            <label>TÍTULO DEL PROYECTO CULTURAL *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="Ej. El Resplandor de la Montaña"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>CATEGORÍA *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Cine">Cine</option>
                <option value="Teatro">Teatro</option>
                <option value="Cómic">Cómic</option>
                <option value="Webseries">Webseries</option>
                <option value="Animación">Animación</option>
              </select>
            </div>

            <div className="form-group">
              <label>META DE RECAUDACIÓN (S/) *</label>
              <input
                type="number"
                name="funding_goal"
                required
                placeholder="Ej. 12000"
                value={formData.funding_goal}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>SINOPSIS RESUMIDA</label>
            <textarea
              name="synopsis"
              rows={2}
              placeholder="Breve descripción argumental del proyecto..."
              value={formData.synopsis}
              onChange={handleChange}
            />
          </div>

          {/* Paso 2: Subida de Archivos para la IA */}
          <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '20px 0' }} />

          <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-secondary)' }}>
            Paso 2: Evaluación con MinkaGuard AI (Google Gemini)
          </h4>

          <label className="drag-drop-zone" style={{ display: 'block' }}>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleSimulatedFileUpload}
            />
            <UploadCloud className="drag-drop-icon" style={{ margin: '0 auto' }} />
            <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-neutral)' }}>
              Sube tu Guion, Presupuesto y Cronograma (PDF) para el análisis de MinkaGuard AI
            </p>
            <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Arrastra tus archivos aquí o haz clic para explorar en tu equipo
            </p>
          </label>

          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} /> Archivos cargados: {uploadedFiles.join(', ')}
            </div>
          )}

          {!aiAnalyzed && (
            <button
              type="button"
              className="btn-primary w-full mt-3"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="spinner-icon" size={18} /> : <Sparkles size={18} />}
              {isAnalyzing ? 'Analizando Proyecto con Gemini AI...' : 'Analizar Viabilidad con IA'}
            </button>
          )}

          {/* Paso 3: Resultados de la IA */}
          {aiAnalyzed && (
            <div style={{ marginTop: '20px', background: '#FFFBF4', border: '2px solid var(--color-tertiary)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '800', color: 'var(--color-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck color="#10B981" size={20} />
                  {isRealAiResult ? 'Resultado Gemini 3.8 AI' : 'Resultado MinkaGuard AI'}
                </span>
                <span className="risk-score-badge high" style={{ position: 'static' }}>
                  Risk Score: {assignedRiskScore}%
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>RISK SCORE ASIGNADO (READONLY)</label>
                <input
                  type="text"
                  readOnly
                  value={`${assignedRiskScore}% - Viabilidad Verificada por IA`}
                  style={{ background: '#EFE9DD', fontWeight: '700', color: 'var(--color-secondary)' }}
                />
              </div>

              {aiReport?.summary && (
                <p style={{ fontSize: '0.825rem', color: 'var(--color-neutral)', marginBottom: '10px', fontStyle: 'italic' }}>
                  "{aiReport.summary}"
                </p>
              )}

              <form onSubmit={handleFinalPublish}>
                <button type="submit" className="btn-primary w-full mt-3" disabled={isPublishing}>
                  <CheckCircle size={18} />
                  {isPublishing ? 'Guardando en Supabase...' : 'Publicar Proyecto Oficialmente'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
