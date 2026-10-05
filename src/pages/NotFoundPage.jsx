import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <main className="app-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '48px 32px', maxWidth: '560px', margin: '0 auto', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
        <FileQuestion size={64} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '3rem', color: 'var(--color-secondary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.4rem', margin: '12px 0 8px' }}>Página no Encontrada</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          La ruta a la que intentas acceder no existe en la plataforma Mink@rt.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <Home size={18} /> Volver al Inicio / Cartelera
        </button>
      </div>
    </main>
  )
}
