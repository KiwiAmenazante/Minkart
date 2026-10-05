import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectCard } from '../components/ProjectCard'

export const CatalogPage = ({ projects, isLoading, isConfigured, isRealData }) => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState('risk_score')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['Todos', 'Cine', 'Teatro', 'Cómic', 'Webseries', 'Animación']

  let processed = [...projects]

  if (activeCategory !== 'Todos') {
    processed = processed.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase())
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    processed = processed.filter((p) => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
  }

  if (sortBy === 'risk_score') {
    processed.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
  } else if (sortBy === 'amount') {
    processed.sort((a, b) => (b.current_amount || 0) - (a.current_amount || 0))
  } else if (sortBy === 'recent') {
    processed.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }

  return (
    <main className="app-container">
      {/* Hero Section */}
      <section className="hero-banner">
        <h2 className="hero-title">
          Plataforma Cultural <span>Mink@rt</span>
        </h2>
        <p className="hero-subtitle">
          Financia producciones independientes de arte y cultura en el Perú con la tranquilidad de <strong>MinkaGuard AI Risk Score</strong>: evaluación transparente de guiones, presupuestos y cronogramas.
        </p>
      </section>

      {/* Filtros por Categoría y Ordenamiento */}
      <div className="filter-controls-bar">
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sort-select-box">
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>
            Ordenar por:
          </span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="risk_score">Risk Score IA (Mayor a Menor)</option>
            <option value="amount">Mayor Recaudación</option>
            <option value="recent">Más Recientes</option>
          </select>
        </div>
      </div>

      {/* Grilla de Proyectos */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          Cargando proyectos en la cartelera de Mink@rt...
        </div>
      ) : processed.length > 0 ? (
        <div className="projects-grid">
          {processed.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelectProject={(p) => navigate(`/proyecto/${p.id}`)}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <p>
            {projects.length === 0
              ? 'Aún no hay proyectos publicados en la cartelera.'
              : `No se encontraron proyectos para tu búsqueda "${searchQuery || activeCategory}".`}
          </p>
          <button className="btn-primary mt-3" onClick={() => navigate('/crear-proyecto')}>
            {projects.length === 0 ? 'Publicar el primer proyecto' : 'Publicar primer proyecto en esta categoría'}
          </button>
        </div>
      )}
    </main>
  )
}
