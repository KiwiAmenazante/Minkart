import { GoogleGenAI } from '@google/genai'

const geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()

export const isGeminiConfigured = Boolean(
  geminiApiKey &&
  !geminiApiKey.includes('tu_api_key')
)

const ai = isGeminiConfigured ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

// Helper to call Gemini and parse JSON from response
async function callGemini(prompt) {
  if (!isGeminiConfigured || !ai) return null
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash-latest']
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
      })
      const text = response?.text || ''
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
      if (match) return JSON.parse(match[0])
    } catch (err) {
      console.warn(`Gemini API error with model ${modelName}:`, err)
    }
  }
  return null
}

// ─── ANÁLISIS Y REEVALUACIÓN DE VIABILIDAD CON AVANCES Y DOCUMENTOS ─────────
export const analyzeProjectWithGemini = async ({
  title,
  category,
  funding_goal,
  synopsis,
  fileNames = [],
  documents = [],
  updates = []
}) => {
  if (!isGeminiConfigured || !ai) {
    return simulateAiAnalysis(title, category, funding_goal, updates)
  }

  // Combinar nombres de archivo de fileNames y del objeto documents
  const allDocNames = [
    ...fileNames,
    ...documents.map(d => typeof d === 'string' ? d : d.name).filter(Boolean)
  ]
  const docListStr = allDocNames.length > 0 ? Array.from(new Set(allDocNames)).join(', ') : 'Ninguno (sin dossier o guion adjunto)'

  const updatesSummary = updates.length > 0
    ? updates.map((u, i) => `Avance #${i + 1}: "${u.title}" - ${u.content}`).join('\n')
    : 'No hay avances de producción previos registrados.'

  const prompt = `
Eres MinkaGuard AI, el sistema experto en auditoría y evaluación de riesgo para proyectos culturales y crowdfunding en el Perú.
Tu labor es auditar la viabilidad integral de la obra, considerando tanto sus documentos adjuntos como el historial de cumplimiento y avances reportados.

DATOS DEL PROYECTO:
- Título: "${title}"
- Categoría: "${category}"
- Meta de Recaudación: S/ ${funding_goal}
- Sinopsis / Propuesta temática: "${synopsis || 'Propuesta artística independiente'}"
- Documentos de Respaldo Cargados y Persistidos: ${docListStr}

HISTORIAL DE AVANCES REPORTADOS EN PRODUCCIÓN:
${updatesSummary}

CRITERIOS DE AUDITORÍA:
1. Si el proyecto cuenta con documentos adjuntos (guiones, dossiers, presupuestos) y avances verificados, la fiabilidad (risk_score) debe ser alta (>85).
2. Resalta explícitamente en las fortalezas ("strengths") la presencia y respaldo de los documentos cargados.
3. "risk_score": un número entero entre 68 y 98 (donde >85 es viabilidad alta verificada).
4. "summary": resumen analítico y profesional (2-3 líneas).
5. "strengths": array con 2 o 3 fortalezas clave.
6. "warnings": array con 1 o 2 recomendaciones de mitigación de riesgo.

Devuelve ÚNICAMENTE un objeto JSON válido sin texto adicional:
{
  "risk_score": 90,
  "summary": "...",
  "strengths": ["...", "..."],
  "warnings": ["..."]
}
`
  const parsed = await callGemini(prompt)
  if (parsed && parsed.risk_score) {
    return {
      success: true,
      isRealAi: true,
      risk_score: parsed.risk_score,
      ai_analysis_report: {
        summary: parsed.summary || 'Análisis completado exitosamente con Google Gemini AI.',
        strengths: parsed.strengths || ['Documentación verificada', 'Avances en cronograma'],
        warnings: parsed.warnings || ['Monitorear costos operativos']
      }
    }
  }
  return simulateAiAnalysis(title, category, funding_goal, updates)
}

// ─── RECOMENDACIÓN DE REWARD TIERS BASADA EN CONTENIDO PERSISTIDO ────────────
export const recommendTiersWithGemini = async ({
  title,
  category,
  funding_goal,
  synopsis,
  fileNames = [],
  documents = [],
  updates = []
}) => {
  if (!isGeminiConfigured || !ai) {
    return simulateTierRecommendation(category, parseFloat(funding_goal), synopsis)
  }

  const allDocNames = [
    ...fileNames,
    ...documents.map(d => typeof d === 'string' ? d : d.name).filter(Boolean)
  ]
  const docSnippet = allDocNames.length > 0 ? `Documentos adjuntos al proyecto: ${Array.from(new Set(allDocNames)).join(', ')}` : ''

  const updatesSnippet = updates.length > 0
    ? `Avances de producción: ${updates.map(u => u.title).join(', ')}`
    : ''

  const prompt = `
Eres MinkaGuard AI, estratega experto en crowdfunding cultural peruano.
Diseña 3 niveles de recompensa (Reward Tiers) altamente atractivos, realistas y personalizados para el siguiente proyecto cultural, inspirándote directamente en su temática, trama o propuesta artística, así como en su documentación cargada.

DATOS DEL PROYECTO:
- Título: "${title}"
- Categoría artística: "${category}"
- Meta de recaudación: S/ ${funding_goal}
- Sinopsis y temática: "${synopsis || 'Obra artística independiente peruana'}"
${docSnippet ? `- ${docSnippet}` : ''}
${updatesSnippet ? `- ${updatesSnippet}` : ''}

DIRECTRICES:
1. Define EXACTAMENTE 3 tiers con títulos originales relacionados estrechamente con la narrativa o temática del proyecto y los documentos aportados (evita nombres genéricos).
2. Los montos deben ser progresivos en Soles peruanos (Tier 1 accesible < S/ 50, Tier 2 intermedio, Tier 3 exclusivo/VIP).
3. Los beneficios deben incluir entregables culturales viables (acceso a copias digitales del guion o dossier, menciones en créditos, productos exclusivos, experiencias con el equipo).

Devuelve ÚNICAMENTE un array JSON válido con los 3 objetos:
[
  {
    "title": "...",
    "minimum_amount": 35,
    "description": "..."
  },
  {
    "title": "...",
    "minimum_amount": 120,
    "description": "..."
  },
  {
    "title": "...",
    "minimum_amount": 400,
    "description": "..."
  }
]
`
  const parsed = await callGemini(prompt)
  if (Array.isArray(parsed) && parsed.length > 0) {
    return { success: true, isRealAi: true, tiers: parsed }
  }
  return simulateTierRecommendation(category, parseFloat(funding_goal), synopsis)
}

function simulateAiAnalysis(title, category, funding_goal, updates = []) {
  const baseScore = updates.length > 0 ? 92 : 86
  const calculated = Math.min(98, baseScore + Math.floor(Math.random() * 6))
  return {
    success: true,
    isRealAi: false,
    risk_score: calculated,
    ai_analysis_report: {
      summary: `[Simulación MinkaGuard AI] Evaluación de "${title}". ${updates.length > 0 ? `Se verificaron ${updates.length} hitos de producción cumplidos.` : 'Propuesta alineada a los estándares culturales.'}`,
      strengths: [
        'Presupuesto y desglose coherente con la disciplina artística',
        updates.length > 0 ? 'Bitácora de avances demuestra ejecución en curso' : 'Equipo con propuesta clara'
      ],
      warnings: ['Asegurar reservas de contingencia para imprevistos en rodaje o montaje']
    }
  }
}

function simulateTierRecommendation(category, goal, synopsis = '') {
  const TIER_TEMPLATES = {
    Cine: [
      { title: 'Cinéfilo de Créditos', minimum_amount: 30, description: 'Tu nombre en los créditos de la película + enlace exclusivo a póster digital en 4K.' },
      { title: 'Coproductor Digital', minimum_amount: 120, description: 'Acceso anticipado al pre-estreno virtual con sesión de preguntas y respuestas con el director.' },
      { title: 'Productor Honorario', minimum_amount: Math.round(goal * 0.04) || 450, description: 'Pase doble VIP a la gala presencial + mención especial en pantalla gigante.' }
    ],
    Teatro: [
      { title: 'Espectador Aliado', minimum_amount: 25, description: 'Programa de mano digital ilustrado + agradecimiento oficial en redes de la obra.' },
      { title: 'Amigo de Primera Fila', minimum_amount: 80, description: 'Entrada preferencial en función de estreno + recorrido exclusivo tras bambalinas.' },
      { title: 'Mecenas de Sala', minimum_amount: Math.round(goal * 0.05) || 350, description: 'Dos entradas VIP + charla privada con el elenco y director al término de la temporada.' }
    ],
    Cómic: [
      { title: 'Lector Digital', minimum_amount: 20, description: 'Copia digital en alta definición de la novela gráfica + paquete de wallpapers para celular y PC.' },
      { title: 'Coleccionista de Edición', minimum_amount: 75, description: 'Tomo físico firmado por los autores + set de stickers y lámina de arte exclusiva.' },
      { title: 'Personaje Inmortalizado', minimum_amount: Math.round(goal * 0.04) || 300, description: 'Los ilustradores te dibujarán como un personaje secundario en una viñeta del cómic.' }
    ],
    default: [
      { title: 'Mecenas Solidario', minimum_amount: 30, description: 'Agradecimiento en créditos oficiales + certificado digital de mecenazgo cultural.' },
      { title: 'Mecenas Co-creador', minimum_amount: 100, description: 'Acceso a la bitácora privada de producción y contenido inédito tras bambalinas.' },
      { title: 'Gran Mecenas Protector', minimum_amount: Math.round(goal * 0.04) || 350, description: 'Reconocimiento honorífico máximo + invitación a eventos privados de la producción.' }
    ]
  }
  const tiers = TIER_TEMPLATES[category] || TIER_TEMPLATES.default
  return { success: true, isRealAi: false, tiers }
}
