import './globals.css'
import { AuthProvider } from '../components/AuthProvider'
import Header from '../components/Header'

export const metadata = {
  title: 'もぐレピ',
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
          <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
