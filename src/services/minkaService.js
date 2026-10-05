import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// ─── ESTADO LOCAL (solo si Supabase no está configurado; arranca vacío) ─────
let localProjects = []
let localProjectUpdates = []
let localContributions = []
const MOCK_DONOR_PROFILES = {}
let localProfile = { id: 'demo_user', full_name: 'Usuario Local', role: 'mecenas', bio: '', avatar_url: null }

// ─── SUBIDA DIRECTA DE ARCHIVO DE IMAGEN ──────────────────────────────────
export const uploadProjectBanner = async (file) => {
  if (!file) return { success: false, error: 'No se seleccionó archivo' }

  // 1. Si Supabase está configurado, intentar subir al bucket 'project-banners'
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { data, error } = await supabase.storage
        .from('project-banners')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('project-banners')
          .getPublicUrl(filePath)

        return { success: true, url: publicUrlData.publicUrl, isReal: true }
      }
      if (error) console.warn('Supabase storage upload error:', error)
    } catch (err) {
      console.warn('Storage upload exception, usando fallback local Base64:', err)
    }
  }

  // 2. Fallback Local: Convertir a DataURL Base64 para visualización instantánea y persistencia
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve({ success: true, url: reader.result, isReal: false })
    }
    reader.onerror = () => {
      resolve({ success: false, error: 'Error al leer el archivo de imagen' })
    }
    reader.readAsDataURL(file)
  })
}

// ─── SUBIDA DIRECTA DE ARCHIVOS DE DOCUMENTOS ──────────────────────────────
export const uploadProjectDocument = async (file) => {
  if (!file) return { success: false, error: 'No se seleccionó archivo' }

  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${sanitizedName}`
      const filePath = `documents/${fileName}`

      const { data, error } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('project-documents')
          .getPublicUrl(filePath)

        return {
          success: true,
          name: file.name,
          url: publicUrlData.publicUrl,
          size: file.size,
          type: file.type || 'application/pdf',
          isReal: true
        }
      }
      if (error) console.warn('Supabase document storage upload error:', error)
    } catch (err) {
      console.warn('Document storage upload exception, usando fallback local Base64:', err)
    }
  }

  // Fallback Local DataURL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve({
        success: true,
        name: file.name,
        url: reader.result,
        size: file.size,
        type: file.type || 'application/pdf',
        isReal: false
      })
    }
    reader.onerror = () => {
      resolve({ success: false, error: 'Error al leer el archivo de documento' })
    }
    reader.readAsDataURL(file)
  })
}

// ─── SUBIDA DE FOTO DE PERFIL (BUCKET user-avatars) ────────────────────────
export const uploadUserAvatar = async (file) => {
  if (!file) return { success: false, error: 'No se seleccionó archivo' }

  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(filePath)

        return { success: true, url: publicUrlData.publicUrl, isReal: true }
      }
      if (error) console.warn('Supabase avatar storage error:', error)
    } catch (err) {
      console.warn('Avatar storage exception, usando DataURL local:', err)
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve({ success: true, url: reader.result, isReal: false })
    reader.onerror = () => resolve({ success: false, error: 'Error al leer la imagen de avatar' })
    reader.readAsDataURL(file)
  })
}

// ─── SUBIDA DE FOTOS PARA AVANCES/HITOS (BUCKET update-media) ──────────────
export const uploadUpdateMedia = async (file) => {
  if (!file) return { success: false, error: 'No se seleccionó archivo' }

  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `update_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `updates/${fileName}`

      const { data, error } = await supabase.storage
        .from('update-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('update-media')
          .getPublicUrl(filePath)

        return { success: true, url: publicUrlData.publicUrl, isReal: true }
      }
      if (error) console.warn('Supabase update-media storage error:', error)
    } catch (err) {
      console.warn('Update-media exception, usando DataURL local:', err)
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve({ success: true, url: reader.result, isReal: false })
    reader.onerror = () => resolve({ success: false, error: 'Error al leer imagen de avance' })
    reader.readAsDataURL(file)
  })
}

// ─── SUBIDA DE FOTOS PARA GALERÍA DE PROYECTO (BUCKET project-gallery) ──────
export const uploadGalleryImage = async (file) => {
  if (!file) return { success: false, error: 'No se seleccionó archivo' }

  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { data, error } = await supabase.storage
        .from('project-gallery')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('project-gallery')
          .getPublicUrl(filePath)

        return { success: true, url: publicUrlData.publicUrl, isReal: true }
      }
      if (error) console.warn('Supabase project-gallery storage error:', error)
    } catch (err) {
      console.warn('Project gallery exception, usando DataURL local:', err)
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve({ success: true, url: reader.result, isReal: false })
    reader.onerror = () => resolve({ success: false, error: 'Error al leer foto de galería' })
    reader.readAsDataURL(file)
  })
}

// ─── READ PROJECTS ──────────────────────────────────────────────────────────
export const getProjects = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, creator:profiles(*), reward_tiers(*)')
        .order('created_at', { ascending: false })
      if (!error && data) return { data, isReal: true }
    } catch (err) { console.warn('getProjects fallback:', err) }
  }
  return { data: localProjects, isReal: false }
}

export const getProjectById = async (id) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, creator:profiles(*), reward_tiers(*)')
        .eq('id', id)
        .single()
      if (!error && data) return { data, isReal: true }
    } catch (err) { console.warn('getProjectById fallback:', err) }
  }
  const proj = localProjects.find((p) => p.id === id)
  return { data: proj || null, isReal: false }
}

// ─── PROJECT UPDATES (AVANCES) ──────────────────────────────────────────────
export const getProjectUpdates = async (projectId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (!error && data) return { data, isReal: true }
    } catch (err) { console.warn('getProjectUpdates fallback:', err) }
  }
  const updates = localProjectUpdates
    .filter(u => u.project_id === projectId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: updates, isReal: false }
}

export const createProjectUpdate = async ({ projectId, title, content, mediaUrl }) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('project_updates')
        .insert([{
          project_id: projectId,
          title,
          content,
          media_url: mediaUrl || null
        }])
        .select()
      if (!error && data && data[0]) {
        return { success: true, data: data[0], isReal: true }
      }
      if (error) console.warn('createProjectUpdate error:', error)
    } catch (err) { console.warn('createProjectUpdate exception:', err) }
  }

  // Local fallback
  const newUpdate = {
    id: 'u_' + Date.now(),
    project_id: projectId,
    title,
    content,
    media_url: mediaUrl || null,
    created_at: new Date().toISOString()
  }
  localProjectUpdates = [newUpdate, ...localProjectUpdates]
  return { success: true, data: newUpdate, isReal: false }
}

// ─── RANKING ESPECÍFICO POR PROYECTO ────────────────────────────────────────
export const getProjectTopDonors = async (projectId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('user_id, amount, status, created_at, profile:profiles(id, full_name, avatar_url, bio), reward_tier:reward_tiers(id, title)')
        .eq('project_id', projectId)
        .eq('status', 'completed')

      if (!error && data) {
        const donorMap = {}
        data.forEach(c => {
          const uid = c.user_id || 'anonimo'
          if (!donorMap[uid]) {
            donorMap[uid] = {
              user_id: uid,
              profile: c.profile || { full_name: 'Mecenas Anónimo', avatar_url: null, bio: 'Mecenas de esta obra' },
              total_donated: 0,
              contributions_count: 0,
              last_tier: c.reward_tier?.title || 'Mecenazgo libre',
              last_donated_at: c.created_at
            }
          }
          donorMap[uid].total_donated += Number(c.amount || 0)
          donorMap[uid].contributions_count += 1
          if (c.reward_tier?.title) donorMap[uid].last_tier = c.reward_tier.title
        })

        const sorted = Object.values(donorMap)
          .sort((a, b) => b.total_donated - a.total_donated)
          .map((d, index) => ({
            ...d,
            rank: index + 1,
            badge: index === 0 ? 'Mecenas de Honor 🥇' : index === 1 ? 'Gran Mecenas 🥈' : index === 2 ? 'Mecenas Destacado 🥉' : 'Mecenas del Proyecto'
          }))

        return { data: sorted, isReal: true }
      }
    } catch (err) { console.warn('getProjectTopDonors fallback:', err) }
  }

  // Local fallback para este proyecto
  const donorMap = {}
  localContributions
    .filter(c => c.project_id === projectId)
    .forEach(c => {
      const uid = c.user_id || 'anonimo'
      if (!donorMap[uid]) {
        const mockProf = MOCK_DONOR_PROFILES[uid] || { full_name: 'Mecenas Anónimo', bio: 'Mecenas de esta obra', avatar_url: null }
        donorMap[uid] = {
          user_id: uid,
          profile: mockProf,
          total_donated: 0,
          contributions_count: 0,
          last_tier: 'Mecenazgo Libre',
          last_donated_at: c.created_at
        }
      }
      donorMap[uid].total_donated += Number(c.amount || 0)
      donorMap[uid].contributions_count += 1
    })

  const sorted = Object.values(donorMap)
    .sort((a, b) => b.total_donated - a.total_donated)
    .map((d, index) => ({
      ...d,
      rank: index + 1,
      badge: index === 0 ? 'Mecenas de Honor 🥇' : index === 1 ? 'Gran Mecenas 🥈' : index === 2 ? 'Mecenas Destacado 🥉' : 'Mecenas del Proyecto'
    }))

  return { data: sorted, isReal: false }
}

// ─── RANKING GLOBAL TOP 10 DONANTES ─────────────────────────────────────────
export const getTopDonors = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('user_id, amount, status, profile:profiles(id, full_name, avatar_url, bio, role)')
        .eq('status', 'completed')

      if (!error && data) {
        const donorMap = {}
        data.forEach(c => {
          const uid = c.user_id || 'anonimo'
          if (!donorMap[uid]) {
            donorMap[uid] = {
              user_id: uid,
              profile: c.profile || { full_name: 'Mecenas Anónimo', avatar_url: null, bio: 'Mecenas de la cultura' },
              total_donated: 0,
              contributions_count: 0
            }
          }
          donorMap[uid].total_donated += Number(c.amount || 0)
          donorMap[uid].contributions_count += 1
        })

        const sorted = Object.values(donorMap)
          .sort((a, b) => b.total_donated - a.total_donated)
          .slice(0, 10)
          .map((d, index) => ({
            ...d,
            rank: index + 1,
            badge: index === 0 ? 'Mecenas Diamante 💎' : index < 3 ? 'Gran Mecenas Oro 🥇' : index < 6 ? 'Mecenas Plata 🥈' : 'Mecenas Bronce 🥉'
          }))

        return { data: sorted, isReal: true }
      }
    } catch (err) { console.warn('getTopDonors fallback:', err) }
  }

  // Local aggregation fallback
  const donorMap = {}
  localContributions.forEach(c => {
    const uid = c.user_id || 'anonimo'
    if (!donorMap[uid]) {
      const mockProf = MOCK_DONOR_PROFILES[uid] || { full_name: 'Mecenas Anónimo', bio: 'Amante del arte peruano', avatar_url: null }
      donorMap[uid] = {
        user_id: uid,
        profile: mockProf,
        total_donated: 0,
        contributions_count: 0
      }
    }
    donorMap[uid].total_donated += Number(c.amount || 0)
    donorMap[uid].contributions_count += 1
  })

  const sorted = Object.values(donorMap)
    .sort((a, b) => b.total_donated - a.total_donated)
    .slice(0, 10)
    .map((d, index) => ({
      ...d,
      rank: index + 1,
      badge: index === 0 ? 'Mecenas Diamante 💎' : index < 3 ? 'Gran Mecenas Oro 🥇' : index < 6 ? 'Mecenas Plata 🥈' : 'Mecenas Bronce 🥉'
    }))

  return { data: sorted, isReal: false }
}

// ─── CREATE PROJECT ─────────────────────────────────────────────────────────
export const createProject = async (newProjectData, creatorId = 'demo_user') => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title: newProjectData.title,
          category: newProjectData.category,
          funding_goal: parseFloat(newProjectData.funding_goal),
          current_amount: 0,
          risk_score: newProjectData.risk_score || 85,
          ai_analysis_report: newProjectData.ai_analysis_report || {},
          synopsis: newProjectData.synopsis || '',
          image_url: newProjectData.image_url || null,
          documents: newProjectData.documents || [],
          gallery_images: newProjectData.gallery_images || [],
          status: 'active',
          creator_id: creatorId
        }])
        .select()

      if (!error && data && data[0]) {
        const projectId = data[0].id
        const validTiers = (newProjectData.reward_tiers || []).filter(t => t.title && t.minimum_amount)
        if (validTiers.length > 0) {
          const { error: tierError } = await supabase.from('reward_tiers').insert(
            validTiers.map(t => ({
              project_id: projectId,
              title: t.title,
              minimum_amount: parseFloat(t.minimum_amount),
              description: t.description || ''
            }))
          )
          if (tierError) console.warn('Tier insert error:', tierError)
        }

        // Crear actualización inicial automática
        await supabase.from('project_updates').insert([{
          project_id: projectId,
          title: '¡Campaña iniciada oficialmente en Mink@rt!',
          content: `Proyecto evaluado por MinkaGuard AI con un Risk Score de ${newProjectData.risk_score || 85}%. ¡Inicia la meta de recaudación!`
        }])

        return { success: true, data: { ...data[0], id: projectId }, isReal: true }
      }
      if (error) console.warn('createProject Supabase error:', error)
    } catch (err) { console.warn('createProject exception:', err) }
  }

  // Local mock fallback
  const id = 'p_' + Date.now()
  const validTiers = (newProjectData.reward_tiers || []).filter(t => t.title && t.minimum_amount)
  const mockCreated = {
    id,
    creator_id: creatorId,
    title: newProjectData.title,
    category: newProjectData.category,
    funding_goal: parseFloat(newProjectData.funding_goal),
    current_amount: 0,
    risk_score: newProjectData.risk_score || 85,
    synopsis: newProjectData.synopsis || '',
    image_url: newProjectData.image_url || null,
    documents: newProjectData.documents || [],
    gallery_images: newProjectData.gallery_images || [],
    ai_analysis_report: newProjectData.ai_analysis_report || { summary: 'Analizado por MinkaGuard AI' },
    status: 'active',
    created_at: new Date().toISOString(),
    creator: { ...localProfile, id: creatorId },
    reward_tiers: validTiers.length > 0
      ? validTiers.map((t, i) => ({ id: `r_${Date.now()}_${i}`, project_id: id, title: t.title, minimum_amount: parseFloat(t.minimum_amount), description: t.description || '' }))
      : [{ id: `r_${Date.now()}`, project_id: id, title: 'Mecenas Fundador', minimum_amount: 50, description: 'Agradecimiento especial' }]
  }
  localProjects = [mockCreated, ...localProjects]
  
  // Agregar actualización inicial en local
  localProjectUpdates = [
    {
      id: 'u_' + Date.now(),
      project_id: id,
      title: '¡Campaña iniciada oficialmente en Mink@rt!',
      content: `Proyecto auditado por MinkaGuard AI con un Risk Score de ${newProjectData.risk_score || 85}%.`,
      media_url: null,
      created_at: new Date().toISOString()
    },
    ...localProjectUpdates
  ]

  return { success: true, data: mockCreated, isReal: false }
}

// ─── UPDATE PROJECT ─────────────────────────────────────────────────────────
export const updateProject = async (projectId, updatedData, newTiers) => {
  if (isSupabaseConfigured) {
    try {
      const projectUpdate = {}
      if (updatedData.title !== undefined) projectUpdate.title = updatedData.title
      if (updatedData.category !== undefined) projectUpdate.category = updatedData.category
      if (updatedData.funding_goal !== undefined) projectUpdate.funding_goal = parseFloat(updatedData.funding_goal)
      if (updatedData.synopsis !== undefined) projectUpdate.synopsis = updatedData.synopsis
      if (updatedData.image_url !== undefined) projectUpdate.image_url = updatedData.image_url
      if (updatedData.documents !== undefined) projectUpdate.documents = updatedData.documents
      if (updatedData.gallery_images !== undefined) projectUpdate.gallery_images = updatedData.gallery_images
      if (updatedData.risk_score !== undefined) projectUpdate.risk_score = updatedData.risk_score
      if (updatedData.ai_analysis_report !== undefined) projectUpdate.ai_analysis_report = updatedData.ai_analysis_report

      const { error: projError } = await supabase
        .from('projects').update(projectUpdate).eq('id', projectId)
      if (projError) console.warn('updateProject error:', projError)

      // Reemplazar tiers: eliminar los anteriores e insertar los nuevos
      if (newTiers) {
        await supabase.from('reward_tiers').delete().eq('project_id', projectId)
        const validTiers = newTiers.filter(t => t.title && t.minimum_amount)
        if (validTiers.length > 0) {
          await supabase.from('reward_tiers').insert(
            validTiers.map(t => ({
              project_id: projectId,
              title: t.title,
              minimum_amount: parseFloat(t.minimum_amount),
              description: t.description || ''
            }))
          )
        }
      }
      return { success: true, isReal: true }
    } catch (err) { console.warn('updateProject exception:', err) }
  }

  // Local fallback
  localProjects = localProjects.map(p => {
    if (p.id !== projectId) return p
    const validTiers = newTiers
      ? newTiers.filter(t => t.title && t.minimum_amount).map((t, i) => ({
          id: t.id || `r_edit_${Date.now()}_${i}`,
          project_id: projectId,
          title: t.title,
          minimum_amount: parseFloat(t.minimum_amount),
          description: t.description || ''
        }))
      : p.reward_tiers
    return { ...p, ...updatedData, reward_tiers: validTiers }
  })
  return { success: true, isReal: false }
}

// ─── CONTRIBUTE ──────────────────────────────────────────────────────────────
export const contributeToProject = async ({ projectId, amount, rewardTierId, userId }) => {
  const numAmount = parseFloat(amount)
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('contributions').insert([{
        project_id: projectId,
        user_id: userId || null,
        reward_tier_id: rewardTierId || null,
        amount: numAmount,
        status: 'completed'
      }])
      if (!error) {
        const { data: proj } = await supabase.from('projects').select('current_amount, funding_goal').eq('id', projectId).single()
        if (proj) {
          const newCurrent = Number(proj.current_amount) + numAmount
          await supabase.from('projects').update({
            current_amount: newCurrent,
            status: newCurrent >= Number(proj.funding_goal) ? 'funded' : 'active'
          }).eq('id', projectId)
        }
        return { success: true, isReal: true }
      }
    } catch (err) { console.warn('contributeToProject exception:', err) }
  }

  const target = localProjects.find(p => p.id === projectId)
  if (target) {
    target.current_amount += numAmount
    if (target.current_amount >= target.funding_goal) target.status = 'funded'
  }
  localContributions = [{
    id: 'c_' + Date.now(),
    project_id: projectId,
    user_id: userId || 'demo_user',
    amount: numAmount,
    reward_tier_id: rewardTierId || null,
    status: 'completed',
    created_at: new Date().toISOString(),
    project: { title: target?.title || 'Proyecto Cultural', category: target?.category || 'Arte' }
  }, ...localContributions]
  return { success: true, isReal: false }
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
export const getUserProfile = async (userId) => {
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (!error && data) return data
    } catch (err) { console.warn('getUserProfile fallback:', err) }
  }
  return localProfile
}

export const updateUserProfile = async (userId, profileData) => {
  if (isSupabaseConfigured && userId) {
    try {
      const { error } = await supabase.from('profiles').update(profileData).eq('id', userId)
      if (!error) return { success: true }
    } catch (err) { console.warn('updateUserProfile fallback:', err) }
  }
  localProfile = { ...localProfile, ...profileData }
  return { success: true }
}

export const getUserProjects = async (userId) => {
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, reward_tiers(*)')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
      if (!error && data) return data
    } catch (err) { console.warn('getUserProjects fallback:', err) }
  }
  return localProjects.filter(p => p.creator_id === userId || p.creator?.id === userId)
}

export const getUserContributions = async (userId) => {
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*, project:projects(title, category)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!error && data) return data
    } catch (err) { console.warn('getUserContributions fallback:', err) }
  }
  return localContributions.filter(c => c.user_id === userId || userId === 'demo_user')
}
