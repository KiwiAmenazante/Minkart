import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, CheckCircle2 } from 'lucide-react'
import { UserAvatar } from './UserAvatar'

const CATEGORY_IMAGES = {
  cine: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
  cómic: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&auto=format&fit=crop&q=80',
  teatro: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&auto=format&fit=crop&q=80',
  webseries: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
  animación: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
}

export const ProjectCard = ({ project, onSelectProject }) => {
  const navigate = useNavigate()
  const percentage = Math.min(Math.round((project.current_amount / project.funding_goal) * 100), 100)
  const categoryKey = project.category?.toLowerCase() || 'cine'
  const imageUrl = project.image_url || CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.cine
  const isHighViability = project.risk_score >= 85

  const handleCardClick = () => {
    if (onSelectProject) {
      onSelectProject(project)
    } else {
      navigate(`/proyecto/${project.id}`)
    }
  }

  return (
    <div className="project-card">
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={project.title} className="card-image" />
        
        {/* Floating badge: IA Risk Score */}
        <div className={`risk-score-badge ${isHighViability ? 'high' : ''}`}>
          <ShieldCheck size={15} />
          <span>IA Risk Score: {project.risk_score}% Viable</span>
        </div>

        <span className="category-tag">{project.category}</span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{project.title}</h3>

        <div className="card-creator">
          <UserAvatar
            name={project.creator?.full_name}
            avatarUrl={project.creator?.avatar_url}
            size={28}
            fontSize="0.75rem"
          />
          <span>Por {project.creator?.full_name || 'Creador Independiente'}</span>
        </div>

        {/* Progress Bar Section */}
        <div className="progress-section">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
          </div>

          <div className="progress-text-row">
            <span className="raised-amount">S/ {project.current_amount.toLocaleString()}</span>
            <span className="goal-amount">de S/ {project.funding_goal.toLocaleString()}</span>
          </div>
        </div>

        {/* CTA Outlined Button */}
        <button className="btn-outlined w-full" onClick={handleCardClick}>
          <Eye size={16} />
          Ver Detalles
        </button>
      </div>
    </div>
  )
}
