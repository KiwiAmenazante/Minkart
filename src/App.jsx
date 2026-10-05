import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { CreateProjectPage } from './pages/CreateProjectPage'
import { EditProjectPage } from './pages/EditProjectPage'
import { RankingPage } from './pages/RankingPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import { getProjects, createProject, contributeToProject } from './services/minkaService'

export function App() {
  const [projects, setProjects] = useState([])
  const [isRealData, setIsRealData] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadProjects = async () => {
    setIsLoading(true)
    const { data, isReal } = await getProjects()
    setProjects(data)
    setIsRealData(isReal)
    setIsLoading(false)
  }

  useEffect(() => {
    loadProjects()

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Verificar si el usuario tiene correo verificado antes de iniciar sesión en la sesión activa
          if (session.user.identities && session.user.identities.length > 0 && !session.user.email_confirmed_at) {
            supabase.auth.signOut()
            setCurrentUser(null)
          } else {
            setCurrentUser(session.user)
          }
        }
      })
    }
  }, [])

  const handleCreateProject = async (formData) => {
    const result = await createProject(formData, currentUser?.id)
    if (result.success) {
      await loadProjects()
    }
    return result
  }

  const handleContribute = async (payload) => {
    const result = await contributeToProject({
      ...payload,
      userId: currentUser?.id
    })
    if (result.success) {
      await loadProjects()
    }
    return result
  }

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setCurrentUser(null)
  }

  return (
    <BrowserRouter>
      <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <Routes>
          {/* Ruta Home Landing Page */}
          <Route
            path="/"
            element={
              <HomePage
                projects={projects}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                currentUser={currentUser}
              />
            }
          />

          {/* Ruta Cartelera Completa */}
          <Route
            path="/cartelera"
            element={
              <CatalogPage
                projects={projects}
                isLoading={isLoading}
                isConfigured={isSupabaseConfigured}
                isRealData={isRealData}
              />
            }
          />

          {/* Ruta Detalle de Proyecto */}
          <Route
            path="/proyecto/:id"
            element={
              <ProjectDetailPage
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onContribute={handleContribute}
              />
            }
          />

          {/* Ruta Crear Proyecto */}
          <Route
            path="/crear-proyecto"
            element={
              <CreateProjectPage
                currentUser={currentUser}
                onCreateProject={handleCreateProject}
              />
            }
          />

          {/* Ruta Editar Proyecto */}
          <Route
            path="/editar-proyecto/:id"
            element={
              <EditProjectPage
                currentUser={currentUser}
                onRefresh={loadProjects}
              />
            }
          />

          {/* Ruta Perfil de Usuario */}
          <Route
            path="/perfil"
            element={
              <ProfilePage
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />

          {/* Ruta Ranking Top 10 Mecenas */}
          <Route path="/ranking" element={<RankingPage />} />

          {/* Ruta 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Footer global de Mink@rt */}
        <Footer />

        {/* Modal de Autenticación */}
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={(user) => setCurrentUser(user)}
          />
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
