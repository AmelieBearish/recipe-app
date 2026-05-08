import './globals.css'
import { AuthProvider } from '../components/AuthProvider'
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export const metadata = {
  title: 'もぐレピ - レシピ一覧',
  description: 'これ美味しかったから、レシピ置いとくね！',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
}
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ backgroundColor: '#FDF6F0', minHeight: '100vh' }}>
        <AuthProvider>
          <Header />
          <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px', paddingBottom: '80px' }}>
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
