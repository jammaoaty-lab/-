import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '认证 - Neural Town',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-space-deep flex items-center justify-center p-4">
      {children}
    </div>
  );
}