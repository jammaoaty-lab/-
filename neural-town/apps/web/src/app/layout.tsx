import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/stores/auth-store';
import { ParticleProvider } from '@/stores/particle-store';

export const metadata: Metadata = {
  title: 'Neural Town 无限星河',
  description: 'AI 原生宇宙社区 - 每位创造者都有一艘星舰',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-space-deep">
        <ParticleProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'rgba(13, 17, 23, 0.95)',
                  color: '#fff',
                  border: '1px solid rgba(108, 92, 231, 0.3)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '12px',
                },
              }}
            />
          </AuthProvider>
        </ParticleProvider>
      </body>
    </html>
  );
}