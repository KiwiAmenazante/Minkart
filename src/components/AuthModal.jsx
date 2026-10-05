import React, { useState } from 'react'
import { X, Lock, Mail, User, LogIn, UserPlus, MailCheck, AlertCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'verification_pending'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('mecenas') // 'mecenas' | 'creator'
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    if (!isSupabaseConfigured) {
      // Fallback local en modo demostración
      setTimeout(() => {
        setLoading(false)
        onAuthSuccess({
          id: 'user_' + Date.now(),
          email,
          user_metadata: { full_name: fullName || email.split('@')[0], role }
        })
        onClose()
      }, 600)
      return
    }

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role }
          }
        })
        if (error) throw error
        
        // Crear/actualizar registro en la tabla profiles
        if (data.user) {
          await supabase.from('profiles').upsert([
            { id: data.user.id, full_name: fullName, role }
          ])

          // Si Supabase requiere confirmación de email (session nula o email no confirmado)
          if (!data.session || !data.user.email_confirmed_at) {
            setPendingVerificationEmail(email)
            setMode('verification_pending')
            return
          }
          onAuthSuccess(data.user)
          onClose()
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        if (data.user) {
          // Si el usuario requiere confirmación de correo y aún no lo ha verificado
          if (data.user.identities && data.user.identities.length > 0 && !data.user.email_confirmed_at) {
            setErrorMsg('Tu cuenta requiere verificación por correo. Por favor revisa tu bandeja de entrada antes de iniciar sesión.')
            return
          }
          onAuthSuccess(data.user)
          onClose()
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error en la autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card sm" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ padding: '32px 32px 24px' }}>
          <h2 style={{ fontSize: '1.6rem', textAlign: 'center', marginBottom: '8px' }}>
            Unirse a <span style={{ color: 'var(--color-primary)' }}>Mink@rt</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Comunidad de Crowdfunding Cultural e Inteligencia Artificial
          </p>

          {mode === 'verification_pending' ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <MailCheck size={36} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--color-secondary)' }}>
                ¡Verifica tu Correo Electrónico!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral)', lineHeight: 1.6, marginBottom: '20px' }}>
                Hemos enviado un enlace de confirmación a <strong style={{ color: 'var(--color-primary)' }}>{pendingVerificationEmail}</strong>.
              </p>
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '12px', fontSize: '0.825rem', color: '#92400E', textAlign: 'left', marginBottom: '20px' }}>
                💡 <strong>Importante:</strong> Para proteger la integridad del ecosistema y guardar tus proyectos y donaciones en la base de datos, debes confirmar tu correo antes de iniciar sesión.
              </div>
              <button
                className="btn-primary w-full"
                onClick={() => setMode('login')}
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  Iniciar Sesión
                </button>
                <button
                  className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  Crear Cuenta
                </button>
              </div>

              {errorMsg && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '0.825rem', marginBottom: '16px' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div className="form-group">
                    <label>NOMBRE COMPLETO</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        placeholder="Ej. María Josefa Alarcón"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>CORREO ELECTRÓNICO</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                    />
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>CONTRASEÑA</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="form-group">
                    <label>TIPO DE PERFIL DE USUARIO</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="mecenas">Mecenas (Quiero apoyar proyectos)</option>
                      <option value="creator">Creador (Quiero publicar proyectos e IA Audit)</option>
                    </select>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full mt-3" disabled={loading}>
                  {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
