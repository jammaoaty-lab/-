import './src/global.css'
import { useState, useCallback } from 'react'
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, View } from 'react-native'
import { ToastProvider } from './src/components/Toast'
import BottomNav from './src/components/BottomNav'
import Sidebar from './src/components/Sidebar'
import ChatPage from './src/pages/ChatPage'
import AgentPage from './src/pages/AgentPage'
import KnowledgePage from './src/pages/KnowledgePage'
import ModelsPage from './src/pages/ModelsPage'
import ProfilePage from './src/pages/ProfilePage'
import SettingsPage from './src/pages/SettingsPage'
import LoraPage from './src/pages/LoraPage'
import LoginPage from './src/pages/LoginPage'
import RegisterPage from './src/pages/RegisterPage'

type Page = 'chat' | 'agent' | 'knowledge' | 'models' | 'profile' | 'settings' | 'lora' | 'login' | 'register'

function AppContent() {
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
  const showNav = (isLoggedIn || isGuest) && !isAuthPage

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
        return <ChatPage onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
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
        return <ChatPage onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Sidebar
          visible={sidebarOpen && showNav}
          onClose={() => setSidebarOpen(false)}
          onNavigate={navigateTo}
        />
        <View className="flex-1">
          {renderPage()}
        </View>
        {showNav && (
          <BottomNav current={page} onNavigate={navigateTo} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
