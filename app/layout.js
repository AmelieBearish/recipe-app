import './globals.css'

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
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #F0E6DC', padding: '14px 20px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ fontSize: '20px', fontWeight: '600', color: '#C07048', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🍳 みんなのレシピ
            </a>
          </div>
        </header>
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
