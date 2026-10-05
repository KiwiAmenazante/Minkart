import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Heart, FolderPlus, Edit3, Save, CheckCircle, ArrowLeft, ShieldCheck, UploadCloud, Loader2 } from 'lucide-react'
import { getUserProfile, updateUserProfile, getUserProjects, getUserContributions, uploadUserAvatar } from '../services/minkaService'
import { UserAvatar } from '../components/UserAvatar'

export const ProfilePage = ({ currentUser, onOpenAuth }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('contributions') // 'contributions' | 'projects' | 'edit'
  const [profile, setProfile] = useState({
    full_name: currentUser?.user_metadata?.full_name || 'Mecenas Mink@rt',
    role: currentUser?.user_metadata?.role || 'mecenas',
    bio: 'Apasionado del cine, teatro y arte gráfico peruano.',
    avatar_url: null
  })

  const [myProjects, setMyProjects] = useState([])
  const [myContributions, setMyContributions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!currentUser?.id) {
      setIsLoading(false)
      return
    }
    const loadProfileData = async () => {
      setIsLoading(true)
      const userId = currentUser.id
      const pData = await getUserProfile(userId)
      if (pData) {
        setProfile((prev) => ({ ...prev, ...pData }))
      }

      const projs = await getUserProjects(userId)
      setMyProjects(projs)

      const contribs = await getUserContributions(userId)
      setMyContributions(contribs)
      setIsLoading(false)
    }

    loadProfileData()
  }, [currentUser])

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingAvatar(true)
    const res = await uploadUserAvatar(file)
    setIsUploadingAvatar(false)
    if (res.success && res.url) {
      setProfile(prev => ({ ...prev, avatar_url: res.url }))
    } else {
      alert(res.error || 'Error al actualizar foto de perfil.')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!currentUser?.id) return
    setIsSaving(true)
    await updateUserProfile(currentUser.id, profile)
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  if (!currentUser) {
    return (
      <main className="app-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <User size={48} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
        <h2>Perfil de Usuario</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 20px' }}>
          Debes iniciar sesión para visualizar tus proyectos, aportes y modificar tu perfil.
        </p>
        <button className="btn-primary" onClick={onOpenAuth}>
          Iniciar Sesión / Registrarse
        </button>
      </main>
    )
  }

  return (
    <main className="app-container">
      <button
        className="btn-secondary"
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Volver a la Cartelera
      </button>

      {/* Header del Perfil */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #1A0D23 100%)', borderRadius: '20px', padding: '32px', color: '#FFFFFF', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} size={90} fontSize="2.2rem" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF' }}>{profile.full_name}</h1>
            <span className="risk-score-badge high" style={{ position: 'static' }}>
              <ShieldCheck size={14} /> Rol: {profile.role === 'creator' ? 'Creador' : 'Mecenas'}
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '600px' }}>
            {profile.bio || 'Sin biografía especificada.'}
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'contributions' ? 'active' : ''}`}
          onClick={() => setActiveTab('contributions')}
        >
          <Heart size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Mis Contribuciones ({myContributions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderPlus size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Mis Proyectos ({myProjects.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <Edit3 size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Editar Perfil
        </button>
      </div>

      {/* Pestaña Mis Contribuciones */}
      {activeTab === 'contributions' && (
        <div style={{ marginTop: '20px' }}>
          {myContributions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myContributions.map((c) => (
                <div
                  key={c.id}
                  style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
                >
                  <div>
                    <span className="category-tag" style={{ position: 'static', display: 'inline-block', marginBottom: '6px' }}>
                      {c.project?.category || 'Cultura'}
                    </span>
                    <h3 style={{ fontSize: '1.1rem' }}>{c.project?.title || 'Proyecto Cultural'}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Fecha: {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                      S/ {c.amount}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>
                      ✓ Donación Confirmada
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              Aún no has realizado contribuciones a proyectos en Mink@rt.
            </div>
          )}
        </div>
      )}

      {/* Pestaña Mis Proyectos */}
      {activeTab === 'projects' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Campañas que has creado</h3>
            <button className="btn-primary" onClick={() => navigate('/crear-proyecto')}>
              + Crear Nueva Campaña
            </button>
          </div>

          {myProjects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myProjects.map((p) => {
                const perc = Math.min(Math.round((p.current_amount / p.funding_goal) * 100), 100)
                return (
                  <div
                    key={p.id}
                    style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
                  >
                    <div style={{ flex: 1 }}>
                      <span className="category-tag" style={{ position: 'static', display: 'inline-block', marginBottom: '6px' }}>
                        {p.category}
                      </span>
                      <h3 style={{ fontSize: '1.15rem' }}>{p.title}</h3>
                      <div className="progress-bar-bg" style={{ marginTop: '8px', maxWidth: '300px' }}>
                        <div className="progress-bar-fill" style={{ width: `${perc}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        S/ {p.current_amount} de S/ {p.funding_goal} ({perc}%)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="risk-score-badge high" style={{ position: 'static' }}>
                        Risk Score: {p.risk_score}%
                      </span>
                      <button className="btn-outlined" onClick={() => navigate(`/proyecto/${p.id}`)}>
                        Ver Proyecto
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              Aún no has publicado ningún proyecto cultural.
            </div>
          )}
        </div>
      )}

      {/* Pestaña Editar Perfil */}
      {activeTab === 'edit' && (
        <div style={{ marginTop: '20px', background: '#FFFFFF', borderRadius: '20px', padding: '32px', border: '1px solid var(--color-border)', maxWidth: '640px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>Editar Información de Perfil</h3>

          {saveSuccess && (
            <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Perfil actualizado correctamente en Supabase.
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', background: '#FAF8F5', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} size={70} fontSize="1.6rem" />
              <div>
                <label className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem', cursor: isUploadingAvatar ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <input type="file" accept="image/*" disabled={isUploadingAvatar} style={{ display: 'none' }} onChange={handleAvatarFileChange} />
                  {isUploadingAvatar ? <Loader2 className="spinner-icon" size={14} /> : <UploadCloud size={14} />}
                  {isUploadingAvatar ? 'Subiendo...' : 'Cambiar Foto de Perfil'}
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Sube una imagen (se guardará en el bucket <code>user-avatars</code>)
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>NOMBRE COMPLETO *</label>
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>ROL DE USUARIO</label>
              <select
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              >
                <option value="mecenas">Mecenas (Donante / Apoyador)</option>
                <option value="creator">Creador (Publicador de Campañas)</option>
              </select>
            </div>

            <div className="form-group">
              <label>BIOGRAFÍA / PRESENTACIÓN ARTÍSTICA</label>
              <textarea
                rows={3}
                placeholder="Cuéntale a la comunidad sobre tus intereses culturales..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-3" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Guardando Cambios...' : 'Guardar Perfil'}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
