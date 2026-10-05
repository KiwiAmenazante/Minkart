import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Search, PlusCircle, User, LogOut } from 'lucide-react'

export const Header = ({
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo que navega a / */}
        <Link to="/" className="brand-logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon-circle">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="brand-title">Mink<span>@rt</span></h1>
            <p className="brand-subtitle">CROWDFUNDING & MINKAGUARD AI</p>
          </div>
        </Link>

        {/* Search Bar Pill-Shape */}
        <div className="search-pill-container">
          <Search className="search-icon-inside" />
          <input
            type="text"
            className="search-pill-input"
            placeholder="Buscar proyectos culturales o creadores..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Right Menu */}
        <div className="navbar-right">
          <button
            className="user-menu-btn"
            onClick={() => navigate('/cartelera')}
            title="Ver Cartelera Completa"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Cartelera</span>
          </button>

          <button
            className="user-menu-btn"
            onClick={() => navigate('/ranking')}
            title="Ver Salón de Honor y Top 10 Mecenas"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Top Mecenas</span>
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                className="user-menu-btn"
                onClick={() => navigate('/perfil')}
                title="Ver Mi Perfil"
              >
                <div className="avatar-circle">
                  {(currentUser.user_metadata?.full_name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                  {currentUser.user_metadata?.full_name || 'Mi Perfil'}
                </span>
              </div>
              <button
                className="btn-secondary"
                onClick={async () => {
                  await onLogout()
                  navigate('/', { replace: true })
                }}
                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)' }}
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="user-menu-btn" onClick={onOpenAuth}>
              <User size={16} />
              <span>Ingresar</span>
            </button>
          )}

          {/* Botón CTA Inverted/Secondary que navega a /crear-proyecto */}
          <button
            className="btn-secondary"
            onClick={() => {
              if (!currentUser) {
                onOpenAuth()
              } else {
                navigate('/crear-proyecto')
              }
            }}
          >
            <PlusCircle size={18} />
            <span>Crear Proyecto</span>
          </button>
        </div>
      </div>
    </header>
  )
}
