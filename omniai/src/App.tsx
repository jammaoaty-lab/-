import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import AgentPage from './pages/AgentPage'
import KnowledgePage from './pages/KnowledgePage'
import ModelsPage from './pages/ModelsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import LoraPage from './pages/LoraPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export type Page = 'chat' | 'agent' | 'knowledge' | 'models' | 'profile' | 'settings' | 'lora' | 'login' | 'register'

function App() {
  const [page, setPage] = useState<Page>('login')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isGuest, setIsGuest] = useState(false)

  const navigateTo = useCallback((p: Page) => {
    setPage(p)
    setSidebarOpen(false)
  }, [])

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true)
    setIsGuest(false)
    setPage('chat')
  }, [])

  const handleGuestAccess = useCallback(() => {
    setIsGuest(true)
    setIsLoggedIn(false)
    setPage('chat')
  }, [])

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false)
    setIsGuest(false)
    setPage('login')
  }, [])

  const isAuthPage = page === 'login' || page === 'register'

  const renderPage = () => {
    switch (page) {
      case 'login':
        return (
          <LoginPage
            onBack={() => setPage('chat')}
            onGoRegister={() => setPage('register')}
            onLogin={handleLogin}
            onSkip={handleGuestAccess}
          />
        )
      case 'register':
        return (
          <RegisterPage
            onBack={() => setPage('login')}
            onGoLogin={() => setPage('login')}
            onRegister={handleLogin}
          />
        )
      case 'chat':
        return <ChatPage onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      case 'agent':
        return <AgentPage />
      case 'knowledge':
        return <KnowledgePage />
      case 'models':
        return <ModelsPage />
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} onLogout={handleLogout} isGuest={isGuest} onLogin={() => setPage('login')} />
      case 'settings':
        return <SettingsPage onBack={() => navigateTo('profile')} />
      case 'lora':
        return <LoraPage onBack={() => navigateTo('models')} />
      default:
        return <ChatPage onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-secondary overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence>
          {sidebarOpen && (isLoggedIn || isGuest) && (
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              onNavigate={navigateTo}
            />
          )}
        </AnimatePresence>
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: isAuthPage ? 0 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAuthPage ? 0 : -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {(isLoggedIn || isGuest) && !isAuthPage && (
        <BottomNav current={page} onNavigate={navigateTo} />
      )}
    </div>
  )
}

export default App
