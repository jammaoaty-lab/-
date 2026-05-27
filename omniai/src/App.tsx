import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import AgentPage from './pages/AgentPage'
import KnowledgePage from './pages/KnowledgePage'
import ModelsPage from './pages/ModelsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import LoraPage from './pages/LoraPage'

export type Page = 'chat' | 'agent' | 'knowledge' | 'models' | 'profile' | 'settings' | 'lora'

function App() {
  const [page, setPage] = useState<Page>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigateTo = useCallback((p: Page) => {
    setPage(p)
    setSidebarOpen(false)
  }, [])

  const renderPage = () => {
    switch (page) {
      case 'chat':
        return <ChatPage onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      case 'agent':
        return <AgentPage />
      case 'knowledge':
        return <KnowledgePage />
      case 'models':
        return <ModelsPage />
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} />
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
          {sidebarOpen && (
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              onNavigate={navigateTo}
            />
          )}
        </AnimatePresence>
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
      <BottomNav current={page} onNavigate={navigateTo} />
    </div>
  )
}

export default App
