import React from 'react'

export const UserAvatar = ({
  name = '',
  avatarUrl = null,
  size = 40,
  fontSize = '0.9rem',
  style = {},
  className = ''
}) => {
  if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar de usuario'}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid var(--color-border)',
          ...style
        }}
        onError={(e) => {
          // Si la imagen falla al cargar, ocultar img e indicar fallback
          e.target.style.display = 'none'
        }}
      />
    )
  }

  // Extraer inicial del nombre de usuario
  const cleanName = (name || '').trim()
  const initial = cleanName ? cleanName.charAt(0).toUpperCase() : 'U'

  // Generar un color de gradiente basado suavemente en el nombre para coherencia visual
  const colors = [
    'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)',
    'linear-gradient(135deg, #48DBFB 0%, #0ABDE3 100%)',
    'linear-gradient(135deg, #1DD1A1 0%, #10AC84 100%)',
    'linear-gradient(135deg, #FECA57 0%, #FF9F43 100%)',
    'linear-gradient(135deg, #54A0FF 0%, #2E86DE 100%)',
    'linear-gradient(135deg, #5f27cd 0%, #341f97 100%)'
  ]
  let charSum = 0
  for (let i = 0; i < cleanName.length; i++) charSum += cleanName.charCodeAt(i)
  const bgGradient = colors[charSum % colors.length]

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: bgGradient,
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        userSelect: 'none',
        ...style
      }}
    >
      {initial}
    </div>
  )
}
